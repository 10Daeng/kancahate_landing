-- =============================================
-- CMS ARTICLES SCHEMA
-- Kancah Ate - Content Management System
-- =============================================

-- 1. Article Categories Table
CREATE TABLE IF NOT EXISTS article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#8B5CF6', -- Default violet
  icon TEXT DEFAULT '📚',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT, -- Short description for cards
  content TEXT NOT NULL, -- Main content (HTML or Markdown)
  
  -- Media
  featured_image_url TEXT,
  
  -- Categorization
  category_id UUID REFERENCES article_categories(id) ON DELETE SET NULL,
  tags TEXT[], -- Array of tags
  
  -- Author (linked to admin)
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'Tim Kancah Ate',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- 4. Enable RLS
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Categories
-- Anyone can read categories
CREATE POLICY "Anyone can read categories"
  ON article_categories
  FOR SELECT
  USING (true);

-- Only admin can manage categories (insert, update, delete)
CREATE POLICY "Admin can manage categories"
  ON article_categories
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email = 'lenterabatin.id@gmail.com'
    )
  );

-- 6. RLS Policies for Articles
-- Anyone can read published articles
CREATE POLICY "Anyone can read published articles"
  ON articles
  FOR SELECT
  USING (status = 'published' OR auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE email = 'lenterabatin.id@gmail.com'
  ));

-- Only admin can manage articles
CREATE POLICY "Admin can manage articles"
  ON articles
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email = 'lenterabatin.id@gmail.com'
    )
  );

-- 7. Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Triggers
CREATE TRIGGER update_articles_timestamp
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

CREATE TRIGGER update_categories_timestamp
  BEFORE UPDATE ON article_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

-- 9. Insert Default Categories
INSERT INTO article_categories (name, slug, description, color, icon) VALUES
  ('Kesehatan Mental', 'kesehatan-mental', 'Artikel tentang kesehatan mental dan well-being', '#8B5CF6', '🧠'),
  ('Tips & Trik', 'tips-trik', 'Tips praktis untuk kehidupan sehari-hari', '#F59E0B', '💡'),
  ('Cerita Inspiratif', 'cerita-inspiratif', 'Kisah-kisah yang menginspirasi', '#10B981', '✨'),
  ('Edukasi', 'edukasi', 'Konten edukatif seputar psikologi', '#3B82F6', '📖'),
  ('Karir', 'karir', 'Panduan karir dan pengembangan diri', '#EC4899', '💼')
ON CONFLICT (slug) DO NOTHING;

-- 10. Function to increment view count
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
