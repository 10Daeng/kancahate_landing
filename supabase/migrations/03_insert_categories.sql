-- =============================================
-- INSERT DEFAULT CATEGORIES
-- Jalankan ini di Neon SQL Editor
-- =============================================

INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
  ('Kesehatan Mental', 'kesehatan-mental', 'Artikel tentang kesehatan mental', '🧠', '#8B5CF6', 1),
  ('Stres & Kecemasan', 'stres-kecemasan', 'Tips mengelola stres dan kecemasan', '😰', '#F97316', 2),
  ('Depresi', 'depresi', 'Informasi tentang depresi', '💔', '#EF4444', 3),
  ('Hubungan', 'hubungan', 'Tips hubungan yang sehat', '❤️', '#EC4899', 4),
  ('Karir', 'karir', 'Tips pengembangan karir', '💼', '#A855F7', 5),
  ('Self-Improvement', 'self-improvement', 'Pengembangan diri', '⭐', '#FACC15', 6)
ON CONFLICT (name) DO NOTHING;
