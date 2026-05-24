'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import {
  Shield, Heart, Users, BookOpen, AlertTriangle, Send, CheckCircle,
  ChevronRight, ChevronLeft, Eye, EyeOff, Calendar, MapPin, FileText,
  Loader2, User, Phone, Mail, Clock, Camera, Mic, ClipboardList,
  Plus, X, ArrowRight, ShieldCheck,
} from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Identitas' },
  { num: 2, label: 'Pelaku & Korban' },
  { num: 3, label: 'Detail Kejadian' },
  { num: 4, label: 'Kronologi & Bukti' },
  { num: 5, label: 'Nilai & Kirim' },
];

const INCIDENT_TYPES = [
  { id: 'kekerasan_fisik', label: 'Kekerasan Fisik', icon: Shield, color: 'red', description: 'Pukulan, tendangan, dorongan, atau tindakan kekerasan fisik lainnya' },
  { id: 'kekerasan_verbal', label: 'Kekerasan Verbal', icon: AlertTriangle, color: 'orange', description: 'Menghina, mengancam, memanggil dengan nama tidak pantas' },
  { id: 'bullying_fisik', label: 'Bullying Fisik', icon: Users, color: 'rose', description: 'Memukul, menendang, merusak barang, mengambil barang paksa' },
  { id: 'bullying_verbal', label: 'Bullying Verbal', icon: AlertTriangle, color: 'amber', description: 'Mengejek, mengancam, nama panggilan tidak pantas, umpatan' },
  { id: 'bullying_psikologis', label: 'Bullying Psikologis/Sosial', icon: Users, color: 'yellow', description: 'Mengucilkan, menyebarkan rumor, manipulasi sosial' },
  { id: 'bullying_siber', label: 'Bullying Siber (Cyberbullying)', icon: Camera, color: 'blue', description: 'Pelecehan melalui media sosial, pesan singkat, penyebaran konten' },
  { id: 'intoleransi', label: 'Tindakan Intoleran', icon: Heart, color: 'purple', description: 'Diskriminasi berdasarkan suku, agama, ras, golongan, atau perbedaan lainnya' },
];

const REPORTER_STATUSES = [
  { id: 'siswa', label: 'Siswa' },
  { id: 'orang_tua', label: 'Orang Tua' },
  { id: 'guru', label: 'Guru' },
  { id: 'saksi', label: 'Saksi' },
  { id: 'lainnya', label: 'Lainnya' },
];

const BULLYING_SUB_TYPES = [
  { id: 'fisik', label: 'Fisik', description: 'Memukul, mendorong, menendang, merusak barang' },
  { id: 'verbal', label: 'Verbal', description: 'Mengejek, mengancam, nama panggilan tidak pantas' },
  { id: 'psikologis', label: 'Psikologis/Sosial', description: 'Mengucilkan, menyebarkan rumor, manipulasi' },
  { id: 'siber', label: 'Siber', description: 'Pelecehan via media sosial, pesan, penyebaran konten' },
];

const EVIDENCE_TYPES = [
  { id: 'foto', label: 'Foto', icon: Camera },
  { id: 'video', label: 'Video', icon: Camera },
  { id: 'screenshot', label: 'Tangkapan Layar (Screenshot)', icon: Camera },
  { id: 'rekaman_suara', label: 'Rekaman Suara', icon: Mic },
  { id: 'visum', label: 'Surat Keterangan Medis/Visum', icon: FileText },
  { id: 'barang_rusak', label: 'Barang Pribadi yang Dirusak', icon: ClipboardList },
];

