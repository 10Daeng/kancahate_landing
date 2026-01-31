# Dokumentasi Fitur Baru Kancah Ate

Dokumen ini menjelaskan cara mengelola fitur-fitur baru yang telah ditambahkan: **Ruang Baca (Artikel)** dan **Tes Psikologi Gen Z**.

## 1. Ruang Baca (Artikel)

Halaman Ruang Baca menampilkan daftar artikel edukatif seputar kesehatan mental.

- **Lokasi Halaman**: `/ruang-baca`
- **Lokasi Data**: `src/data/articles.js`

### Cara Menambah Artikel Baru
Untuk saat ini, artikel dikelola melalui file `src/data/articles.js`.

1. Buka file `src/data/articles.js`.
2. Tambahkan objek baru ke dalam array `articles`:

```javascript
{
  id: 5, // ID unik (increment dari yang terakhir)
  slug: 'judul-artikel-anda-url-friendly', // URL slug (misal: tips-tidur-nyenyak)
  title: 'Judul Artikel Anda',
  excerpt: 'Ringkasan singkat artikel yang muncul di card...',
  content: `
    <p>Paragraf pembuka artikel Anda.</p>
    <h3>Sub Judul</h3>
    <p>Isi konten lainnya...</p>
    <ul>
      <li>Poin 1</li>
      <li>Poin 2</li>
    </ul>
  `,
  category: 'Kesehatan Mental', // Kategori (akan jadi filter otomatis)
  image: 'URL_GAMBAR', // URL gambar dari Unsplash atau local assets
  author: 'Nama Penulis',
  readTime: '3 menit', // Estimasi waktu baca
  date: '30 Des 2025' // Tanggal terbit
},
```
3. Simpan file. Artikel baru akan otomatis muncul di halaman Ruang Baca.

---

## 2. Tes Psikologi Tambahan (Gen Z)

Tiga tes baru telah ditambahkan: **VARK (Gaya Belajar)**, **Multiple Intelligences**, dan **Love Languages**.

- **Lokasi Halaman**: Diakses via `/psikotes` lalu klik kartu tes.
- **Lokasi Data Soal**: `src/components/assessments/genz_tests_data.js`
- **Komponen Render**: `src/components/assessments/FunAssessmentView.jsx`

### Cara Mengedit Soal atau Hasil

1. Buka `src/components/assessments/genz_tests_data.js`.
2. **Edit Soal**: Cari array `questions` di dalam objek tes yang ingin diubah (misal `VARK_QUIZ`).
   ```javascript
   { id: 1, text: "Pertanyaan baru Anda...", ... }
   ```
3. **Edit Hasil/Interpretasi**: Cari objek `RESULTS` (misal `LOVELANGUAGES_RESULTS`).
   ```javascript
   Words: {
     title: "Words of Affirmation",
     desc: "Deskripsi baru..."
   }
   ```

### Menambah Tes Baru (Advanced)
Jika ingin menambah tes tipe baru ("Fun Test"), Anda perlu:
1. Menambahkan data kuis baru di `genz_tests_data.js`.
2. Mengimpor data tersebut di `src/components/App.jsx`.
3. Menambahkan logic routing baru di `App.jsx` (`if (currentView === 'test_baru') ...`).
4. Menambahkan kartu tes baru di `src/app/psikotes/page.js`.

---

## 3. Catatan Teknis (Next.js 15)

- **Halaman Artikel Detail (`/ruang-baca/[slug]`)** menggunakan **Dynamic Routing**.
- Karena menggunakan Next.js 15, akses ke `params` di halaman detail sekarang bersifat **asynchronous** (`await params`).
- Jika Anda mengubah struktur routing, pastikan logic `await params` tetap dipertahankan untuk mencegah error.
