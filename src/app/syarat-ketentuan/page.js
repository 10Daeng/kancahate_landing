'use client';

import { Header, Footer } from '@/components/shared';

export default function TermsOfService() {
  const lastUpdated = "30 Desember 2024";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header class="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Syarat & Ketentuan Penggunaan</h1>
          <p className="text-slate-500">Ketentuan Layanan Aplikasi Kancah Ate | Terakhir diperbarui: {lastUpdated}</p>
        </header>

        <article className="prose prose-slate prose-orange max-w-none bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mt-6 mb-2">1. Definisi Layanan</h3>
          <p className="mb-4">
              Kancah Ate adalah platform <strong>"Digital Emotional First Aid"</strong> (Pertolongan Pertama Emosional Digital). Layanan kami mencakup:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
              <li><strong>AI Peer Counselor ("Kai"):</strong> Chatbot berbasis kecerdasan buatan untuk mendengarkan keluh kesah dan memberikan dukungan emosional awal.</li>
              <li><strong>Self-Assessment Tools:</strong> Alat skrining psikologis mandiri (PHQ-9, GAD-7, Big Five, dll).</li>
              <li><strong>Edukasi Diri:</strong> Informasi mengenai kesehatan mental dan coping mechanism.</li>
          </ul>

          <div className="bg-red-50 p-6 rounded-2xl border-l-4 border-red-500 my-6">
              <h4 className="text-red-800 font-bold m-0 mb-2 uppercase text-sm">Penting: Bukan Pengganti Medis</h4>
              <p className="text-red-700 text-sm m-0">
                  Layanan ini <strong>TIDAK DIRANCANG</strong> untuk menggantikan diagnosa klinis, terapi medis, atau pengobatan psikiatri profesional. Kami menyarankan pengguna untuk selalu berkonsultasi dengan Psikolog atau Psikiater berlisensi untuk penanganan masalah kesehatan mental yang serius.
              </p>
          </div>

          <h3 className="text-xl font-bold mt-6 mb-2">2. Hasil Asesmen & Interpretasi</h3>
          <p className="mb-4">
              Hasil yang didapatkan dari fitur "Cek Mental" (seperti Skor Depresi, Tingkat Kecemasan, atau Tipe Kepribadian) adalah <strong>indikasi awal (screening)</strong> dan bukan diagnosa final.
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Skor tinggi pada tes tidak otomatis berarti Anda menderita gangguan mental, namun menunjukkan perlunya pemeriksaan lebih lanjut profesional.</li>
              <li>Pengguna setuju untuk menjawab pertanyaan tes dengan jujur demi akurasi hasil screening.</li>
          </ul>

          <h3 className="text-xl font-bold mt-6 mb-2">3. Protokol Keadaan Darurat (Crisis Protocol)</h3>
          <p className="mb-4">
              Aplikasi ini mendeteksi kata kunci terkait krisis (Self-Harm/Suicide). Jika sistem mendeteksi risiko tinggi:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Sistem akan memberikan peringatan dan nomor darurat (Hotline 119 ext 8).</li>
              <li>Pengguna menyetujui bahwa Kancah Ate tidak bertanggung jawab atas tindakan impulsif yang dilakukan di luar kendali platform.</li>
              <li>Pengguna didorong untuk segera mencari bantuan fisik (Rumah Sakit/Klinik) terdekat.</li>
          </ul>

          <h3 className="text-xl font-bold mt-6 mb-2">4. Penggunaan yang Dilarang</h3>
          <p className="mb-4">Pengguna dilarang keras untuk:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Menggunakan layanan untuk tujuan prank, pelecehan seksual terhadap AI ("Kai"), atau ujaran kebencian.</li>
              <li>Memanipulasi sistem asesmen untuk mendapatkan hasil palsu secara berulang.</li>
              <li>Mencoba mengekstrak data atau melakukan reverse-engineering terhadap sistem Kancah Ate.</li>
          </ul>

          <h3 className="text-xl font-bold mt-6 mb-2">5. Kebijakan Usia</h3>
          <p className="mb-4">
              Layanan ini ditujukan untuk pengguna berusia minimal 13 tahun. Pengguna di bawah usia tersebut disarankan untuk didampingi oleh orang tua atau wali saat menggunakan fitur edukasi atau asesmen.
          </p>

          <h3 className="text-xl font-bold mt-6 mb-2">6. Perubahan Layanan</h3>
          <p className="mb-4">
              Kancah Ate berhak untuk mengubah, menonaktifkan sementara, atau menghentikan fitur tertentu (seperti jenis tes psikologi yang tersedia) sewaktu-waktu untuk tujuan pemeliharaan atau peningkatan akurasi ilmiah tanpa pemberitahuan sebelumnya.
          </p>

        </article>
      </main>

      <Footer />
    </div>
  );
}