const VALUES_OPTIONS = [
  {
    group: 'Budaya Sekolah Aman & Nyaman',
    items: [
      { id: 'aman', label: 'Merasa Aman', description: 'Setiap orang berhak merasa aman di lingkungan sekolah' },
      { id: 'nyaman', label: 'Merasa Nyaman', description: 'Lingkungan yang mendukung tanpa ancaman' },
      { id: 'saling_melindungi', label: 'Saling Melindungi', description: 'Peduli dan melindungi satu sama lain' },
      { id: 'tanpa_diskriminasi', label: 'Tanpa Diskriminasi', description: 'Tidak membeda-bedakan teman' },
    ],
  },
  {
    group: '7 Kebiasaan Baik Anak Indonesia',
    items: [
      { id: 'habit_jujur', label: 'Jujur', description: 'Berbicara dan bertindak jujur' },
      { id: 'habit_adil', label: 'Adil', description: 'Memperlakukan semua orang dengan adil' },
      { id: 'habit_toleran', label: 'Toleran', description: 'Menghargai perbedaan' },
      { id: 'habit_peduli', label: 'Peduli', description: 'Saling peduli dengan sesama' },
      { id: 'habit_menghormati', label: 'Menghormati', description: 'Menghormati orang lain terlepas dari perbedaan' },
      { id: 'habit_bertanggung_jawab', label: 'Bertanggung Jawab', description: 'Bertanggung jawab atas tindakan sendiri' },
      { id: 'habit_bekerja_sama', label: 'Bekerja Sama', description: 'Bermitra dan bekerja bersama, bukan saling menjatuhkan' },
    ],
  },
  {
    group: 'Nilai SOBAT',
    items: [
      { id: 'sobat_setia_kawan', label: 'Setia Kawan', description: 'Menjadi teman setia yang selalu ada' },
      { id: 'sobat_organisasi', label: 'Organisasi Rapi', description: 'Tertib dan teratur dalam bertindak' },
      { id: 'sobat_bangga_berprestasi', label: 'Bangga Berprestasi', description: 'Membanggakan diri dan sekolah dengan cara positif' },
      { id: 'sobat_aktif_dan_cerdas', label: 'Aktif & Cerdas', description: 'Aktif berpartisipasi dan berpikir cerdas' },
      { id: 'sobat_tangguh', label: 'Tangguh', description: 'Kuat dan tidak mudah menyerah' },
    ],
  },
];

const SEVERITY_OPTIONS = [
  { id: 'rendah', label: 'Rendah', description: 'Insiden ringan, tidak berulang', color: 'green' },
  { id: 'sedang', label: 'Sedang', description: 'Insiden yang mengganggu, perlu perhatian', color: 'yellow' },
  { id: 'tinggi', label: 'Tinggi', description: 'Insiden serius, memerlukan tindakan segera', color: 'red' },
];

const colorMap = {
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', shadow: 'shadow-red-200' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', shadow: 'shadow-orange-200' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', shadow: 'shadow-rose-200' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', shadow: 'shadow-amber-200' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', shadow: 'shadow-purple-200' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', shadow: 'shadow-blue-200' },
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
};

const inputClass = 'w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-medium';
const textareaClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-medium resize-none';

