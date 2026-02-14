# RENCANA MIGRASI KODE DARI SUPABASE KE NEON

## STATUS
- [x] Database Neon sudah dibuat
- [x] Schema sudah dijalankan
- [x] Admin user sudah dibuat
- [ ] KODE aplikasi perlu diupdate

## FILE PERLU DIUPDATE (22 file)

### 1. Library Supabase -> Neon
- `src/lib/supabaseClient.js` -> Sudah ada `src/lib/db.js`

### 2. Services
| File | Perubahan |
|------|-----------|
| `services/assessmentService.js` | Sudah diupdate untuk Neon |
| `services/userManagementService.js` | Perlu update: ganti Supabase dengan Neon |
| `services/articleService.js` | Perlu update: ganti Supabase dengan Neon |
| `services/assessmentAnalytics.js` | Perlu update: ganti Supabase dengan Neon |
| `services/analtyicsService.js` | Perlu update: ganti Supabase dengan Neon |
| `services/vectorService.js` | Perlu update: ganti Supabase dengan Neon |

### 3. Halaman/App
| File | Perubahan |
|------|-----------|
| `app/login/page.js` | Update: gunakan API `/api/auth/login` |
| `app/dashboard/page.js` | Update: gunakan `getUserByToken` dari db.js |
| `app/admin/dashboard/page.js` | Update: gunakan query Neon |
| `app/admin/users/page.js` | Update: gunakan query Neon |
| `app/admin/articles/page.js` | Update: gunakan query Neon |
| `app/admin/articles/new/page.js` | Update: gunakan query Neon |
| `app/admin/articles/edit/[id]/page.js` | Update: gunakan query Neon |
| `app/admin/categories/page.js` | Update: gunakan query Neon |
| `app/admin/actions.js` | Update: gunakan query Neon |
| `app/lupa-password/page.js` | Update: gunakan API reset password Neon |
| `app/reset-password/page.js` | Update: gunakan API reset password Neon |
| `app/lengkapi-profil/page.js` | Update: gunakan query Neon |
| `app/kancah-private-auth/articles/page.js` | Update: gunakan query Neon |

### 4. Components
| File | Perubahan |
|------|-----------|
| `components/chat/ChatRoomView.jsx` | Update: gunakan API chat Neon |
| `components/AdminDashboard.jsx` | Update: gunakan query Neon |
| `components/shared/Header.jsx` | Update: gunakan API auth Neon |

## PRIORITAS

### High Priority (Fitur Utama)
1. **Login/Register** - `app/login/page.js`
2. **Dashboard User** - `app/dashboard/page.js`
3. **Simpan Hasil Tes** - `services/assessmentService.js` (SUDAH)

### Medium Priority (Admin)
4. **Dashboard Admin** - `app/admin/dashboard/page.js`
5. **Manajemen User** - `services/userManagementService.js`

### Low Priority (Fitur Tambahan)
6. Artikel CMS
7. Lainnya

## LANGKAH IMPLEMENTASI

### Langkah 1: Tambah Helper Functions untuk Neon
Buat file helper untuk mengganti Supabase client:

```javascript
// src/lib/neonHelper.js
import { sql, getUserByToken } from '@/lib/db';

// Get current user from cookie
export async function getCurrentUser(cookies) {
  const token = cookies.get('auth_token')?.value;
  if (!token) return null;
  return await getUserByToken(token);
}

// Get user profile
export async function getUserProfile(userId) {
  const result = await sql`
    SELECT * FROM user_profiles WHERE user_id = ${userId}
  `;
  return result[0] || null;
}

// Save user profile
export async function saveUserProfile(userId, profileData) {
  const result = await sql`
    INSERT INTO user_profiles (user_id, name, gender, age, location, bio)
    VALUES (${userId}, ${profileData.name}, ${profileData.gender}, ${profileData.age}, ${profileData.location}, ${profileData.bio})
    ON CONFLICT (user_id) DO UPDATE SET
      name = EXCLUDED.name,
      gender = EXCLUDED.gender,
      age = EXCLUDED.age,
      location = EXCLUDED.location,
      bio = EXCLUDED.bio
  `;
  return result;
}
```

### Langkah 2: Update Login Page
Ganti:
```javascript
// DARI:
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// KE:
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { success, token, user, error } = await response.json();
```

## APALAGI YANG SUDAH DIBUAT
- [x] `src/lib/db.js` - Koneksi Neon
- [x] `src/app/api/auth/login/route.js` - API login
- [x] `src/app/api/auth/register/route.js` - API register
- [x] `src/app/api/auth/logout/route.js` - API logout
- [x] `src/services/assessmentService.js` - Sudah diupdate untuk Neon
- [x] `src/components/assessments/ShareableResult.jsx` - Perbaikan error completedAt

## PERLU DIBUAT SELANJUTNYA
1. Update login page untuk menggunakan API baru
2. Update dashboard untuk menggunakan Neon
3. Update admin dashboard untuk menggunakan Neon
