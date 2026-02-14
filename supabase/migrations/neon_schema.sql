-- =============================================
-- SKEMA DATABASE UNTUK NEON.TECH
-- Jalankan ini di Neon SQL Editor setelah membuat database baru
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security (RLS) tidak diperlukan di Neon jika tidak menggunakan Supabase Auth
-- Kita akan menggunakan sistem auth custom

-- =============================================
-- 1. TABLE USERS (Custom Auth Table)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  reset_password_token TEXT,
  reset_password_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =============================================
-- 2. TABLE USER PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  name TEXT,
  gender TEXT CHECK (gender IN ('pria', 'wanita', 'lainnya')),
  age INTEGER,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 3. TABLE ADMIN USERS (Legacy, bisa dihapus nanti)
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. TABLE CATEGORIES
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. TABLE ARTICLES
-- =============================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  cover_image TEXT,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

-- =============================================
-- 6. TABLE COUNSELING SESSIONS
-- =============================================
CREATE TABLE IF NOT EXISTS counseling_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('Keluarga', 'Karir', 'Percintaan', 'Lainnya')),
  risk_level TEXT CHECK (risk_level IN ('Rendah', 'Sedang', 'Tinggi')),
  summary TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  chat_history JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counseling_user ON counseling_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_counseling_status ON counseling_sessions(status);

-- =============================================
-- 7. TABLE RIASEC RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS riasec_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. TABLE MBTI RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS mbti_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. TABLE BIGFIVE RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS bigfive_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 10. TABLE VARK RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS vark_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 11. TABLE LOVE LANGUAGE RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS love_language_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 12. TABLE MI RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS mi_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 13. TABLE RIMB RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS rimb_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 14. TABLE PSS10 RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS pss10_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 15. TABLE GAD7 RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS gad7_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 16. TABLE PHQ9 RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS phq9_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 17. TABLE ROSENBERG RESULTS
-- =============================================
CREATE TABLE IF NOT EXISTS rosenberg_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 18. FUNCTION: Update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 19. TRIGGERS: Auto update updated_at
-- =============================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counseling_sessions_updated_at BEFORE UPDATE ON counseling_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 20. INSERT DEFAULT ADMIN USER
-- =============================================
-- Password hash untuk 'Admin123!' (gunakan bcrypt di aplikasi)
-- Ini hanya placeholder, ganti dengan hash yang benar
INSERT INTO users (email, password_hash, name, role, is_active, email_verified) VALUES
('kancahate.official@gmail.com', 'PLACEHOLDER_BCRYPT_HASH', 'Admin Utama', 'superadmin', true, true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO admin_users (email, name, role, is_active, user_id) VALUES
('kancahate.official@gmail.com', 'Admin Utama', 'superadmin', true,
  (SELECT id FROM users WHERE email = 'kancahate.official@gmail.com' LIMIT 1)
)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- 21. VIEWS: Untuk query yang lebih mudah
-- =============================================

-- View: Users dengan profil
CREATE OR REPLACE VIEW users_with_profile AS
SELECT
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_active,
  u.email_verified,
  u.created_at,
  up.gender,
  up.age,
  up.location,
  up.bio,
  up.avatar_url
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id;

-- View: Articles dengan kategori
CREATE OR REPLACE VIEW articles_with_category AS
SELECT
  a.id,
  a.title,
  a.slug,
  a.excerpt,
  a.status,
  a.view_count,
  a.cover_image,
  a.tags,
  a.published_at,
  a.created_at,
  a.updated_at,
  c.name as category_name,
  c.slug as category_slug,
  c.color as category_color,
  u.name as author_name,
  u.email as author_email
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN users u ON a.author_id = u.id;
