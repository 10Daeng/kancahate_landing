# PANDUAN MIGRASI DARI SUPABASE KE NEON TECH

## Langkah 1: Ekspor Data dari Supabase

1. Login ke dashboard Supabase
2. Masuk ke SQL Editor
3. Jalankan query ini untuk ekspor semua data ke CSV:

```sql
-- Ekspor semua data
\copy (admin_users) TO 'admin_users.csv' WITH (FORMAT 'csv', HEADER);
\copy (user_profiles) TO 'user_profiles.csv' WITH (FORMAT 'csv', HEADER);
\copy (articles) TO 'articles.csv' WITH (FORMAT 'csv', HEADER);
\copy (categories) TO 'categories.csv' WITH (FORMAT 'csv', HEADER);
\copy (counseling_sessions) TO 'counseling_sessions.csv' WITH (FORMAT 'csv', HEADER);
\copy (riasec_results) TO 'riasec_results.csv' WITH (FORMAT 'csv', HEADER);
\copy (mbti_results) TO 'mbti_results.csv' WITH (FORMAT 'csv', HEADER);
\copy (bigfive_results) TO 'bigfive_results.csv' WITH (FORMAT 'csv', HEADER);
\copy (vark_results) TO 'vark_results.csv' WITH (FORMAT 'csv', HEADER);
\copy (love_language_results) TO 'love_language_results.csv' WITH (FORMAT 'csv', HEADER);
\copy (mi_results) TO 'mi_results.csv' WITH (FORMAT 'csv', HEADER);
\copy (rimb_results) TO 'rimb_results.csv' WITH (FORMAT 'csv', HEADER);
\copy (pss10_results) TO 'pss10_results.csv' WITH (FORMAT 'csv', HEADER);
\copy (gad7_results) TO 'gad7_results.csv' WITH (FORMAT 'csv', HEADER);
\copy (phq9_results) TO 'phq9_results.csv' WITH (FORMAT 'csv', HEADER);
\copy (rosenberg_results) TO 'rosenberg_results.csv' WITH (FORMAT 'csv', HEADER);
```

Download semua file CSV yang dihasilkan.

## Langkah 2: Buat Database Baru di Neon Tech

1. Login ke dashboard Neon.tech
2. Buat project baru atau pilih existing project
3. Buka SQL Editor di Neon
4. Jalankan skema dari file `supabase/migrations/neon_schema.sql`

## Langkah 3: Import Data ke Neon

1. Di Neon SQL Editor, jalankan perintah COPY untuk setiap tabel:

```sql
-- Contoh format import (sesuaikan dengan CSV yang diekspor)
COPY admin_users(id, user_id, email, name, role, is_active, banned, ban_reason, banned_at, created_at, updated_at)
FROM '/path/ke/admin_users.csv' DELIMITER ',' CSV HEADER;

COPY user_profiles(id, user_id, name, gender, age, location, bio, avatar_url, created_at, updated_at)
FROM '/path/ke/user_profiles.csv' DELIMITER ',' CSV HEADER;

-- Dan seterusnya untuk setiap tabel...
```

**CATATAN**: Format CSV perlu disesuaikan dengan hasil ekspor dari Supabase.

## Langkah 4: Setup Environment Variables

1. Copy file `.env.local.neon.template`
2. Rename menjadi `.env.local`
3. Isi nilai berikut:
   - `NEXT_PUBLIC_NEON_DATABASE_URL`: Dapatkan dari dashboard Neon
   - `NEXT_PUBLIC_JWT_SECRET`: Buat secret key baru yang kuat
   - `NEXT_PUBLIC_ADMIN_EMAILS`: Email admin yang sudah didaftarkan di Supabase

## Langkah 5: Import Password Hash dari Supabase

Karena password sudah di-hash di Supabase, kita perlu mengimpor user lengkap dengan password hash:

1. Di Supabase SQL Editor, jalankan:

```sql
SELECT
  u.id,
  u.email,
  u.password_hash,
  u.name,
  u.role,
  u.is_active,
  u.email_verified,
  up.gender,
  up.age,
  up.location,
  up.bio,
  up.avatar_url
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id;
```

2. Copy hasil dan buat CSV dengan kolom-kolom tersebut
3. Import ke tabel `users` di Neon

## Langkah 6: Register Admin User

Login pertama kali dengan email admin yang terdaftar di environment variable:
- Email: `kancahate.official@gmail.com`
- Password: `Admin123!` (default, ganti segera setelah login berhasil)

Setelah login, segera ganti password di menu profil!

## Langkah 7: Testing

1. Install dependencies baru:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Test login di http://localhost:3000/login

## Langkah 8: Deploy

Setelah yakin semua berfungsi di lokal:

1. Update environment variables di Vercel:
   - Hapus semua env Supabase
   - Tambah env Neon baru
   - Tambah `NEXT_PUBLIC_JWT_SECRET`

2. Deploy ulang:
```bash
npm run build
vercel --prod
```

## PERUBAHAN KODE YANG PERLU DILAKUKAN

Setelah migrasi, update file berikut untuk menggunakan auth baru:

### 1. Update `/src/app/login/page.js`
- Ganti `supabase.auth.signInWithPassword` dengan API call ke `/api/auth/login`
- Ganti `supabase.auth.signUp` dengan API call ke `/api/auth/register`

### 2. Update `/src/lib/supabaseClient.js` atau buat file baru
- File ini sekarang hanya wrapper untuk backward compatibility
- Fungsi auth utama ada di `/src/lib/dbClient.js`

### 3. Update semua file yang menggunakan `supabase.auth`
- Cari: `supabase.auth.getUser()`
- Ganti dengan: API call ke `/api/auth/me`

## CATATAN PENTING

1. **BACKUP DULU**: Sebelum melakukan apa pun, backup seluruh database Supabase!
2. **TEST DI LOKAL**: Pastikan semua berfungsi di local sebelum deploy
3. **PASSWORD ADMIN**: Default password untuk admin ada di schema, ganti segera setelah login pertama!
4. **JWT SECRET**: Gunakan secret key yang kuat dan random di production!