export default function LaporanKejadianPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    reporterName: '',
    reporterStatus: '',
    reporterPhone: '',
    reporterEmail: '',
    isAnonymous: false,

    perpetrators: [{ name: '', kelas: '', description: '' }],
    victims: [{ name: '', kelas: '', relation: '' }],

    incidentType: '',
    bullyingTypes: [],
    location: '',
    incidentDate: '',
    incidentTime: '',

    chronology: '',

    witnesses: [{ name: '', kelas: '', role: '' }],
    evidence: [],

    initialActions: '',
    reportedToCounselor: false,

    valuesViolated: [],
    severity: 'sedang',
  });

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1 && !form.isAnonymous && !form.reporterName.trim()) {
      setErrorMsg('Nama pelapor wajib diisi (atau pilih laporan anonim)');
      return;
    }
    if (step === 3 && !form.incidentType) {
      setErrorMsg('Pilih jenis insiden terlebih dahulu');
      return;
    }
    if (step === 4 && !form.chronology.trim()) {
      setErrorMsg('Kronologi kejadian wajib diisi');
      return;
    }
    setStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrev = () => { setErrorMsg(''); setStep(prev => Math.max(prev - 1, 1)); };

  const handleWitnessChange = (index, field, value) => {
    const updated = [...form.witnesses];
    updated[index] = { ...updated[index], [field]: value };
    updateForm('witnesses', updated);
  };

  const addWitness = () => {
    updateForm('witnesses', [...form.witnesses, { name: '', kelas: '', role: '' }]);
  };

  const removeWitness = (index) => {
    if (form.witnesses.length > 1) {
      updateForm('witnesses', form.witnesses.filter((_, i) => i !== index));
    }
  };

  const handlePerpChange = (index, field, value) => {
    const updated = [...form.perpetrators];
    updated[index] = { ...updated[index], [field]: value };
    updateForm('perpetrators', updated);
  };

  const addPerpetrator = () => {
    updateForm('perpetrators', [...form.perpetrators, { name: '', kelas: '', description: '' }]);
  };

  const removePerpetrator = (index) => {
    if (form.perpetrators.length > 1) {
      updateForm('perpetrators', form.perpetrators.filter((_, i) => i !== index));
    }
  };

  const handleVictimChange = (index, field, value) => {
    const updated = [...form.victims];
    updated[index] = { ...updated[index], [field]: value };
    updateForm('victims', updated);
  };

  const addVictim = () => {
    updateForm('victims', [...form.victims, { name: '', kelas: '', relation: '' }]);
  };

  const removeVictim = (index) => {
    if (form.victims.length > 1) {
      updateForm('victims', form.victims.filter((_, i) => i !== index));
    }
  };

  const toggleEvidence = (id) => {
    updateForm('evidence', form.evidence.includes(id)
      ? form.evidence.filter(e => e !== id)
      : [...form.evidence, id]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch('/api/incident-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Gagal mengirim laporan');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="pt-32 pb-20 px-4 md:px-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
              Laporan Berhasil Dikirim!
            </h2>
            <p className="text-slate-500 mb-3 max-w-md mx-auto">
              Terima kasih atas keberanianmu melaporkan insiden ini. Setiap laporan membantu menciptakan lingkungan yang lebih aman.
            </p>
            <p className="text-sm text-slate-400 mb-8">
              Lapormu akan ditinjau oleh tim yang berwenang. Jika ini kondisi darurat, hubungi <strong>119 ekstensi 8</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setSubmitted(false); setStep(1); setForm({ reporterName:'', reporterStatus:'', reporterPhone:'', reporterEmail:'', isAnonymous:false, perpetrators:[{name:'',kelas:'',description:''}], victims:[{name:'',kelas:'',relation:''}], incidentType:'', bullyingTypes:[], location:'', incidentDate:'', incidentTime:'', chronology:'', witnesses:[{name:'',kelas:'',role:''}], evidence:[], initialActions:'', reportedToCounselor:false, valuesViolated:[], severity:'sedang' }); }}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all"
              >
                Buat Laporan Baru
              </button>
              <Link href="/" className="px-6 py-3 border border-slate-200 hover:border-violet-200 text-slate-600 hover:text-violet-600 rounded-xl font-bold transition-all text-center">
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-full text-sm font-bold mb-4">
            <Shield size={16} /> Melapor itu Berani
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
            Laporan Kejadian Perundungan
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Laporkan tindakan kekerasan, bullying, atau intoleransi. Identitasmu dijaga kerahasiaannya.
          </p>
        </div>

        {/* Values Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><BookOpen size={20} /> Nilai-Nilai yang Kita Junjung</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="font-bold text-sm mb-1">Budaya Sekolah Aman & Nyaman</p>
              <p className="text-white/80 text-xs">Setiap orang berhak merasa aman</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="font-bold text-sm mb-1">7 Kebiasaan Baik Anak Indonesia</p>
              <p className="text-white/80 text-xs">Jujur, adil, toleran, peduli, menghormati, bertanggung jawab, bekerja sama</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="font-bold text-sm mb-1">Nilai SOBAT</p>
              <p className="text-white/80 text-xs">Setia kawan, Organisasi rapi, Bangga berprestasi, Aktif & cerdas, Tangguh</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {STEPS.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <button onClick={() => { if (s.num < step) setStep(s.num); }} className={`flex flex-col items-center ${s.num < step ? 'cursor-pointer' : 'cursor-default'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s.num < step ? 'bg-emerald-500 text-white' :
                  s.num === step ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' :
                  'bg-slate-200 text-slate-400'
                }`}>
                  {s.num < step ? <CheckCircle size={18} /> : s.num}
                </div>
                <span className="hidden sm:block text-xs mt-1 font-medium text-slate-400">{s.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`w-6 sm:w-12 h-0.5 mx-1 rounded-full transition-all ${
                  s.num < step ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

          {/* ===== STEP 1: Identitas Pelapor ===== */}
          {step === 1 && (
            <div className="p-6 md:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center"><User size={20} /></div>
                <h2 className="text-xl font-bold text-slate-800">Identitas Pelapor</h2>
              </div>
              <p className="text-slate-500 text-sm mb-6 ml-13">Data diri kamu sebagai pelapor. Bisa anonim jika tidak nyaman.</p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                  <AlertTriangle size={16} /> {errorMsg}
                </div>
              )}

              {/* Anonymous toggle */}
              <div className="mb-6 p-4 rounded-xl bg-violet-50 border border-violet-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {form.isAnonymous ? <EyeOff size={20} className="text-violet-600" /> : <Eye size={20} className="text-slate-400" />}
                    <div>
                      <p className="font-bold text-slate-700 text-sm">Laporkan Secara Anonim</p>
                      <p className="text-xs text-slate-400">Identitasmu tidak akan ditampilkan di laporan</p>
                    </div>
                  </div>
                  <button onClick={() => updateForm('isAnonymous', !form.isAnonymous)} className={`relative w-12 h-7 rounded-full transition-colors ${form.isAnonymous ? 'bg-violet-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${form.isAnonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              {!form.isAnonymous && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap <span className="text-red-400">*</span></label>
                    <input type="text" value={form.reporterName} onChange={e => updateForm('reporterName', e.target.value)} placeholder="Masukkan nama lengkap" className={inputClass} />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                    <div className="grid grid-cols-5 gap-2">
                      {REPORTER_STATUSES.map(s => (
                        <button key={s.id} onClick={() => updateForm('reporterStatus', s.id)}
                          className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all text-center ${
                            form.reporterStatus === s.id ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'
                          }`}>{s.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1"><Phone size={14} /> Nomor Telepon/WhatsApp</label>
                      <input type="tel" value={form.reporterPhone} onChange={e => updateForm('reporterPhone', e.target.value)} placeholder="08xxxxxxxxxx" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1"><Mail size={14} /> Email</label>
                      <input type="email" value={form.reporterEmail} onChange={e => updateForm('reporterEmail', e.target.value)} placeholder="email@contoh.com" className={inputClass} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-8">
                <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all">
                  Lanjutkan <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 2: Pelaku & Korban ===== */}
          {step === 2 && (
            <div className="p-6 md:p-10">
              <button onClick={handlePrev} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm font-medium mb-4 transition-colors"><ChevronLeft size={16} /> Kembali</button>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Informasi Pelaku & Korban</h2>
              <p className="text-slate-500 text-sm mb-6">Isi data pelaku dan korban sejelas mungkin untuk membantu investigasi. Jika lebih dari satu, klik Tambah.</p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2"><AlertTriangle size={16} /> {errorMsg}</div>
              )}

              {/* Pelaku */}
              <div className="mb-8">
                <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-50 text-red-500 rounded-lg flex items-center justify-center text-xs font-black">2</div>
                  Informasi Terlapor (Pelaku)
                </h3>
                {form.perpetrators.map((perp, idx) => (
                  <div key={idx} className="space-y-3 pl-4 border-l-2 border-red-100 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">Pelaku {form.perpetrators.length > 1 ? idx + 1 : ''}</span>
                      {form.perpetrators.length > 1 && (
                        <button onClick={() => removePerpetrator(idx)} className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1"><X size={14} /> Hapus</button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap Pelaku</label>
                      <input type="text" value={perp.name} onChange={e => handlePerpChange(idx, 'name', e.target.value)} placeholder="Jika diketahui" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Kelas / Jurusan</label>
                      <input type="text" value={perp.kelas} onChange={e => handlePerpChange(idx, 'kelas', e.target.value)} placeholder="Misal: XI IPA 2" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Ciri-ciri Fisik <span className="text-slate-400 font-normal">(opsional)</span></label>
                      <textarea value={perp.description} onChange={e => handlePerpChange(idx, 'description', e.target.value)} placeholder="Tinggi, berambut pirang, berkacamata, dll." rows={2} className={textareaClass} />
                    </div>
                  </div>
                ))}
                <button onClick={addPerpetrator} className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-bold ml-4 transition-colors">
                  <Plus size={16} /> Tambah Pelaku
                </button>
              </div>

              {/* Korban */}
              <div className="mb-8">
                <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black">3</div>
                  Informasi Korban
                </h3>
                {form.victims.map((vic, idx) => (
                  <div key={idx} className="space-y-3 pl-4 border-l-2 border-blue-100 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Korban {form.victims.length > 1 ? idx + 1 : ''}</span>
                      {form.victims.length > 1 && (
                        <button onClick={() => removeVictim(idx)} className="text-blue-400 hover:text-blue-600 text-xs font-bold flex items-center gap-1"><X size={14} /> Hapus</button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap Korban</label>
                      <input type="text" value={vic.name} onChange={e => handleVictimChange(idx, 'name', e.target.value)} placeholder="Jika diketahui" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Kelas / Jurusan Korban</label>
                      <input type="text" value={vic.kelas} onChange={e => handleVictimChange(idx, 'kelas', e.target.value)} placeholder="Misal: X IPS 1" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Hubungan dengan Pelaku</label>
                      <input type="text" value={vic.relation} onChange={e => handleVictimChange(idx, 'relation', e.target.value)} placeholder="Teman sekelas, senior, dll." className={inputClass} />
                    </div>
                  </div>
                ))}
                <button onClick={addVictim} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-bold ml-4 transition-colors">
                  <Plus size={16} /> Tambah Korban
                </button>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={handlePrev} className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl font-bold transition-all">Kembali</button>
                <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all">Lanjutkan <ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          {/* ===== STEP 3: Detail Kejadian ===== */}
          {step === 3 && (
            <div className="p-6 md:p-10">
              <button onClick={handlePrev} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm font-medium mb-4 transition-colors"><ChevronLeft size={16} /> Kembali</button>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Detail Kejadian</h2>
              <p className="text-slate-500 text-sm mb-6">Jenis insiden, waktu, dan tempat kejadian.</p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2"><AlertTriangle size={16} /> {errorMsg}</div>
              )}

              {/* Incident Type */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Jenis Insiden <span className="text-red-400">*</span></label>
                <div className="grid gap-3">
                  {INCIDENT_TYPES.map(type => {
                    const colors = colorMap[type.color];
                    const IconComp = type.icon;
                    const isSelected = form.incidentType === type.id;
                    return (
                      <button key={type.id} onClick={() => { updateForm('incidentType', type.id); setErrorMsg(''); }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${isSelected ? `${colors.bg} ${colors.border} ${colors.shadow} shadow-lg` : 'border-slate-100 hover:border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? colors.text : 'text-slate-400'}`} style={{ backgroundColor: isSelected ? undefined : '#f8fafc' }}>
                            <IconComp size={20} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-bold text-sm ${isSelected ? colors.text : 'text-slate-800'}`}>{type.label}</p>
                            <p className="text-xs text-slate-400">{type.description}</p>
                          </div>
                          {isSelected && <CheckCircle size={18} className={colors.text} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bullying Sub-Types (if bullying selected) */}
              {form.incidentType && form.incidentType.startsWith('bullying') && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Bentuk Bullying yang Dialami</label>
                  <div className="grid gap-2">
                    {BULLYING_SUB_TYPES.map(bt => {
                      const isSelected = form.bullyingTypes.includes(bt.id);
                      return (
                        <button key={bt.id} onClick={() => updateForm('bullyingTypes', isSelected ? form.bullyingTypes.filter(t => t !== bt.id) : [...form.bullyingTypes, bt.id])}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${isSelected ? 'bg-violet-50 border-violet-200' : 'border-slate-100 hover:border-slate-200'}`}>
                          <div className={`w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-violet-600 border-violet-600' : 'border-slate-300'}`}>
                            {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <div className="flex-1">
                            <span className={`block text-sm font-bold ${isSelected ? 'text-violet-700' : 'text-slate-700'}`}>{bt.label}</span>
                            <span className="block text-xs text-slate-400">{bt.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Severity */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Seberapa serius insiden ini?</label>
                <div className="grid grid-cols-3 gap-3">
                  {SEVERITY_OPTIONS.map(opt => {
                    const isSelected = form.severity === opt.id;
                    const colors = colorMap[opt.color];
                    return (
                      <button key={opt.id} onClick={() => updateForm('severity', opt.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${isSelected ? `${colors.bg} ${colors.border}` : 'border-slate-100 hover:border-slate-200'}`}>
                        <span className={`block font-bold text-sm ${isSelected ? colors.text : 'text-slate-700'}`}>{opt.label}</span>
                        <span className="block text-xs text-slate-400 mt-1">{opt.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location, Date, Time */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><MapPin size={14} className="text-violet-500" /> Lokasi Kejadian</label>
                  <input type="text" value={form.location} onChange={e => updateForm('location', e.target.value)} placeholder="Misal: Ruang kelas 7A, Koridor lantai 2, Kantin..." className={inputClass} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Calendar size={14} className="text-violet-500" /> Tanggal Kejadian</label>
                    <input type="date" value={form.incidentDate} onChange={e => updateForm('incidentDate', e.target.value)} max={new Date().toISOString().split('T')[0]} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Clock size={14} className="text-violet-500" /> Waktu Kejadian</label>
                    <input type="time" value={form.incidentTime} onChange={e => updateForm('incidentTime', e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={handlePrev} className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl font-bold transition-all">Kembali</button>
                <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all">Lanjutkan <ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          {/* ===== STEP 4: Kronologi, Saksi, Bukti ===== */}
          {step === 4 && (
            <div className="p-6 md:p-10">
              <button onClick={handlePrev} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm font-medium mb-4 transition-colors"><ChevronLeft size={16} /> Kembali</button>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Kronologi, Saksi & Bukti</h2>
              <p className="text-slate-500 text-sm mb-6">Ceritakan kejadian secara urut dan faktual (5W1H).</p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2"><AlertTriangle size={16} /> {errorMsg}</div>
              )}

              {/* Kronologi */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Kronologi Kejadian (5W1H) <span className="text-red-400">*</span></label>
                <p className="text-xs text-slate-400 mb-2">Tuliskan secara urut dan faktual: Apa yang terjadi? Siapa yang terlibat? Kapan dan di mana? Mengapa terjadi? Bagaimana korban merespon?</p>
                <textarea value={form.chronology} onChange={e => updateForm('chronology', e.target.value)} placeholder="Ceritakan kejadian secara detail dan urut dari awal sampai akhir. Jelaskan apa yang dikatakan atau dilakukan oleh pelaku dan bagaimana reaksi korban..." rows={6} className={textareaClass} />
              </div>

              {/* Saksi */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Saksi</label>
                <p className="text-xs text-slate-400 mb-3">Apakah ada orang lain yang melihat atau mendengar kejadian tersebut?</p>
                {form.witnesses.map((w, idx) => (
                  <div key={idx} className="flex gap-2 mb-3 items-start">
                    <input type="text" value={w.name} onChange={e => handleWitnessChange(idx, 'name', e.target.value)} placeholder="Nama saksi" className={`${inputClass} h-12 flex-1`} />
                    <input type="text" value={w.kelas} onChange={e => handleWitnessChange(idx, 'kelas', e.target.value)} placeholder="Kelas/Peran" className={`${inputClass} h-12 flex-1`} />
                    {form.witnesses.length > 1 && (
                      <button onClick={() => removeWitness(idx)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><X size={18} /></button>
                    )}
                  </div>
                ))}
                <button onClick={addWitness} className="flex items-center gap-1 text-violet-600 hover:text-violet-700 text-sm font-bold transition-colors">
                  <Plus size={16} /> Tambah Saksi
                </button>
              </div>

              {/* Bukti */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Bukti Pendukung</label>
                <p className="text-xs text-slate-400 mb-3">Pilih jenis bukti yang kamu miliki untuk memperkuat laporan.</p>
                <div className="grid grid-cols-2 gap-2">
                  {EVIDENCE_TYPES.map(et => {
                    const isSelected = form.evidence.includes(et.id);
                    const IconComp = et.icon;
                    return (
                      <button key={et.id} onClick={() => toggleEvidence(et.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2 ${isSelected ? 'border-violet-500 bg-violet-50' : 'border-slate-100 hover:border-slate-200'}`}>
                        <IconComp size={16} className={isSelected ? 'text-violet-600' : 'text-slate-400'} />
                        <span className={`text-xs font-bold ${isSelected ? 'text-violet-700' : 'text-slate-600'}`}>{et.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tindakan Awal */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Tindakan Awal yang Sudah Dilakukan</label>
                <textarea value={form.initialActions} onChange={e => updateForm('initialActions', e.target.value)} placeholder="Misal: Sudah dilaporkan ke wali kelas, sudah bicara dengan teman, sudah berobat ke UKS..." rows={3} className={textareaClass} />
                <div className="mt-3 flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <button onClick={() => updateForm('reportedToCounselor', !form.reportedToCounselor)}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.reportedToCounselor ? 'bg-violet-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.reportedToCounselor ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Sudah dilaporkan ke Guru BK / Wali Kelas?</p>
                    <p className="text-xs text-slate-400">Centang jika sudah melaporkan ke pihak sekolah</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={handlePrev} className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl font-bold transition-all">Kembali</button>
                <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all">Lanjutkan <ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          {/* ===== STEP 5: Nilai & Kirim ===== */}
          {step === 5 && (
            <div className="p-6 md:p-10">
              <button onClick={handlePrev} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm font-medium mb-4 transition-colors"><ChevronLeft size={16} /> Kembali</button>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Nilai Dilanggar & Ringkasan</h2>
              <p className="text-slate-500 text-sm mb-6">Pilih nilai-nilai yang dilanggar, lalu review laporanmu.</p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2"><AlertTriangle size={16} /> {errorMsg}</div>
              )}

              {/* Values */}
              <div className="space-y-6 mb-8">
                {VALUES_OPTIONS.map((group) => (
                  <div key={group.group}>
                    <h4 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />{group.group}
                    </h4>
                    <div className="grid gap-2">
                      {group.items.map((item) => {
                        const isSelected = form.valuesViolated.includes(item.id);
                        return (
                          <button key={item.id} onClick={() => updateForm('valuesViolated', isSelected ? form.valuesViolated.filter(v => v !== item.id) : [...form.valuesViolated, item.id])}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${isSelected ? 'bg-violet-50 border-violet-200 shadow-sm' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                            <div className={`w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-violet-600 border-violet-600' : 'border-slate-300'}`}>
                              {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`block text-sm font-bold ${isSelected ? 'text-violet-700' : 'text-slate-700'}`}>{item.label}</span>
                              <span className="block text-xs text-slate-400">{item.description}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100">
                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><ClipboardList size={18} className="text-violet-500" /> Ringkasan Laporan</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Jenis Insiden</span><span className="font-bold text-slate-800">{INCIDENT_TYPES.find(t => t.id === form.incidentType)?.label || '-'}</span></div>
                  <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Tingkat Keparahan</span><span className={`font-bold ${form.severity === 'tinggi' ? 'text-red-600' : form.severity === 'sedang' ? 'text-yellow-600' : 'text-green-600'}`}>{SEVERITY_OPTIONS.find(s => s.id === form.severity)?.label}</span></div>
                  {form.bullyingTypes.length > 0 && (
                    <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Bentuk Bullying</span>
                      <div className="flex flex-wrap gap-1">{form.bullyingTypes.map(bt => <span key={bt} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg">{BULLYING_SUB_TYPES.find(b => b.id === bt)?.label || bt}</span>)}</div>
                    </div>
                  )}
                  {form.location && <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Lokasi</span><span className="text-slate-700">{form.location}</span></div>}
                  {form.incidentDate && <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Tanggal</span><span className="text-slate-700">{new Date(form.incidentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                  {form.incidentTime && <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Waktu</span><span className="text-slate-700">{form.incidentTime}</span></div>}
                  {form.perpetrators.some(p => p.name) && (
                    <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Pelaku</span>
                      <div className="flex flex-wrap gap-1">{form.perpetrators.filter(p => p.name).map((p, i) => <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg">{p.name}{p.kelas ? ` (${p.kelas})` : ''}</span>)}</div>
                    </div>
                  )}
                  {form.victims.some(v => v.name) && (
                    <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Korban</span>
                      <div className="flex flex-wrap gap-1">{form.victims.filter(v => v.name).map((v, i) => <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{v.name}{v.kelas ? ` (${v.kelas})` : ''}</span>)}</div>
                    </div>
                  )}
                  <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Pelapor</span><span className="font-bold text-slate-800">{form.isAnonymous ? 'Anonim (identitas tersembunyi)' : (form.reporterName || '-')}</span></div>
                  {form.evidence.length > 0 && (
                    <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Bukti</span>
                      <div className="flex flex-wrap gap-1">{form.evidence.map(e => <span key={e} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{EVIDENCE_TYPES.find(et => et.id === e)?.label || e}</span>)}</div>
                    </div>
                  )}
                  {form.valuesViolated.length > 0 && (
                    <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Nilai Dilanggar</span>
                      <div className="flex flex-wrap gap-1">{form.valuesViolated.map(vId => { const allItems = VALUES_OPTIONS.flatMap(g => g.items); const item = allItems.find(i => i.id === vId); return item ? <span key={vId} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg">{item.label}</span> : null; })}</div>
                    </div>
                  )}
                  {form.reportedToCounselor && <div className="flex items-start gap-3"><span className="text-slate-400 w-32 shrink-0">Dilaporkan ke BK</span><span className="text-emerald-600 font-bold">Ya</span></div>}
                </div>
              </div>

              {/* Privacy */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
                <ShieldCheck size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-bold mb-1">Kerahasiaan Terjamin</p>
                  <p>Laporan ini bersifat rahasia. Hanya tim penanganan yang berwenang yang dapat mengaksesnya.{form.isAnonymous ? ' Identitasmu tidak akan ditampilkan.' : ' Identitasmu hanya terlihat oleh tim penanganan.'}</p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={handlePrev} className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl font-bold transition-all">Kembali</button>
                <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Mengirim...</> : <><Send size={18} /> Kirim Laporan</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Banner */}
        <div className="mt-8 bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 border border-rose-100 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-500 shrink-0"><AlertTriangle size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Butuh Bantuan Darurat?</h3>
              <p className="text-slate-500 text-sm mb-3">Jika kamu dalam kondisi darurat atau membahayakan, segera hubungi:</p>
              <div className="flex flex-wrap gap-2">
                <a href="tel:119" className="px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors">119 Ekstensi 8</a>
                <a href="https://wa.me/6281210001010" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white border border-green-200 rounded-lg text-sm font-bold text-green-600 hover:bg-green-50 transition-colors">WhatsApp Sejiwa</a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}