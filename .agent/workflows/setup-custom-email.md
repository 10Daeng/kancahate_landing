---
description: Cara setup Custom Email (Gmail SMTP) untuk Supabase Auth
---

# Setup Custom Email untuk Kancah Ate

Panduan ini akan membantu Anda mengkonfigurasi email verifikasi Supabase agar terlihat dari "Kancah Ate".

**Pilih salah satu opsi:**
- **Opsi A**: Gmail SMTP (Paling Mudah, Gratis)
- **Opsi B**: Domain Email `kancahate.my.id` dengan Cloudflare (Lebih Profesional, Gratis)

---

# OPSI A: Gmail SMTP (Recommended untuk Mulai Cepat)

## Langkah 1: Siapkan Gmail Account

1. **Buat atau gunakan Gmail** yang akan dipakai untuk mengirim email:
   - Contoh: `kancahate.official@gmail.com`
   - Atau gunakan email pribadi yang sudah ada

2. **Aktifkan 2-Step Verification** (wajib untuk App Password):
   - Buka: https://myaccount.google.com/security
   - Cari "2-Step Verification" → Klik "Get Started"
   - Ikuti instruksi untuk setup (biasanya pakai SMS atau Google Authenticator)

---

## Langkah 2: Generate App Password

1. Setelah 2-Step Verification aktif, buka:
   - https://myaccount.google.com/apppasswords
   
2. Klik **"Select app"** → Pilih **"Mail"**

3. Klik **"Select device"** → Pilih **"Other (Custom name)"**
   - Ketik: `Kancah Ate Supabase`

4. Klik **"Generate"**

5. **SIMPAN** 16-digit password yang muncul (contoh: `abcd efgh ijkl mnop`)
   - Anda akan memasukkan ini ke Supabase nanti
   - **Jangan share ke siapa pun!**

---

## Langkah 3: Konfigurasi Supabase SMTP

1. Buka **Supabase Dashboard**: https://supabase.com/dashboard

2. Pilih project **Kancah Ate**

3. Navigasi ke: **Settings** (ikon gear di sidebar kiri) → **Auth**

4. Scroll ke bagian **SMTP Settings**

5. Klik **"Enable Custom SMTP"**

6. Isi form dengan data berikut:

   ```
   Sender name: Kancah Ate
   Sender email: kancahate.official@gmail.com  (atau email Anda)
   
   Host: smtp.gmail.com
   Port number: 587
   
   Username: kancahate.official@gmail.com  (email lengkap)
   Password: [16-digit App Password dari Langkah 2]
   ```

7. Klik **"Save"**

---

## Langkah 4: Customize Email Templates

Masih di halaman **Auth Settings**, scroll ke **Email Templates**.

### Template: Confirm Signup (Email Verifikasi)

**Subject:**
```
Verifikasi Akun Kancah Ate Anda
```

**Body (HTML):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #8B5CF6; margin: 0;">Kancah Ate</h1>
    <p style="color: #64748b; margin-top: 8px;">Teman Cerita & First Aid Kesehatan Mental Remaja</p>
  </div>
  
  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="color: #1e293b; margin-top: 0;">Selamat Datang! 👋</h2>
    <p style="color: #475569; line-height: 1.6;">
      Terima kasih sudah mendaftar di Kancah Ate. Klik tombol di bawah untuk verifikasi email Anda dan mulai perjalanan kesehatan mental yang lebih baik.
    </p>
  </div>
  
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" 
       style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); 
              color: white; 
              padding: 14px 32px; 
              text-decoration: none; 
              border-radius: 12px; 
              font-weight: bold;
              display: inline-block;">
      Verifikasi Email Saya
    </a>
  </div>
  
  <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">
    Atau copy link ini ke browser Anda:<br>
    <a href="{{ .ConfirmationURL }}" style="color: #8B5CF6; word-break: break-all;">{{ .ConfirmationURL }}</a>
  </p>
  
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
  
  <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
    © 2026 Kancah Ate. All rights reserved.<br>
    Jika Anda tidak mendaftar, abaikan email ini.
  </p>
