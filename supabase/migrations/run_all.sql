-- =============================================
-- KANCAH ATE - COMPLETE MIGRATION
-- Safe to run multiple times
-- =============================================

-- 1. FUNCTIONS (Create/Replace first)
-- =============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for updated_at (articles)
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = lower(check_email)
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin role
CREATE OR REPLACE FUNCTION get_admin_role(check_email TEXT)
RETURNS TEXT AS $$
DECLARE
  admin_role TEXT;
BEGIN
  SELECT role INTO admin_role
  FROM admin_users
  WHERE email = lower(check_email)
  AND is_active = true;

  RETURN admin_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is admin
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
  SELECT role INTO user_role
  FROM admin_users au
  WHERE au.user_id = auth.uid()
    AND au.is_active = true
    AND au.banned = FALSE;

  IF user_role IS NULL THEN
    SELECT role INTO user_role
    FROM user_roles
    WHERE user_id = auth.uid()
      AND is_active = true;
  END IF;

  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add user role
CREATE OR REPLACE FUNCTION add_user_role(
  target_user_id UUID,
  new_role TEXT,
  admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  existing_role TEXT;
BEGIN
  SELECT role INTO existing_role FROM user_roles WHERE user_id = target_user_id;

  IF existing_role IS NOT NULL THEN
    UPDATE user_roles
    SET role = new_role, updated_at = NOW(), assigned_by = admin_id
    WHERE user_id = target_user_id;
    INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
    VALUES (admin_id, 'update_role', target_user_id, jsonb_build_object('old_role', existing_role, 'new_role', new_role));
  ELSE
    INSERT INTO user_roles (user_id, email, role, assigned_by)
    SELECT target_user_id, email, new_role, admin_id FROM auth.users WHERE id = target_user_id;
    INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
    VALUES (admin_id, 'assign_role', target_user_id, jsonb_build_object('role', new_role));
  END IF;

  RETURN jsonb_build_object('success', true, 'role', new_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ban admin function
CREATE OR REPLACE FUNCTION ban_user(
  target_user_id UUID,
  ban_reason TEXT,
  admin_id UUID
)
RETURNS JSONB AS $$
BEGIN
  UPDATE admin_users
  SET banned = TRUE, ban_reason = ban_reason, banned_at = NOW()
  WHERE user_id = target_user_id;

  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (admin_id, 'ban_admin', target_user_id, jsonb_build_object('reason', ban_reason));

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unban admin function
CREATE OR REPLACE FUNCTION unban_user(
  target_user_id UUID,
  admin_id UUID
)
RETURNS JSONB AS $$
BEGIN
  UPDATE admin_users
  SET banned = FALSE, ban_reason = NULL, banned_at = NULL
  WHERE user_id = target_user_id;

  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (admin_id, 'unban_admin', target_user_id, jsonb_build_object('action', 'User unbanned'));

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ban regular user function
CREATE OR REPLACE FUNCTION ban_regular_user(
  target_user_id UUID,
  ban_reason TEXT,
  admin_id UUID
)
RETURNS JSONB AS $$
BEGIN
  INSERT INTO banned_users (user_id, email, reason, banned_by)
  SELECT target_user_id, email, ban_reason, admin_id FROM auth.users WHERE id = target_user_id
  ON CONFLICT (user_id) DO UPDATE SET reason = ban_reason, banned_by = admin_id;

  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (admin_id, 'ban_user', target_user_id, jsonb_build_object('reason', ban_reason));

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unban regular user function
CREATE OR REPLACE FUNCTION unban_regular_user(
  target_user_id UUID,
  admin_id UUID
)
RETURNS JSONB AS $$
BEGIN
  DELETE FROM banned_users WHERE user_id = target_user_id;

  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (admin_id, 'unban_user', target_user_id, jsonb_build_object('action', 'User unbanned'));

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. TABLES
-- =============================================

-- user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT,
  dob DATE,
  age INTEGER,
  education_status TEXT,
  institution_type TEXT,
  occupation TEXT,
  location TEXT,
  location_custom TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- banned_users table
CREATE TABLE IF NOT EXISTS banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  reason TEXT,
  banned_by UUID REFERENCES auth.users(id),
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

-- user_roles table
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

-- admin_audit_log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- article_categories table
CREATE TABLE IF NOT EXISTS article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#8B5CF6',
  icon TEXT DEFAULT '📚',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  category_id UUID REFERENCES article_categories(id) ON DELETE SET NULL,
  tags TEXT[],
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'Tim Kancah Ate',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title TEXT,
  meta_description TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);


-- 4. RLS (Enable)
-- =============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;


-- 5. RLS POLICIES (Drop and recreate)
-- =============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public read profiles" ON user_profiles;

DROP POLICY IF EXISTS "Admins can read admin list" ON admin_users;
DROP POLICY IF EXISTS "Superadmins can manage admins" ON admin_users;

DROP POLICY IF EXISTS "Superadmin full access banned_users" ON banned_users;
DROP POLICY IF EXISTS "Public can check ban status" ON banned_users;

DROP POLICY IF EXISTS "Superadmin full access user_roles" ON user_roles;
DROP POLICY IF EXISTS "Public can read roles" ON user_roles;

DROP POLICY IF EXISTS "Superadmin can read audit_log" ON admin_audit_log;
DROP POLICY IF EXISTS "Superadmin can insert audit_log" ON admin_audit_log;

DROP POLICY IF EXISTS "Anyone can read categories" ON article_categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON article_categories;

DROP POLICY IF EXISTS "Anyone can read published articles" ON articles;
DROP POLICY IF EXISTS "Admin can manage articles" ON articles;

-- Recreate policies

-- user_profiles policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public read profiles" ON user_profiles FOR SELECT USING (true);

-- admin_users policies
CREATE POLICY "Admins can read admin list"
  ON admin_users
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true));

