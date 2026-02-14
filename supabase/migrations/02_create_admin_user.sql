-- =============================================
-- BUAT ADMIN USER PERTAMA DI NEON
-- Jalankan ini di Neon SQL Editor
-- =============================================

-- 1. Buat user admin dengan password hash yang sudah digenerate
-- Password default: Admin123!
-- Hash dihasilkan dari bcrypt (10 rounds)
INSERT INTO users (email, password_hash, name, role, is_active, email_verified)
VALUES (
  'kancahate.official@gmail.com',
  '$2b$10$jNIRcDM63ogfRMHsfMAlOe7mrtvRK1mdyMCGL.OJUj.xULfu5kb1q',
  'Admin Utama',
  'superadmin',
  true,
  true
);

-- 2. Buat record di admin_users
INSERT INTO admin_users (email, name, role, is_active, user_id)
SELECT
  'kancahate.official@gmail.com',
  'Admin Utama',
  'superadmin',
  true,
  (SELECT id FROM users WHERE email = 'kancahate.official@gmail.com' LIMIT 1)
ON CONFLICT (email) DO NOTHING;

-- SELESAI! Sekarang Anda bisa login dengan:
-- Email: kancahate.official@gmail.com
-- Password: Admin123!
--
-- JANGAN LUPA: Ganti password segera setelah login pertama!
