# =============================================
# SKHEMA DATABASE KANCAH ATE UNTUK NEON.TECH
# Jalankan ini di SQL Editor Neon.tech
# =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABLE USERS (Custom Auth - menggantikan Supabase Auth)
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
  email TEXT NOT NULL,
  name TEXT,
  gender TEXT CHECK (gender IN ('pria', 'wanita', 'lainnya')),
  age INTEGER,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  education_status TEXT,
  institution_type TEXT,
  occupation TEXT,
  location_custom TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 3. TABLE ADMIN USERS (untuk admin access)
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
  title TEXT NOT NULL UNIQUE,
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
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  category TEXT CHECK (category IN ('Keluarga', 'Karir', 'Percintaan', 'Lainnya')),
  risk_level TEXT CHECK (risk_level IN ('Rendah', 'Sedang', 'Tinggi')),
  summary TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  chat_history JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_counseling_user ON counseling_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_counseling_status ON counseling_sessions(status);

-- =============================================
-- 7-15. TABLE ASSESSMENT RESULTS (RIASEC, MBTI, BigFive, dll)
-- =============================================

-- RIASEC
CREATE TABLE IF NOT EXISTS riasec_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MBTI
CREATE TABLE IF NOT EXISTS mbti_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Big Five
CREATE TABLE IF NOT EXISTS bigfive_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VARK
CREATE TABLE IF NOT EXISTS vark_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Love Languages
CREATE TABLE IF NOT EXISTS love_language_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multiple Intelligence
CREATE TABLE IF NOT EXISTS mi_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RIMB
CREATE TABLE IF NOT EXISTS rimb_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PSS10
CREATE TABLE IF NOT EXISTS pss10_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GAD7
CREATE TABLE IF NOT EXISTS gad7_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PHQ9
CREATE TABLE IF NOT EXISTS phq9_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rosenberg
CREATE TABLE IF NOT EXISTS rosenberg_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  scores JSONB NOT NULL,
  result JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function: update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: update updated_at
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
-- INSERT DEFAULT DATA
-- =============================================

-- Default categories
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
  ('Kesehatan Mental', 'kesehatan-mental', 'Artikel tentang kesehatan mental', '🧠', '#8B5CF6', 1),
  ('Stres & Kecemasan', 'stres-kecemasan', 'Tips mengelola stres dan kecemasan', '😰', '#F97316', 2),
  ('Depresi', 'depresi', 'Informasi tentang depresi', '💔', '#EF4444', 3),
  ('Hubungan', 'hubungan', 'Tips hubungan yang sehat', '❤️', '#EC4899', 4),
  ('Karir', 'karir', 'Tips pengembangan karir', '💼', '#A855F7', 5),
  ('Self-Improvement', 'self-improvement', 'Pengembangan diri', '⭐', '#FACC15', 6)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- VIEWS (untuk query yang lebih mudah)
-- =============================================

-- View: User dengan profile
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

-- View: Articles dengan category
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