CREATE POLICY "Superadmins can manage admins"
  ON admin_users
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'superadmin' AND is_active = true AND banned = FALSE)
  );

-- banned_users policies
CREATE POLICY "Public can check ban status"
  ON banned_users
  FOR SELECT
  USING (true);

CREATE POLICY "Superadmin full access banned_users"
  ON banned_users
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'superadmin' AND is_active = true AND banned = FALSE)
  );

-- user_roles policies
CREATE POLICY "Public can read roles"
  ON user_roles
  FOR SELECT
  USING (true);

CREATE POLICY "Superadmin full access user_roles"
  ON user_roles
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'superadmin' AND is_active = true AND banned = FALSE)
  );

-- admin_audit_log policies
CREATE POLICY "Superadmin can read audit_log"
  ON admin_audit_log
  FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'superadmin' AND is_active = true AND banned = FALSE)
  );

CREATE POLICY "Superadmin can insert audit_log"
  ON admin_audit_log
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'superadmin' AND is_active = true AND banned = FALSE)
  );

-- article_categories policies
CREATE POLICY "Anyone can read categories"
  ON article_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage categories"
  ON article_categories
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true AND banned = FALSE)
  );

-- articles policies
CREATE POLICY "Anyone can read published articles"
  ON articles
  FOR SELECT
  USING (status = 'published' OR auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true AND banned = FALSE));

CREATE POLICY "Admin can manage articles"
  ON articles
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true AND banned = FALSE)
  );


-- 6. TRIGGERS
-- =============================================
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_admin_users_timestamp ON admin_users;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
DROP TRIGGER IF EXISTS update_articles_timestamp ON articles;
DROP TRIGGER IF EXISTS update_categories_timestamp ON article_categories;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_timestamp
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

CREATE TRIGGER update_articles_timestamp
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

CREATE TRIGGER update_categories_timestamp
  BEFORE UPDATE ON article_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();


-- 7. VIEWS
-- =============================================
DROP VIEW IF EXISTS users_list CASCADE;

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


-- 8. DEFAULT DATA
-- =============================================

-- Insert default admin (GANTI EMAIL DENGAN EMAIL ANDA)
INSERT INTO admin_users (email, name, role, is_active) VALUES
  ('lenterabatin.id@gmail.com', 'Admin Utama', 'superadmin', true)
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Insert Default Categories
INSERT INTO article_categories (name, slug, description, color, icon) VALUES
  ('Kesehatan Mental', 'kesehatan-mental', 'Artikel tentang kesehatan mental dan well-being', '#8B5CF6', '🧠'),
  ('Tips & Trik', 'tips-trik', 'Tips praktis untuk kehidupan sehari-hari', '#F59E0B', '💡'),
  ('Cerita Inspiratif', 'cerita-inspiratif', 'Kisah-kisah yang menginspirasi', '#10B981', '✨'),
  ('Edukasi', 'edukasi', 'Konten edukatif seputar psikologi', '#3B82F6', '📖'),
  ('Karir', 'karir', 'Panduan karir dan pengembangan diri', '#EC4899', '💼')
ON CONFLICT (slug) DO NOTHING;


-- 9. GRANT PERMISSIONS
-- =============================================
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON users_list TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION ban_user TO authenticated;
GRANT EXECUTE ON FUNCTION unban_user TO authenticated;
GRANT EXECUTE ON FUNCTION ban_regular_user TO authenticated;
GRANT EXECUTE ON FUNCTION unban_regular_user TO authenticated;
GRANT EXECUTE ON FUNCTION increment_article_views TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
END;
$$;
