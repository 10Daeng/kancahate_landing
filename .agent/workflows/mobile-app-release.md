---
description: Panduan langkah demi langkah mengubah web Kancah Ate menjadi aplikasi Android (Google Play) dan iOS (App Store) menggunakan Capacitor.
---

# Panduan Rilis Aplikasi Mobile (Capacitor)

Panduan ini membantu Anda membungkus (wrap) website Kancah Ate menjadi aplikasi native yang bisa diinstall.

## 1. Persiapan (Sudah Dilakukan)
Saya telah menginstall dependencies berikut:
- `@capacitor/core`
- `@capacitor/cli`
- `@capacitor/android`
- `@capacitor/ios`

## 2. Inisialisasi Projek Mobile
Jalankan perintah ini di terminal untuk membuat file konfigurasi `capacitor.config.ts`:

```bash
npx cap init
```
- **App Name**: Kancah Ate
- **Package ID**: com.kancahate.app (Gunakan format domain terbalik yang unik)
- **Web Dir**: out (Jika static export) atau public (jika live mode)

## 3. Konfigurasi Build (Pilih Salah Satu)

### Opsi A: Aplikasi Online (Wrapper) - Paling Mudah
Aplikasi akan memuat website yang sudah dideploy (misal di Vercel).
1. Edit `capacitor.config.ts`:
   ```typescript
   import { CapacitorConfig } from '@capacitor/cli';

   const config: CapacitorConfig = {
     appId: 'com.kancahate.app',
     appName: 'Kancah Ate',
     webDir: 'public', // Dummy dir karena kita load URL
     server: {
       url: 'https://kancahate-landing.vercel.app', // GANTI dengan domain produksi Anda
       cleartext: true
     }
   };
   export default config;
   ```

### Opsi B: Aplikasi Offline (Embedded) - Performa Terbaik
Aplikasi memuat file HTML/JS/CSS lokal.
1. Edit `next.config.mjs` untuk mengaktifkan static export:
   ```javascript
   const nextConfig = {
     output: 'export',
     images: { unoptimized: true } // Wajib untuk static export
   };
   ```
2. Jalankan build: `npm run build`. Folder `out` akan terbentuk.
3. Pastikan `webDir` di `capacitor.config.ts` menunjuk ke `out`.

## 4. Tambahkan Platform
```bash
npx cap add android
npx cap add ios
```
*Catatan: iOS hanya bisa dibuild di macOS dengan Xcode terinstall.*

## 5. Sinkronisasi & Build Native
Setiap kali Anda update kode web, jalankan:
```bash
npm run build
npx cap sync
```

## 6. Compile ke APK/IPA
1. **Android**:
   ```bash
   npx cap open android
   ```
   Android Studio akan terbuka. Dari menu, pilih **Build > Generate Signed Bundle / APK**.

2. **iOS**:
   ```bash
   npx cap open ios
   ```
   Xcode akan terbuka. Pilih target device **Any iOS Device (arm64)** dan pilih **Product > Archive**.

## 7. Upload ke Store
- **Google Play Console**: Upload file `.aab` (Android App Bundle).
- **App Store Connect**: Upload arsip dari Xcode Organizer.

---
// turbo
Hubungi kembali jika ada error saat build!
