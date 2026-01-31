-- =============================================
-- USER MANAGEMENT SYSTEM
-- Untuk manajemen user, admin, dan banned users
-- =============================================

-- 1. Update admin_users table (add ban status)
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;

-- 2. Create banned_users table untuk user yang di-banned
CREATE TABLE IF NOT EXISTS banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  reason TEXT,
  banned_by UUID REFERENCES auth.users(id),
  banned_at TIMESTAMP WITH TIME TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

-- 3. Create user_roles table untuk fleksibel role management
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create audit log untuk admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for banned_users
-- Superadmin can do everything
CREATE POLICY "Superadmin full access banned_users"
ON banned_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    JOIN user_roles ur ON au.user_id = ur.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'superadmin'
    AND au.is_active = true
    AND au.banned = FALSE
  )
);

-- Everyone can read banned status
CREATE POLICY "Public can check ban status"
ON banned_users
FOR SELECT
USING (true);

-- 7. RLS Policies for user_roles
-- Superadmin can do everything
CREATE POLICY "Superadmin full access user_roles"
ON user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'superadmin'
    AND ur.is_active = true
  )
);

-- Everyone can read roles
CREATE POLICY "Public can read roles"
ON user_roles
FOR SELECT
USING (true);

-- 8. RLS Policies for admin_audit_log
-- Only superadmin can read audit log
CREATE POLICY "Superadmin can read audit_log"
ON admin_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'superadmin'
    AND ur.is_active = true
  )
);

-- Only superadmin can insert audit log
CREATE POLICY "Superadmin can insert audit_log"
ON admin_audit_log
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'superadmin'
    AND ur.is_active = true
  )
);

-- 9. Updated_at trigger for user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION update_articles_updated_at();

-- 10. Helper functions

-- Check if current user is admin and not banned
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
    AND au.is_active = true
    AND au.banned = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check admin_users first
  SELECT role INTO user_role
  FROM admin_users au
  WHERE au.user_id = auth.uid()
    AND au.is_active = true
    AND au.banned = FALSE;

  -- If not admin, check user_roles
  IF user_role IS NULL THEN
    SELECT role INTO user_role
    FROM user_roles
    WHERE user_id = auth.uid()
      AND is_active = true;
  END IF;

  -- Default to user
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if specific user is admin
CREATE OR REPLACE FUNCTION check_user_is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = user_id
    AND au.is_active = true
    AND au.banned = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Function to add user role (for superadmin)
CREATE OR REPLACE FUNCTION add_user_role(
  target_user_id UUID,
  new_role TEXT,
  admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  existing_role TEXT;
BEGIN
  -- Get existing role
  SELECT role INTO existing_role
  FROM user_roles
  WHERE user_id = target_user_id;

  -- If role exists, update it
  IF existing_role IS NOT NULL THEN
    UPDATE user_roles
    SET role = new_role,
        updated_at = NOW(),
        assigned_by = admin_id
    WHERE user_id = target_user_id;

    INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
    VALUES (
      admin_id,
      'update_role',
      target_user_id,
      jsonb_build_object(
        'old_role', existing_role,
        'new_role', new_role
      )
    );
  ELSE
    -- Insert new role
    INSERT INTO user_roles (user_id, email, role, assigned_by)
    SELECT
      target_user_id,
      email,
      new_role,
      admin_id;

    INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
    VALUES (
      admin_id,
      'assign_role',
      target_user_id,
      jsonb_build_object('role', new_role)
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'role', new_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Function to ban/unban user
CREATE OR REPLACE FUNCTION ban_user(
  target_user_id UUID,
  ban_reason TEXT,
  admin_id UUID
)
RETURNS JSONB AS $$
BEGIN
  -- Update admin_users
  UPDATE admin_users
  SET banned = TRUE,
      ban_reason = ban_reason,
      banned_at = NOW()
  WHERE user_id = target_user_id;

  IF FOUND THEN
    INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
    VALUES (
      admin_id,
      'ban_admin',
      target_user_id,
      jsonb_build_object('reason', ban_reason)
    );
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION unban_user(
  target_user_id UUID,
  admin_id UUID
)
RETURNS JSONB AS $$
BEGIN
  -- Update admin_users
  UPDATE admin_users
  SET banned = FALSE,
      ban_reason = NULL,
      banned_at = NULL
  WHERE user_id = target_user_id;

  IF FOUND THEN
    INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
    VALUES (
      admin_id,
      'unban_admin',
      target_user_id,
      jsonb_build_object('action', 'User unbanned')
    );
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Function to ban regular user
CREATE OR REPLACE FUNCTION ban_regular_user(
  target_user_id UUID,
  ban_reason TEXT,
  admin_id UUID
)
RETURNS JSONB AS $$
BEGIN
  -- Add to banned_users table
  INSERT INTO banned_users (user_id, email, reason, banned_by)
  SELECT
    target_user_id,
    email,
    ban_reason,
    admin_id
  FROM auth.users
  WHERE id = target_user_id;

  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    admin_id,
    'ban_user',
    target_user_id,
    jsonb_build_object('reason', ban_reason)
  );

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION unban_regular_user(
  target_user_id UUID,
  admin_id UUID
)
RETURNS JSONB AS $$
BEGIN
  DELETE FROM banned_users
  WHERE user_id = target_user_id;

  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    admin_id,
    'unban_user',
    target_user_id,
    jsonb_build_object('action', 'User unbanned')
  );

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. View untuk list users dengan info lengkap
CREATE OR REPLACE VIEW users_list AS
SELECT
  u.id,
  u.email,
  u.created_at as joined_at,
  u.last_sign_in_at,
  u.email_confirmed_at,
  up.name,
  up.gender,
  up.age,
  up.location,
  ur.role,
  CASE
    WHEN au.banned = true THEN 'banned'
    WHEN bu.user_id IS NOT NULL THEN 'banned'
    ELSE 'active'
  END as status,
  au.is_active as admin_active,
  au.role as admin_role,
  au.banned_at,
  bu.reason as ban_reason
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
LEFT JOIN admin_users au ON u.id = au.user_id
LEFT JOIN banned_users bu ON u.id = bu.user_id
ORDER BY u.created_at DESC;

-- 15. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON users_list TO authenticated;
