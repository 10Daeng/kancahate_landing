// --- CONSTANTS: INTAKE FLOW ---
// Pertanyaan-pertanyaan untuk fase pengumpulan data awal

export const INTAKE_FLOW = [
  { id: 'name', text: 'Halo! Kenalin aku Kai, teman ceritamu di sini. Agar kita lebih akrab, boleh tahu siapa nama panggilanmu?' },
  { 
    id: 'gender', 
    text: 'Senang berkenalan, {name}! Kalau boleh tahu, kamu lebih nyaman disapa sebagai apa? (Laki-laki / Perempuan / Tidak ingin menjawab)',
    options: ['Laki-laki', 'Perempuan', 'Tidak ingin menjawab']
  },
  { id: 'dob', text: 'Kalau boleh tahu, tanggal lahirmu kapan? (Format: DD/MM/YYYY)' },
  { 
    id: 'education_status', 
    text: 'Sekarang kamu statusnya apa nih? Pelajar, mahasiswa, atau sudah kerja?',
    options: ['Pelajar', 'Mahasiswa', 'Bekerja', 'Lainnya'] 
  },
  { 
    id: 'institution_type', 
    text: 'Boleh tahu kamu sekolah/kuliah di mana? (Negeri/Swasta)',
    options: ['Negeri', 'Swasta'],
    condition: (userData) => ['Pelajar', 'Mahasiswa'].includes(userData.education_status)
  },
  { id: 'location', text: 'Di kota atau kabupaten mana kamu tinggal sekarang?' }
];

export default INTAKE_FLOW;
