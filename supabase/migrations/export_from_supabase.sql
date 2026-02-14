-- =============================================
-- EKSPOR DATA DARI SUPABASE
-- Jalankan ini di Supabase SQL Editor untuk ekspor semua data
-- =============================================

-- Ekspor semua data dalam format INSERT statement

-- 1. EKSPOR ADMIN USERS
\copy (admin_users) TO 'admin_users.csv' WITH (FORMAT 'csv', HEADER);

-- 2. EKSPOR USER PROFILES
\copy (user_profiles) TO 'user_profiles.csv' WITH (FORMAT 'csv', HEADER);

-- 3. EKSPOR ARTICLES
\copy (articles) TO 'articles.csv' WITH (FORMAT 'csv', HEADER);

-- 4. EKSPOR CATEGORIES
\copy (categories) TO 'categories.csv' WITH (FORMAT 'csv', HEADER);

-- 5. EKSPOR RIASEC RESULTS
\copy (riasec_results) TO 'riasec_results.csv' WITH (FORMAT 'csv', HEADER);

-- 6. EKSPOR MBTI RESULTS
\copy (mbti_results) TO 'mbti_results.csv' WITH (FORMAT 'csv', HEADER);

-- 7. EKSPOR BIGFIVE RESULTS
\copy (bigfive_results) TO 'bigfive_results.csv' WITH (FORMAT 'csv', HEADER);

-- 8. EKSPOR VARK RESULTS
\copy (vark_results) TO 'vark_results.csv' WITH (FORMAT 'csv', HEADER);

-- 9. EKSPOR LOVE LANGUAGE RESULTS
\copy (love_language_results) TO 'love_language_results.csv' WITH (FORMAT 'csv', HEADER);

-- 10. EKSPOR MI RESULTS
\copy (mi_results) TO 'mi_results.csv' WITH (FORMAT 'csv', HEADER);

-- 11. EKSPOR RIMB RESULTS
\copy (rimb_results) TO 'rimb_results.csv' WITH (FORMAT 'csv', HEADER);

-- 12. EKSPOR PSS10 RESULTS
\copy (pss10_results) TO 'pss10_results.csv' WITH (FORMAT 'csv', HEADER);

-- 13. EKSPOR GAD7 RESULTS
\copy (gad7_results) TO 'gad7_results.csv' WITH (FORMAT 'csv', HEADER);

-- 14. EKSPOR PHQ9 RESULTS
\copy (phq9_results) TO 'phq9_results.csv' WITH (FORMAT 'csv', HEADER);

-- 15. EKSPOR ROSENBERG RESULTS
\copy (rosenberg_results) TO 'rosenberg_results.csv' WITH (FORMAT 'csv', HEADER);

-- =============================================
-- ATAU: Gunakan query ini untuk mendapatkan semua data sebagai JSON
-- =============================================

-- Get all admin users
SELECT jsonb_agg(admin_users) FROM admin_users;

-- Get all user profiles
SELECT jsonb_agg(user_profiles) FROM user_profiles;

-- Get all articles
SELECT jsonb_agg(articles) FROM articles;

-- Get all categories
SELECT jsonb_agg(categories) FROM categories;
