# Kancah Ate 🧠💜

**Teman Cerita & First Aid Kesehatan Mental Remaja**

Platform kesehatan mental berbasis web untuk remaja Indonesia (usia 12-19 tahun). Menyediakan ruang aman untuk curhat, tes psikologi, dan edukasi kesehatan mental.

---

## 🌟 Features

### 💬 **Curhat dengan Kai**
- AI Companion berbasis Google Gemini
- Text-to-Speech (TTS) untuk accessibility
- Sesi anonim & privat
- Deteksi risiko otomatis
- Simpan riwayat chat

### 📊 **Tes Psikologi ("Tes Seru")**
- Big Five Personality
- MBTI
- GAD-7 (Kecemasan)
- PSS-10 (Stres)
- PHQ-9 (Depresi)
- Rosenberg Self-Esteem  
- RIASEC (Minat Karir)
- VARK (Gaya Belajar)
- Multiple Intelligence
- Love Languages

### 📚 **Ruang Baca**
- Artikel kesehatan mental
- Tips praktis untuk remaja
- CMS untuk admin

### 👤 **User Dashboard**
- Riwayat curhat
- Hasil tes tersimpan
- Profile management

### 🔒 **Admin Dashboard**
- Sesi monitoring
- User management
- CMS artikel
- Risk level alerts

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **AI:** Google Gemini API
- **Animations:** Framer Motion
- **Deployment:** Vercel
- **PWA:** Service Worker, Manifest

---

## 📁 Project Structure

```
kancahate_landing/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # User dashboard
│   │   ├── kancah-private-auth/# Admin dashboard + CMS
│   │   ├── lengkapi-profil/    # Onboarding profile
│   │   ├── login/              # Auth pages
│   │   ├── psikotes/           # Assessment hub
│   │   └── ruang-baca/         # Articles (public)
│   ├── components/
│   │   ├── assessments/        # Tes psikologi views
│   │   ├── chat/               # Chat components
│   │   └── shared/             # Header, Footer
│   ├── services/               # API services
│   ├── lib/                    # Utilities
│   └── data/                   # Static data
├── supabase/migrations/        # Database schemas
├── email-templates/            # Auth email templates
├── public/                     # Static assets
└── .agent/workflows/           # Development workflows
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Google Gemini API key

### Installation

```bash
# Clone repository
git clone https://github.com/10Daeng/kancahate_landing.git
cd kancahate_landing

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

### Database Setup

Run migrations in Supabase SQL Editor:
1. `supabase/migrations/create_user_profiles.sql`
2. `supabase/migrations/create_articles_cms.sql`

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 PWA Support

Kancah Ate is a Progressive Web App (PWA):
- ✅ Installable on mobile & desktop
- ✅ Offline capable
- ✅ App-like experience
- ✅ No app store needed

To install: Visit the website → Browser menu → "Add to Home Screen"

---

## 🔒 Security

- Row Level Security (RLS) on all tables
- Admin-only access for sensitive data
- Anonymous chat sessions
- Secure authentication via Supabase Auth
- GDPR-compliant data handling

---

## 📧 Email Setup

Custom email templates are available in `/email-templates/`:
- Reset Password
- Magic Link
- Change Email

See `email-templates/README.md` for setup instructions.

---

## 🎯 Roadmap

### ✅ Completed
- [x] User Profile Onboarding
- [x] Chat Modal (no page redirect)
- [x] Assessment Result Integration
- [x] Dashboard Improvements
- [x] Email Templates
- [x] Text-to-Speech (TTS)
- [x] Admin Statistics
- [x] User Management
- [x] Chat History Detail
- [x] CMS for Articles

### 🔮 Future Enhancements
- [ ] Native Mobile App (Optional - PWA sufficient)
- [ ] AI-powered article recommendations
- [ ] Group chat / peer support
- [ ] Integration with professional counselors

---

## 👥 Target Users

- 🎓 Remaja usia 12-19 tahun
- 📍 Fokus: Madura & Jawa Timur
- 🏫 Pelajar SMP, SMA, Mahasiswa

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Contact

- **Website:** [kancahate.my.id](https://kancahate.my.id)
- **Email:** lenterabatin.id@gmail.com
- **Institution:** Lentera Batin

---

**Made with 💜 for Indonesian Youth Mental Health**
