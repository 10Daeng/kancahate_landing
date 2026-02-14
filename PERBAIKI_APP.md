# RENCANA APLIKASI KANCAH ATE

## MASALAH SAAT INI
1. **Tidak ada data tersimpan** di database Supabase
2. **Admin tidak bisa login** (Supabase Auth error)
3. **Hasil tes, riwayat curhat, artikel tidak muncul**

## OPSI PERBAIKAN

### Opsi 1: Setup Ulang Supabase (RECOMMENDED - Cepat)
**Kelebihan:**
- Tidak perlu mengubah banyak kode
- Supabase Auth sudah terintegrasi
- Hanya perlu setup database yang benar

**Langkah:**
1. Buat project baru di Supabase
2. Jalankan SQL schema dari file yang ada
3. Update environment variables
4. Selesai

### Opsi 2: Migrasi ke Neon.tech + Custom Auth
**Kekurangan:**
- Perlu mengubah banyak kode
- Perlu membuat sistem auth sendiri (JWT + bcrypt)
- Waktu implementasi lebih lama

## REKOMENDASI: Opsi 1 (Setup Ulang Supabase)

### Langkah 1: Buat Project Baru di Supabase
1. Login ke https://supabase.com/dashboard
2. Buat project baru: `kancah-ate-v2`
3. Pilih region terdekat (Singapore)

### Langkah 2: Jalankan Schema di SQL Editor
Buka file `supabase/migrations/run_all.sql` dan jalankan semua query-nya secara berurutan.

Atau jalankan satu per satu:
```sql
-- 1. Buat tabel users
-- Jalankan isi dari: supabase/migrations/create_user_profiles.sql

-- 2. Buat tabel admin
-- Jalankan isi dari: supabase/migrations/create_admin_users.sql

-- 3. Buat tabel articles
-- Jalankan isi dari: supabase/migrations/create_articles_cms.sql

-- 4. Setup user management
-- Jalankan isi dari: supabase/migrations/create_user_management.sql
```

### Langkah 3: Setup Admin User
Setelah schema jadi, jalankan ini untuk membuat admin:

```sql
-- Daftarkan dulu via email/password di Supabase Auth
-- Lalu jalankan ini untuk jadikan admin:

INSERT INTO admin_users (email, name, role, is_active, user_id)
SELECT
  au.email,
  'Admin Utama',
  'superadmin',
  true,
  au.id
FROM auth.users au
WHERE au.email = 'kancahate.official@gmail.com'
ON CONFLICT (email) DO NOTHING;
```

### Langkah 4: Update Environment Variables
Di Vercel/Hosting, update:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Langkah 5: Enable Row Level Security (RLS)
Penting: Pastikan RLS di-enable untuk setiap tabel dan policy yang benar dibuat!

## JIKA INGIN MIGRASI KE NEON.TECH (File sudah disiapkan)

File yang sudah dibuat untuk migrasi ke Neon:
- `MIGRASI_NEON.md` - Panduan lengkap
- `supabase/migrations/export_from_supabase.sql` - Script export data
- `supabase/migrations/neon_schema.sql` - Schema untuk Neon
- `src/lib/dbClient.js` - Database client untuk Neon
- `src/lib/schema.js` - Drizzle ORM schema
- `src/app/api/auth/` - API auth custom (login, register, logout)
- `drizzle.config.js` - Konfigurasi Drizzle ORM
- `.env.local.neon.template` - Template environment variables

Dependencies sudah ditambahkan:
- @neondatabase/serverless
- bcrypt
- jsonwebtoken
- drizzle-orm

## SILAHKAN PILIH OPSI:

1. **Setup Ulang Supabase** - Saya bantu jalankan schema dan setup
2. **Lanjut Migrasi ke Neon** - Saya bantu update kode yang perlu
3. **Fokus Fix Bug Dulu** - Cari perbaiki error yang ada sebelum migrasi