</div>
```

Klik **"Save"**.

---

## Langkah 5: Test Email

1. Buka aplikasi Kancah Ate: http://localhost:3000/login

2. Klik **"Daftar Sekarang"**

3. Masukkan email testing Anda (gunakan email yang berbeda dari SMTP email)

4. Isi password (minimal 6 karakter)

5. Klik **"Buat Akun"**

6. **Cek inbox email Anda** (termasuk folder Spam/Junk)

7. Email seharusnya datang dari:
   ```
   Kancah Ate <kancahate.official@gmail.com>
   ```

8. Klik link verifikasi

9. Anda akan diredirect ke aplikasi dan otomatis login

---

## Troubleshooting

### Email tidak terkirim?
- Pastikan App Password benar (16 digit tanpa spasi)
- Cek apakah 2-Step Verification sudah aktif di Gmail
- Coba gunakan Port `465` dengan SSL jika `587` tidak work

### Email masuk ke Spam?
- Normal untuk email pertama kali
- Minta user cek folder Spam
- Nanti bisa improve dengan SPF/DKIM records (butuh domain)

### Error "Invalid login credentials"?
- Username harus email lengkap (bukan hanya nama)
- Password harus App Password (bukan password Gmail biasa)

---

## Optional: Customize Template Lainnya

Anda juga bisa customize:
- **Magic Link** (Login tanpa password)
- **Reset Password** (Lupa kata sandi)
- **Change Email Address**

Caranya sama seperti Langkah 4, tinggal pilih template yang ingin diubah.

---

## Selesai! 🎉

Sekarang email verifikasi Kancah Ate sudah terlihat profesional dan branded.

**Next Steps:**
- Test dengan beberapa email berbeda
- Jika sudah punya domain, bisa upgrade ke email domain (noreply@kancahate.my.id) - Lihat **Opsi B** di bawah
- Setup SPF/DKIM untuk menghindari spam folder (advanced)

---
---

# OPSI B: Email Domain `kancahate.my.id` (Lebih Profesional)

Dengan opsi ini, email akan terlihat dari `noreply@kancahate.my.id` alih-alih Gmail.

**Keuntungan:**
- ✅ Lebih profesional & branded
- ✅ 100% Gratis (Cloudflare Email Routing)
- ✅ Tidak perlu hosting email

**Cara Kerja:**
1. Cloudflare Email Routing menerima email di `noreply@kancahate.my.id`
2. Forward ke Gmail Anda
3. Kirim email pakai Gmail SMTP, tapi dengan "Reply-To" domain

---

## Langkah 1: Setup Cloudflare Email Routing

1. **Login ke Cloudflare**: https://dash.cloudflare.com

2. **Pilih domain** `kancahate.my.id`

3. **Navigasi ke Email** → **Email Routing**

4. Klik **"Get Started"** atau **"Enable Email Routing"**

5. **Tambah Destination Address** (email tujuan forward):
   - Klik **"Add destination address"**
   - Masukkan Gmail Anda (contoh: `ilham@gmail.com`)
   - Klik **"Send verification email"**
   - Cek inbox Gmail → Klik link verifikasi

6. **Buat Email Routing Rule**:
   - Klik **"Create address"**
   - Custom address: `noreply`
   - Action: **"Send to an email"**
   - Destination: Pilih Gmail yang tadi diverifikasi
   - Klik **"Save"**

7. **Cloudflare akan otomatis setup DNS records** (MX, TXT, dll)
   - Tunggu beberapa menit untuk propagasi DNS

8. **Test Email Routing**:
   - Kirim email test ke `noreply@kancahate.my.id`
   - Cek apakah masuk ke Gmail Anda

---

## Langkah 2: Setup Gmail untuk Kirim Email "From" Domain

Sekarang kita perlu setup Gmail agar bisa **kirim email** dengan alamat `noreply@kancahate.my.id`.

1. **Buka Gmail** → Klik **Settings** (ikon gear) → **"See all settings"**

2. Pilih tab **"Accounts and Import"**

3. Di bagian **"Send mail as"**, klik **"Add another email address"**

4. Isi form:
   - Name: `Kancah Ate`
   - Email: `noreply@kancahate.my.id`
   - ✅ Centang **"Treat as an alias"**
   - Klik **"Next Step"**

5. Isi SMTP settings:
   - SMTP Server: `smtp.gmail.com`
   - Port: `587`
   - Username: [Gmail Anda, contoh: `ilham@gmail.com`]
   - Password: [App Password Gmail - lihat Opsi A Langkah 2]
   - ✅ Centang **"Secured connection using TLS"**
   - Klik **"Add Account"**

6. **Verifikasi**:
   - Gmail akan kirim kode verifikasi ke `noreply@kancahate.my.id`
   - Karena sudah di-forward, cek inbox Gmail Anda
   - Copy kode verifikasi → Paste di popup Gmail
   - Klik **"Verify"**

7. **Set sebagai default** (opsional):
   - Di "Send mail as", klik **"make default"** di samping `noreply@kancahate.my.id`

---

## Langkah 3: Konfigurasi Supabase SMTP (Sama seperti Opsi A)

1. Buka **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**

2. Klik **"Enable Custom SMTP"**

3. Isi form:
   ```
   Sender name: Kancah Ate
   Sender email: noreply@kancahate.my.id
   
   Host: smtp.gmail.com
   Port number: 587
   
   Username: [Gmail Anda, contoh: ilham@gmail.com]
   Password: [16-digit App Password Gmail]
   ```

4. Klik **"Save"**

---

## Langkah 4: Customize Email Templates

Sama seperti **Opsi A Langkah 4**, tapi ubah footer menjadi:

```html
<p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
  © 2026 Kancah Ate. All rights reserved.<br>
  Email dikirim dari noreply@kancahate.my.id
