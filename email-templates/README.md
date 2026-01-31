# Email Templates - Kancah Ate

Email templates yang branded dan profesional untuk Supabase Auth.

## 📧 Templates Available

1. **Reset Password** (`reset-password.html`)
2. **Magic Link** (`magic-link.html`) 
3. **Change Email Address** (`change-email.html`)

---

## 🎨 Design Features

- ✅ Gradient header dengan branding Kancah Ate
- ✅ Responsive design (mobile-friendly)
- ✅ CTA button yang jelas dan menarik
- ✅ Warning/info boxes untuk keamanan
- ✅ Professional footer dengan copyright
- ✅ Konsisten dengan brand colors (Violet & Pink)

---

## 📝 Cara Implementasi

### 1. Buka Supabase Dashboard

1. Login ke https://supabase.com/dashboard
2. Pilih project **Kancah Ate**
3. Navigasi ke: **Settings** → **Auth** → **Email Templates**

---

### 2. Reset Password Template

**Tab:** Reset Password

**Subject:**
```
Reset Password Akun Kancah Ate Anda
```

**Body (HTML):**
- Copy seluruh content dari `reset-password.html`
- Paste ke field "Body (HTML)"
- Klik **Save**

---

### 3. Magic Link Template

**Tab:** Magic Link

**Subject:**
```
Login ke Kancah Ate - Magic Link ✨
```

**Body (HTML):**
- Copy seluruh content dari `magic-link.html`
- Paste ke field "Body (HTML)"
- Klik **Save**

---

### 4. Change Email Address Template

**Tab:** Change Email Address

**Subject:**
```
Konfirmasi Perubahan Email - Kancah Ate
```

**Body (HTML):**
- Copy seluruh content dari `change-email.html`
- Paste ke field "Body (HTML)"
- Klik **Save**

---

## 🧪 Testing

Setelah setup, test dengan:

### Reset Password:
1. Buka `/login`
2. Klik "Lupa Password?"
3. Masukkan email
4. Check inbox untuk email reset password

### Magic Link:
1. Buka Supabase Dashboard → Auth → Users
2. Klik "Send Magic Link" untuk user tertentu
3. Check inbox

### Change Email:
1. Login ke dashboard
2. Update email di settings
3. Check inbox (both old & new email)

---

## 🎯 Variables Available

Supabase menyediakan variables berikut yang bisa digunakan di template:

- `{{ .ConfirmationURL }}` - Link konfirmasi
- `{{ .Token }}` - Token verifikasi (6 digit)
- `{{ .TokenHash }}` - Hash token
- `{{ .Email }}` - Email user
- `{{ .SiteURL }}` - URL aplikasi

---

## 🔒 Security Notes

- ✅ Link konfirmasi hanya berlaku sekali
- ✅ Link expired setelah 1 jam (default Supabase)
- ✅ Email dikirim dari `noreply@kancahate.my.id`
- ✅ Semua template include warning untuk security

---

## 🎨 Customization

Jika ingin customize:

1. **Colors:**
   - Primary: `#8B5CF6` (Violet)
   - Secondary: `#EC4899` (Pink)
   - Text: `#1e293b` (Slate)

2. **Fonts:**
   - System fonts: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`

3. **Button Style:**
   - Gradient background
   - Rounded corners (12px)
   - Shadow effect

---

## 📊 Email Preview

Semua template sudah dioptimasi untuk:
- ✅ Gmail
- ✅ Outlook
- ✅ Apple Mail
- ✅ Mobile email clients

---

## 🚀 Next Steps

Setelah setup email templates:

1. Test semua email flows
2. Verify email delivery (check spam folder)
3. Ensure branding konsisten
4. Monitor email open rates (via Supabase Analytics)

---

**Last Updated:** 2026-01-01
**Version:** 1.0
