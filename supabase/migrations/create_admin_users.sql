-- =============================================
-- ADMIN USERS TABLE
-- Untuk manajemen admin yang lebih fleksibel
-- =============================================

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Hanya admin yang bisa read daftar admin
CREATE POLICY "Admins can read admin list"
  ON admin_users
  FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true)
  );

-- Hanya superadmin yang bisa manage admin
CREATE POLICY "Superadmins can manage admins"
  ON admin_users
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'superadmin' AND is_active = true)
  );

-- 4. Updated_at trigger
CREATE TRIGGER update_admin_users_timestamp
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

-- 5. Insert default admin (ganti dengan email Anda)
-- PENTING: Jalankan ini setelah user sudah register
INSERT INTO admin_users (email, name, role, is_active) VALUES
  ('lenterabatin.id@gmail.com', 'Admin Utama', 'superadmin', true)
ON CONFLICT (email) DO NOTHING;

-- 6. Function to check if user is admin
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

-- 7. Function to get admin role
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

-- =============================================
-- CARA MENAMBAH ADMIN BARU:
-- 
-- INSERT INTO admin_users (email, name, role) VALUES
--   ('newemail@example.com', 'Nama Admin', 'admin');
--
-- ROLES:
-- - superadmin: Full access, bisa manage admin lain
-- - admin: Access ke admin dashboard
-- - moderator: Limited access (untuk masa depan)
-- =============================================