</p>
```

---

## Langkah 5: Test Email

1. Buka http://localhost:3000/login

2. Daftar dengan email testing

3. Cek inbox → Email seharusnya datang dari:
   ```
   Kancah Ate <noreply@kancahate.my.id>
   ```

4. ✅ Selesai! Email sekarang terlihat super profesional.

---

## Troubleshooting Opsi B

### Email tidak terkirim dari domain?
- Pastikan Gmail "Send mail as" sudah diverifikasi
- Cek apakah App Password benar
- Pastikan Cloudflare Email Routing aktif (status "Active")

### Email masuk spam?
- Setup **SPF record** di Cloudflare DNS (biasanya otomatis):
  ```
  Type: TXT
  Name: @
  Content: v=spf1 include:_spf.google.com ~all
  ```
- Tunggu 24-48 jam untuk reputasi email membaik

### Tidak bisa verifikasi "Send mail as" di Gmail?
- Pastikan email routing sudah aktif
- Cek folder spam di Gmail untuk kode verifikasi
- Coba kirim ulang kode verifikasi

---

## Perbandingan Opsi A vs Opsi B

| Fitur | Opsi A (Gmail) | Opsi B (Domain) |
|-------|----------------|-----------------|
| **Sender Email** | `kancahate.official@gmail.com` | `noreply@kancahate.my.id` |
| **Profesionalitas** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Setup Time** | 10 menit | 30 menit |
| **Biaya** | Gratis | Gratis |
| **Spam Risk** | Sedang | Rendah (dengan SPF) |

**Rekomendasi:**
- Gunakan **Opsi A** untuk testing/MVP cepat
- Upgrade ke **Opsi B** sebelum launch publik

---

## Selesai! 🎉🎉

Email Kancah Ate sekarang siap untuk production dengan branding penuh!

