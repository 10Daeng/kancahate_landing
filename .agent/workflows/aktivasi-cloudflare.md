---
description: Panduan aktivasi Cloudflare untuk domain kancahate.my.id
---

# Aktivasi Cloudflare untuk kancahate.my.id

Panduan ini akan membantu Anda mengaktifkan Cloudflare nameserver untuk domain `kancahate.my.id` agar Email Routing dan fitur lainnya bisa berfungsi.

---

## Langkah 1: Cek Nameserver Cloudflare Anda

1. **Buka Cloudflare Dashboard**: https://dash.cloudflare.com

2. **Pilih domain** `kancahate.my.id`

3. **Klik "Overview"** di sidebar kiri

4. Scroll ke bawah, cari bagian **"Nameservers"**

5. **Catat 2 nameserver** yang diberikan Cloudflare (contoh):
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
   
   **PENTING:** Nameserver Anda mungkin berbeda! Bisa seperti:
   ```
   aron.ns.cloudflare.com
   lola.ns.cloudflare.com
   ```
   
   Catat nameserver yang **spesifik untuk akun Anda**.

---

## Langkah 2: Login ke Registrar Domain my.id

Domain `.my.id` biasanya didaftarkan melalui salah satu dari:
- **my.id** (https://my.id)
- **Niagahoster**
- **Rumahweb**
- **Cloudkilat**
- **DomaiNesia**

**Cari email konfirmasi** saat Anda pertama kali daftar domain untuk mengetahui registrar-nya.

### Jika dari my.id langsung:

1. Buka: https://my.id
2. Login dengan akun Anda
3. Masuk ke **"Domain Management"** atau **"Manage Domains"**
4. Pilih domain `kancahate.my.id`

### Jika dari Niagahoster/Rumahweb/dll:

1. Login ke member area registrar Anda
2. Cari menu **"Domain"** atau **"Domain Management"**
3. Pilih domain `kancahate.my.id`

---

## Langkah 3: Ubah Nameserver ke Cloudflare

1. Di halaman domain management, cari menu:
   - **"Change Nameservers"**
   - **"DNS Management"**
   - **"Nameserver Settings"**

2. Pilih opsi **"Custom Nameservers"** atau **"Use custom nameservers"**

3. **Hapus nameserver lama**, masukkan nameserver Cloudflare:
   ```
   Nameserver 1: [nameserver 1 dari Cloudflare]
   Nameserver 2: [nameserver 2 dari Cloudflare]
   ```

4. **Save/Update Changes**

5. Konfirmasi jika ada popup/email konfirmasi

---

## Langkah 4: Verifikasi di Cloudflare

1. **Kembali ke Cloudflare Dashboard** → Domain `kancahate.my.id`

2. Klik **"Overview"**

3. Di bagian **"Nameservers"**, klik tombol **"Check nameservers"** atau **"Re-check now"**

4. **Tunggu beberapa menit** (bisa 5 menit - 2 jam, jarang sampai 24 jam)

5. Status akan berubah dari:
   - ⚠️ **"Pending Nameserver Update"** (Orange)
   - Menjadi: ✅ **"Active"** (Hijau)

6. Anda akan menerima **email dari Cloudflare** yang mengkonfirmasi domain sudah aktif

---

## Langkah 5: Aktifkan Email Routing

Setelah nameserver aktif:

1. Di Cloudflare Dashboard, navigasi ke **Email** → **Email Routing**

2. Peringatan orange **"This zone isn't activated yet"** seharusnya **sudah hilang**

3. Klik **"Get Started"** atau **"Enable Email Routing"**

4. **Tambah Destination Address**:
   - Klik **"Add destination address"**
   - Masukkan Gmail Anda (contoh: `ilham@gmail.com`)
   - Klik **"Send verification email"**
   - **Cek inbox Gmail** → Klik link verifikasi

5. **Buat Email Routing Rule**:
   - Klik **"Create address"**
   - Custom address: `noreply`
   - Action: **"Send to an email"**
   - Destination: Pilih Gmail yang tadi diverifikasi
   - Klik **"Save"**

6. Cloudflare akan **otomatis setup DNS records** (MX, TXT, SPF)

7. **Test Email Routing**:
   - Kirim email test ke `noreply@kancahate.my.id`
   - Cek apakah masuk ke Gmail Anda
   - ✅ Jika masuk, Email Routing sudah aktif!

---

## Langkah 6: Setup Gmail "Send As" (Opsional tapi Recommended)

Agar bisa **kirim email** dari `noreply@kancahate.my.id`:

1. **Buka Gmail** → Settings → **"Accounts and Import"**

2. Di **"Send mail as"**, klik **"Add another email address"**

3. Isi:
   - Name: `Kancah Ate`
   - Email: `noreply@kancahate.my.id`
   - ✅ Centang **"Treat as an alias"**

4. SMTP Settings:
   - Server: `smtp.gmail.com`
   - Port: `587`
   - Username: [Gmail Anda]
   - Password: [App Password - lihat `/setup-custom-email`]

5. **Verifikasi** (kode akan dikirim ke `noreply@kancahate.my.id` dan di-forward ke Gmail Anda)

6. ✅ Selesai! Sekarang bisa kirim email dari domain.

---

## Langkah 7: Konfigurasi Supabase SMTP

Setelah Email Routing aktif dan Gmail "Send As" terverifikasi:

1. Buka **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**

2. **Enable Custom SMTP**

3. Isi:
   ```
   Sender name: Kancah Ate
   Sender email: noreply@kancahate.my.id
   
   Host: smtp.gmail.com
   Port: 587
   
   Username: [Gmail Anda]
   Password: [App Password Gmail]
   ```

4. **Save**

5. **Test** dengan daftar akun baru di `/login`

6. Email verifikasi seharusnya datang dari:
   ```
   Kancah Ate <noreply@kancahate.my.id>
   ```

---

## Troubleshooting

### Nameserver belum berubah setelah 24 jam?
- Cek lagi di registrar, pastikan nameserver sudah tersimpan
- Coba hubungi support registrar
- Gunakan tool cek DNS: https://www.whatsmydns.net

### Email Routing tidak berfungsi?
- Pastikan status Cloudflare sudah "Active" (hijau)
- Cek DNS records di Cloudflare → DNS → Pastikan ada MX records
- Test kirim email manual ke `noreply@kancahate.my.id`

### Gmail "Send As" tidak bisa verifikasi?
- Pastikan Email Routing sudah aktif
- Cek folder spam di Gmail untuk kode verifikasi
- Pastikan App Password benar

---

## Selesai! 🎉

Domain `kancahate.my.id` sekarang:
- ✅ Menggunakan Cloudflare (CDN, SSL, DDoS protection)
- ✅ Email Routing aktif (terima email di domain)
- ✅ Bisa kirim email dari `noreply@kancahate.my.id`
- ✅ Siap untuk production!

**Benefit tambahan Cloudflare:**
- SSL/HTTPS otomatis (gratis)
- CDN global (website lebih cepat)
- DDoS protection
- Analytics
- Page Rules (redirect, cache, dll)

Selamat! 🚀
