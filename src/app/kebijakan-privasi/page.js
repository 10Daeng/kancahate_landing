'use client';

import { Header, Footer } from '@/components/shared';

export default function PrivacyPolicy() {
  const lastUpdated = "30 Desember 2024";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Kebijakan Privasi & Kode Etik</h1>
          <p className="text-slate-500">Standar Kerahasiaan Psikologis | Terakhir diperbarui: {lastUpdated}</p>
        </header>

        <article className="prose prose-slate prose-orange max-w-none bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-8">
            <h4 className="text-orange-800 font-bold m-0 mb-2">Komitmen Utama Kami</h4>
            <p className="text-sm text-orange-800 m-0">
              Kancah Ate memegang teguh <strong>Asas Kerahasiaan (Confidentiality)</strong> sesuai standar etika psikologi. Cerita Anda aman bersama kami, dengan pengecualian situasi yang mengancam keselamatan nyawa.
            </p>
          </div>

          <h3 className="text-xl font-bold mt-6 mb-2">1. Pendahuluan & Informed Consent</h3>
          <p className="mb-4">
            Kebijakan Privasi ini menjelaskan bagaimana Kancah Ate ("kami") mengelola data pribadi dan data sensitif psikologis Anda. Dengan mengakses layanan ini, Anda memberikan persetujuan (informed consent) kepada kami untuk memproses data Anda untuk tujuan dukungan kesehatan mental (Emotional First Aid).
          </p>

          <h3 className="text-xl font-bold mt-6 mb-2">2. Pengumpulan Data (Asesmen & Konseling)</h3>
          <p className="mb-4">Kami mengumpulkan data yang relevan untuk proses triase dan konseling awal:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li><strong>Data Identitas (Anonymized):</strong> Nama panggilan, usia, jenis kelamin, dan latar belakang pendidikan (untuk konteks masalah).</li>
            <li><strong>Data Psikometrik:</strong> Skor dan jawaban dari alat tes (PHQ-9, GAD-7, Rosenberg, dll) yang digunakan untuk screening kondisi mental.</li>
            <li><strong>Data Sesi (Transcript):</strong> Riwayat percakapan dengan AI ("Kai") yang berisi keluhan, emosi, dan pemikiran pribadi.</li>
          </ul>

          <h3 className="text-xl font-bold mt-6 mb-2">3. Penggunaan Data & Batasan AI</h3>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Data Anda digunakan untuk memberikan respons empatik dan saran koping yang relevan melalui asisten AI kami.</li>
            <li>Sistem AI kami dilatih untuk mematuhi prinsip psikologi dasar, namun <strong>bukan pengganti psikolog klinis manusia</strong>.</li>
            <li>Data agregat (tanpa identitas) dapat digunakan untuk riset internal guna meningkatkan kualitas kesehatan mental masyarakat.</li>
          </ul>

          <h3 className="text-xl font-bold mt-6 mb-2">4. Protokol Kerahasiaan & Pengecualian (Limits of Confidentiality)</h3>
          <p className="mb-4">
            Seluruh percakapan dan hasil tes bersifat <strong>RAHASIA</strong>. Namun, demi keselamatan, kami berhak membuka kerahasiaan kepada pihak berwenang atau kontak darurat KEBOHONGAN jika dan hanya jika:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Terdapat indikasi kuat adanya risiko bunuh diri (Suicidal Risk) atau upaya menyakiti diri sendiri (Self-Harm).</li>
            <li>Terdapat ancaman nyata untuk menyakiti orang lain (Homicide Risk).</li>
            <li>Adanya indikasi kekerasan terhadap anak atau kelompok rentan.</li>
          </ul>
          <p className="text-sm italic text-slate-500 mb-4">
            *Ini adalah standar prosedur operasional keselamatan dalam layanan psikologi di seluruh dunia.
          </p>

          <h3 className="text-xl font-bold mt-6 mb-2">5. Keamanan & Penyimpanan Data</h3>
          <p className="mb-4">
            Data disimpan menggunakan enkripsi standar industri (Row Level Security). Akses ke data sensitif dibatasi secara ketat hanya untuk sistem AI dan administrator yang terikat sumpah kerahasiaan untuk keperluan monitoring kualitas dan intervensi krisis.
          </p>

          <h3 className="text-xl font-bold mt-6 mb-2">6. Hak Anda sebagai Klien (User)</h3>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li><strong>Hak untuk Mengakhiri:</strong> Anda berhak menghentikan sesi kapan saja tanpa paksaan.</li>
            <li><strong>Hak atas Penjelasan:</strong> Anda berhak mengetahui interpretasi alat tes yang Anda kerjakan (disediakan dalam hasil tes).</li>
            <li><strong>Hak Anonimitas:</strong> Anda diperbolehkan menggunakan nama samaran demi kenyamanan Anda, selama data klinis (usia/kondisi) tetap akurat untuk analisis.</li>
          </ul>

          <div className="mt-8 border-t border-slate-200 pt-8">
              <p className="text-xs text-slate-400">
                  Jika Anda memiliki pertanyaan mengenai etika data kami, silakan hubungi tim etik kami melalui email resmi yang tertera.
              </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
