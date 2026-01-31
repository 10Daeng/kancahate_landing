# 📚 Panduan Lengkap: Membangun Aplikasi Kancah Ate dari Nol

**Dokumentasi Step-by-Step untuk Membangun Platform Kesehatan Mental dengan Antigravity & AI Agent**

---

## 📋 Daftar Isi

1. [Overview & Prerequisites](#1-overview--prerequisites)
2. [Fase 1: Planning & Desain](#fase-1-planning--desain)
3. [Fase 2: Setup Project](#fase-2-setup-project)
4. [Fase 3: Backend (Supabase)](#fase-3-backend-supabase)
5. [Fase 4: Frontend Implementation](#fase-4-frontend-implementation)
6. [Fase 5: Fitur Utama](#fase-5-fitur-utama)
7. [Fase 6: Testing & QA](#fase-6-testing--qa)
8. [Fase 7: Deployment](#fase-7-deployment)
9. [Fase 8: Post-Launch](#fase-8-post-launch)
10. [Tips & Best Practices](#tips--best-practices)

---

## 1. Overview & Prerequisites

### Apa yang Akan Dibangun

**Kancah Ate** adalah platform kesehatan mental untuk remaja Indonesia dengan fitur:
- 💬 AI Chatbot (Kai) untuk curhat
- 📊 10+ Tes Psikologi
- 📚 CMS Artikel (Ruang Baca)
- 👤 User Dashboard
- 🔐 Admin Dashboard
- 📱 PWA (Progressive Web App)

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, React, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| AI | Google Gemini API |
| Animation | Framer Motion |
| Deployment | Vercel |
| IDE | Antigravity (AI Coding Agent) |
| Design | Stitch (UI Generation) |

### Prerequisites

Sebelum memulai, siapkan:

1. **Akun yang Diperlukan:**
   - [ ] GitHub account
   - [ ] Supabase account (https://supabase.com)
   - [ ] Vercel account (https://vercel.com)
   - [ ] Google AI Studio account (untuk Gemini API)
   - [ ] Domain (opsional, bisa pakai .vercel.app)

2. **Software:**
   - [ ] Node.js 18+ terinstall
   - [ ] Git terinstall
   - [ ] Antigravity IDE terinstall
   - [ ] Browser modern (Chrome/Firefox/Safari)

3. **API Keys yang Dibutuhkan:**
   - [ ] Google Gemini API Key
   - [ ] Supabase URL & Anon Key

---

## Fase 1: Planning & Desain

### 1.1 Definisikan Scope Aplikasi

**Prompt untuk Agent:**
```
Saya ingin membuat aplikasi kesehatan mental untuk remaja Indonesia bernama "Kancah Ate". 
Aplikasi ini harus memiliki fitur:
1. AI Chatbot untuk curhat (seperti therapist virtual)
2. Berbagai tes psikologi (Big Five, MBTI, GAD-7, dll)
3. Artikel/blog untuk edukasi kesehatan mental
4. Dashboard user untuk melihat riwayat
5. Admin dashboard untuk monitoring

Target user: Remaja usia 12-19 tahun, bahasa Indonesia.

Tolong buatkan:
1. User flow diagram
2. Daftar halaman yang dibutuhkan
3. Database schema
4. Estimasi timeline development
```

### 1.2 Design UI dengan Stitch

**Prompt untuk Stitch (UI Generation):**
```
Buatkan desain landing page untuk aplikasi kesehatan mental remaja dengan:
- Nama: Kancah Ate
- Style: Modern, friendly, Gen-Z aesthetic
- Color: Violet (#8B5CF6) sebagai primary, Orange (#F97316) sebagai accent
- Sections: Hero, Features, Testimonials, CTA
- Mobile-first design
- Include illustrations yang cheerful dan relatable untuk remaja
```

**Prompt untuk komponen-komponen:**
```
Buatkan desain untuk:
1. Chat interface dengan AI (mirip WhatsApp tapi lebih colorful)
2. Card untuk menampilkan tes psikologi
3. Header navigation dengan "Mulai Curhat" button
4. User dashboard dengan riwayat chat dan hasil tes
```

### 1.3 Finalisasi Feature List

**Dokumen yang Harus Dibuat:**

```markdown
# Feature Specification - Kancah Ate

## Phase 1 (MVP)
- [ ] Landing page
- [ ] User authentication (email/password)
- [ ] AI Chat dengan Kai
- [ ] 3 tes psikologi dasar (Big Five, GAD-7, PSS-10)
- [ ] User dashboard sederhana

## Phase 2
- [ ] 7+ tes psikologi tambahan
- [ ] Admin dashboard
- [ ] CMS artikel
- [ ] Text-to-Speech

## Phase 3
- [ ] User profile onboarding
- [ ] Chat history detail
- [ ] Advanced analytics
```

---

## Fase 2: Setup Project

### 2.1 Inisialisasi Project Next.js

**Prompt untuk Agent:**
```
Buatkan project Next.js baru dengan konfigurasi:
- Next.js 14 dengan App Router
- Tailwind CSS untuk styling
- PWA support
- ESLint untuk code quality
- Framer Motion untuk animasi

Nama project: kancahate_landing
```

**Manual Command (jika diperlukan):**
```bash
npx create-next-app@latest kancahate_landing --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd kancahate_landing
npm install framer-motion lucide-react @supabase/supabase-js
npm install @ducanh2912/next-pwa --save
```

### 2.2 Setup Folder Structure

**Prompt untuk Agent:**
```
Buatkan struktur folder yang rapi untuk project ini:
- src/app/ untuk pages (Next.js App Router)
- src/components/ untuk components (shared, chat, assessments)
- src/services/ untuk API calls dan business logic
- src/lib/ untuk utilities
- src/data/ untuk static data
- src/constants/ untuk constants

Jelaskan tujuan masing-masing folder.
```

### 2.3 Setup Environment Variables

**Buat file `.env.local`:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# App Config
NEXT_PUBLIC_APP_NAME=Kancah Ate
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

### 2.4 Setup Git Repository

**Prompt untuk Agent:**
```
Inisialisasi git repository dan hubungkan ke GitHub:
- Buat .gitignore yang proper
- Buat README.md dengan deskripsi project
- Initial commit
```

---

## Fase 3: Backend (Supabase)

### 3.1 Setup Supabase Project

**Langkah Manual di Supabase Dashboard:**
1. Buat project baru di supabase.com
2. Catat URL dan Anon Key
3. Masukkan ke `.env.local`

### 3.2 Database Schema

**Prompt untuk Agent:**
```
Buatkan SQL migration script untuk Supabase dengan tabel:

1. counseling_sessions - Untuk menyimpan sesi chat
   - id, user_id, user_email, user_name, category, risk_level, 
   - chat_history (JSONB), summary, status, created_at

2. assessment_results - Untuk hasil tes psikologi
   - id, user_id, test_type, scores (JSONB), result (JSONB),
   - created_at

3. user_profiles - Untuk profil user
   - id, user_id, email, name, gender, dob, age,
   - education_status, location, created_at

4. articles - Untuk CMS
   - id, title, slug, content, excerpt, category_id,
   - status, published_at, view_count

5. article_categories - Kategori artikel
   - id, name, slug, description

Sertakan:
- RLS (Row Level Security) policies
- Indexes untuk performa
- Triggers untuk auto-update timestamps
```

**File yang Dihasilkan:**
- `supabase/migrations/001_create_counseling_sessions.sql`
- `supabase/migrations/002_create_assessment_results.sql`
- `supabase/migrations/003_create_user_profiles.sql`
- `supabase/migrations/004_create_articles.sql`

### 3.3 Setup Supabase Client

**Prompt untuk Agent:**
```
Buatkan file src/lib/supabaseClient.js untuk menginisialisasi 
Supabase client yang bisa digunakan di seluruh aplikasi.

Import dari environment variables.
```

### 3.4 Setup Authentication

**Prompt untuk Agent:**
```
Buatkan halaman authentication:
1. /login - Login dengan email/password
2. /register - Registrasi user baru (jika diperlukan, atau gabung dengan login)
3. /lupa-password - Reset password
4. /reset-password - Form ganti password baru

Gunakan Supabase Auth dengan fitur:
- Email/Password authentication
- Forgot password flow
- Session management
```

---

## Fase 4: Frontend Implementation

### 4.1 Shared Components

**Prompt untuk Agent:**
```
Buatkan shared components yang akan digunakan di seluruh aplikasi:

1. Header.jsx
   - Logo Kancah Ate
   - Navigation links
   - "Mulai Curhat" CTA button
   - Mobile hamburger menu

2. Footer.jsx
   - Links ke halaman penting
   - Social media links
   - Copyright

Gunakan Tailwind CSS dengan design system:
- Primary color: violet-600
- Accent: orange-500
- Font: system font stack
- Rounded corners: rounded-xl untuk cards
```

### 4.2 Landing Page

**Prompt untuk Agent:**
```
Buatkan landing page (src/app/page.js) dengan sections:

1. Hero Section
   - Headline menarik untuk remaja
   - Subheadline yang menjelaskan value proposition
   - CTA button "Mulai Curhat dengan Kai"
   - Ilustrasi/gambar yang friendly

2. Features Section
   - 3-4 fitur utama dengan icon dan deskripsi
   - Curhat AI, Tes Psikologi, Artikel

3. How It Works
   - Step by step cara menggunakan aplikasi

4. Testimonials (opsional)
   - Review dari user

5. CTA Section
   - Final call to action

Gunakan Framer Motion untuk animasi scroll.
```

### 4.3 Assessment Pages

**Prompt untuk Agent:**
```
Buatkan halaman untuk tes psikologi:

1. /psikotes - Hub untuk semua tes
   - Grid cards untuk setiap tes yang tersedia
   - Deskripsi singkat dan estimasi waktu

2. Components untuk setiap tes:
   - BigFiveView.jsx
   - MBTIView.jsx
   - GAD7View.jsx
   - PSS10View.jsx
   - (dan tes lainnya)

Setiap tes harus:
- Progress indicator
- Questions dengan radio buttons atau likert scale
- Hasil dengan interpretasi
- Tombol untuk diskusikan dengan Kai
- Simpan hasil ke database
```

### 4.4 Dashboard Pages

**Prompt untuk Agent:**
```
Buatkan dashboard untuk user:

1. /dashboard - User Dashboard
   - Welcome message dengan nama user
   - Riwayat curhat (card grid)
   - Hasil tes terbaru (table)
   - Empty states jika belum ada data
   - Logout button

2. /kancah-private-auth - Admin Dashboard
   - Proteksi dengan email tertentu
   - Statistik (total sesi, risk levels, user unik)
   - Tabel semua sesi curhat
   - Detail modal untuk review sesi
   - Tab untuk user management
```

---

## Fase 5: Fitur Utama

### 5.1 AI Chat (Kai)

**Prompt untuk Agent:**
```
Buatkan sistem chat AI dengan nama "Kai":

1. ChatRoomView.jsx - Komponen utama chat
   - Message list dengan bubble style
   - Input field dengan send button
   - Typing indicator
   - Speech recognition (opsional)
   - Text-to-Speech untuk respons Kai

2. ChatModal.jsx - Modal wrapper untuk chat
   - Full screen modal
   - Smooth animations
   - Close button

3. Gemini Service (src/services/geminiService.js)
   - System prompt yang mendefinisikan personality Kai
   - Persona: Teman sebaya yang supportive
   - Bahasa: Indonesia casual tapi sopan
   - Safety: Deteksi kata kunci krisis

4. Flow Chat:
   - Intake: Tanya nama, gender, DOB, pendidikan, lokasi
   - Subtopic selection: User pilih topik curhat
   - Free chat: Conversation sampai user selesai
   - Ending: Offer untuk simpan chat dan buat akun

System Prompt untuk Kai:
"Kamu adalah Kai, teman cerita virtual dari Kancah Ate. Kamu berperan sebagai peer supporter yang hangat dan empatis. Gunakan bahasa Indonesia yang casual tapi sopan, seperti berbicara dengan teman sebaya. Jangan pernah mengaku sebagai profesional kesehatan mental. Jika user menunjukkan tanda-tanda krisis, arahkan ke hotline 119 ext 8."
```

### 5.2 Crisis Detection

**Prompt untuk Agent:**
```
Implementasikan sistem deteksi krisis:

1. crisisKeywords.js - Daftar kata kunci berisiko
   - Rendah: sedih, capek
   - Sedang: putus asa, tidak berguna
   - Tinggi: bunuh diri, mati, self-harm

2. Di ChatRoomView, check setiap pesan user
   - Jika terdeteksi crisis keyword → tampilkan crisis modal
   - Simpan risk_level ke database
   - Notifikasi admin (opsional)

3. CrisisModal.jsx
   - Pesan empati
   - Hotline 119 ext 8
   - Tombol hubungi langsung
```

### 5.3 Text-to-Speech

**Prompt untuk Agent:**
```
Tambahkan fitur Text-to-Speech untuk balasan Kai:

1. Gunakan Web Speech API (speechSynthesis)
2. Pilih voice Indonesia jika tersedia
3. Toggle button untuk enable/disable
4. Otomatis baca respons baru dari Kai
```

### 5.4 CMS Artikel

**Prompt untuk Agent:**
```
Buatkan CMS untuk manajemen artikel:

1. /ruang-baca - Public page untuk list artikel
   - Search bar
   - Filter by category
   - Article cards dengan gambar
   - Pagination

2. /ruang-baca/[slug] - Detail artikel
   - Content rendering (markdown/HTML)
   - Author dan tanggal
   - Share buttons
   - Related articles

3. /kancah-private-auth/articles - Admin CMS
   - CRUD untuk artikel
   - Rich text editor (atau textarea untuk markdown)
   - Status (draft/published)
   - Category selection
   - Featured image URL

4. Service functions:
   - getPublishedArticles()
   - getArticleBySlug()
   - createArticle()
   - updateArticle()
   - deleteArticle()
```

### 5.5 User Onboarding

**Prompt untuk Agent:**
```
Buatkan flow onboarding untuk user baru:

1. /lengkapi-profil - Multi-step form
   - Step 1: Nama, Gender, Tanggal Lahir
   - Step 2: Status Pendidikan, Institusi
   - Step 3: Lokasi
   - Progress bar
   - Validasi tiap step
   - Simpan ke user_profiles table

2. Redirect flow:
   - Setelah email verification → /lengkapi-profil
   - Setelah lengkapi profil → /dashboard
   - Jika profile sudah ada → skip ke chat langsung

3. Di ChatRoomView:
   - Check apakah user sudah login dan punya profile
   - Jika ya, skip intake dan langsung ke subtopic selection
   - Pre-fill userData dari database
```

---

## Fase 6: Testing & QA

### 6.1 Build Test

**Prompt untuk Agent:**
```
Jalankan build test untuk memastikan tidak ada error:
npm run build

Jika ada error, fix satu per satu.
```

### 6.2 Lint Check

**Prompt untuk Agent:**
```
Jalankan ESLint untuk check code quality:
npx eslint src --ext .js,.jsx

Fix semua error dan warning yang ditemukan.
```

### 6.3 Manual Testing Checklist

```markdown
## Testing Checklist

### Authentication
- [ ] Register user baru
- [ ] Login dengan email/password
- [ ] Logout
- [ ] Forgot password flow
- [ ] Reset password

### Chat
- [ ] Mulai chat baru
- [ ] Kirim pesan dan terima respons
- [ ] Toggle TTS
- [ ] Crisis detection
- [ ] Simpan chat ke database
- [ ] Skip intake untuk user dengan profile

### Assessments
- [ ] Akses semua tes
- [ ] Complete setiap tes
- [ ] Lihat hasil
- [ ] Simpan hasil ke database
- [ ] Diskusikan hasil dengan Kai

### Dashboard
- [ ] Lihat riwayat chat
- [ ] Lihat hasil tes
- [ ] Empty states
- [ ] Logout

### Admin
- [ ] Akses admin dashboard
- [ ] Lihat statistik
- [ ] Lihat semua sesi
- [ ] User management tab
- [ ] CMS artikel - CRUD
```

### 6.4 Security Audit

**Prompt untuk Agent:**
```
Lakukan audit keamanan:
1. npm audit - Check vulnerabilities
2. Pastikan .env.local tidak di-commit
3. Pastikan RLS aktif di semua tabel
4. Pastikan admin dashboard terproteksi
```

---

## Fase 7: Deployment

### 7.1 Prepare for Production

**Prompt untuk Agent:**
```
Siapkan aplikasi untuk production:
1. Update next.config.js untuk production
2. Pastikan PWA manifest benar
3. Buat file robots.txt dan sitemap
4. Optimize images
5. Set proper meta tags untuk SEO
```

### 7.2 Deploy ke Vercel

**Langkah Manual:**

1. **Push ke GitHub:**
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Di Vercel Dashboard:**
   - Import project dari GitHub
   - Configure environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_GEMINI_API_KEY`
     - `NEXT_PUBLIC_ADMIN_EMAIL`
     - `NEXT_PUBLIC_APP_URL` (set ke domain production)
   - Deploy

3. **Setup Custom Domain (opsional):**
   - Di Vercel: Settings → Domains
   - Add custom domain
   - Configure DNS records

### 7.3 Setup Supabase untuk Production

**Langkah di Supabase Dashboard:**

1. **URL Configuration:**
   - Settings → Auth → URL Configuration
   - Site URL: https://yourdomain.com
   - Redirect URLs: https://yourdomain.com/lengkapi-profil, https://yourdomain.com/reset-password

2. **Email Templates:**
   - Settings → Auth → Email Templates
   - Customize templates dengan branding

3. **Run Migrations:**
   - SQL Editor → Paste migration scripts → Run

### 7.4 Post-Deployment Verification

**Checklist:**
- [ ] Homepage loads correctly
- [ ] Authentication works
- [ ] Chat works with AI
- [ ] Database operations work
- [ ] PWA installable
- [ ] Mobile responsive

---

## Fase 8: Post-Launch

### 8.1 Monitoring

**Setup yang Direkomendasikan:**
- Vercel Analytics (built-in)
- Supabase Dashboard untuk DB monitoring
- Error tracking (opsional: Sentry)

### 8.2 Iteration & Updates

**Prompt untuk update fitur:**
```
Saya ingin menambahkan fitur [NAMA FITUR] ke aplikasi Kancah Ate.

Deskripsi: [JELASKAN FITUR]

Requirements:
- [REQUIREMENT 1]
- [REQUIREMENT 2]

Tolong implementasikan dengan:
1. Database changes (jika diperlukan)
2. Backend logic
3. Frontend UI
4. Testing
```

### 8.3 Content Management

**Regular Tasks:**
- Tambah artikel baru via CMS
- Monitor sesi berisiko tinggi
- Respond ke feedback user
- Update tes psikologi jika ada revisi

---

## Tips & Best Practices

### 💡 Tips untuk Prompting Agent

1. **Be Specific:**
   ```
   ❌ "Buatkan form login"
   ✅ "Buatkan halaman /login dengan form email dan password, 
       menggunakan Supabase Auth, dengan fitur forgot password 
       dan redirect ke /dashboard setelah berhasil login"
   ```

2. **Provide Context:**
   ```
   "Di project ini kita menggunakan:
   - Next.js App Router
   - Tailwind CSS dengan primary color violet-600
   - Supabase untuk auth dan database
   - Framer Motion untuk animasi
   
   Buatkan komponen [X] yang konsisten dengan tech stack ini."
   ```

3. **Ask for Explanation:**
   ```
   "Jelaskan apa yang kamu lakukan dan kenapa, 
   sehingga saya bisa belajar dan maintain code ini kedepan."
   ```

4. **Iterative Approach:**
   ```
   Step 1: "Buatkan basic version dulu"
   Step 2: "Tambahkan fitur X"
   Step 3: "Improve styling"
   Step 4: "Fix edge cases"
   ```

### 🔧 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build error | Run `npm run build` dan fix error satu-satu |
| Hydration error | Pastikan tidak ada mismatch antara server dan client |
| Supabase RLS | Gunakan policy yang benar untuk setiap operasi |
| API key exposed | Pastikan pakai NEXT_PUBLIC_ prefix hanya untuk client-side |
| Slow loading | Optimize images, lazy load components |

### 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Google AI Studio](https://aistudio.google.com/)

---

## 📊 Summary Timeline

| Fase | Durasi | Output |
|------|--------|--------|
| 1. Planning | 2-4 jam | Feature spec, DB schema, UI designs |
| 2. Setup | 1-2 jam | Project initialized, Git ready |
| 3. Backend | 2-3 jam | Supabase configured, tables created |
| 4. Frontend | 8-12 jam | All pages and components |
| 5. Features | 10-15 jam | Chat AI, Assessments, CMS |
| 6. Testing | 2-4 jam | All features tested |
| 7. Deployment | 1-2 jam | Live on production |
| 8. Post-Launch | Ongoing | Monitoring, updates |

**Total Estimated: 26-42 jam development time**

---

## 🎉 Conclusion

Dengan mengikuti panduan ini dan menggunakan AI Agent (Antigravity) dengan prompt yang tepat, Anda bisa membangun aplikasi kompleks seperti Kancah Ate dalam waktu yang relatif singkat.

Kunci sukses:
1. ✅ Planning yang matang
2. ✅ Prompt yang spesifik dan jelas
3. ✅ Iterative development
4. ✅ Testing di setiap tahap
5. ✅ Documentation yang baik

**Good luck building your app! 🚀**

---

*Dokumentasi ini dibuat berdasarkan pengalaman membangun Kancah Ate menggunakan Antigravity IDE.*

*Last Updated: 2026-01-02*
