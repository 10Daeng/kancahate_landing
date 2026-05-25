'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createUserProfile } from '@/services/assessmentService';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Loader2, CheckCircle2, User, Calendar, GraduationCap, MapPin } from 'lucide-react';

export default function LengkapiProfil() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dob: '',
    education_status: '',
    institution_type: '',
    occupation: '',
    location: '',
    location_custom: '',
    language_preference: ''
  });

  const checkAuth = async () => {
    try {
      // Check if this is a password recovery flow (not signup)
      // Supabase uses type=recovery in the URL for password reset
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // If this is a recovery/reset flow, redirect to reset-password page
      if (hashParams.get('type') === 'recovery' || urlParams.get('type') === 'recovery') {
        router.push('/reset-password' + window.location.hash);
        return;
      }

      if (status === 'loading') return;
      
      if (!session) {
        // Not logged in, redirect to login
        router.push('/login');
        return;
      }

      setUser(session.user);
      
      // Profile check skipped since it needs Drizzle implementation
      setLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        setError('Nama harus diisi');
        return false;
      }
      if (!formData.gender) {
        setError('Jenis kelamin harus dipilih');
        return false;
      }
      if (!formData.dob) {
        setError('Tanggal lahir harus diisi');
        return false;
      }
      // Validate age (must be at least 10 years old)
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 10) {
        setError('Usia minimal 10 tahun');
        return false;
      }
      if (age > 100) {
        setError('Tanggal lahir tidak valid');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.education_status) {
        setError('Status pendidikan harus dipilih');
        return false;
      }
      // Validate institution_type if education_status includes "Pelajar" or "Mahasiswa"
      if ((formData.education_status.includes('Pelajar') || formData.education_status.includes('Mahasiswa')) && !formData.institution_type) {
        setError('Jenis institusi harus dipilih');
        return false;
      }
      // Validate occupation if education_status includes "Bekerja"
      if (formData.education_status.includes('Bekerja') && !formData.occupation.trim()) {
        setError('Pekerjaan harus diisi');
        return false;
      }
    }

    if (step === 3) {
      if (!formData.location) {
        setError('Lokasi harus dipilih');
        return false;
      }
      if (formData.location === 'Lainnya' && !formData.location_custom.trim()) {
        setError('Nama kota harus diisi');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    setSubmitting(true);
    setError('');

    try {
      const result = await createUserProfile(formData);

      if (result.success) {
        // Success! Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(result.error || 'Gagal menyimpan profil');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting profile:', error);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-orange-50 font-sans">
      <Header />

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-600">Langkah {step} dari 3</span>
            <span className="text-sm font-bold text-violet-600">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-600 to-orange-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            Lengkapi Profilmu
          </h1>
          <p className="text-slate-600 text-lg">
            Agar Kai bisa lebih mengenal kamu dan memberikan dukungan yang lebih personal
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                    <User size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Informasi Pribadi</h2>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nama Panggilan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: Budi"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Laki-laki', 'Perempuan', 'Tidak ingin menjawab'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: option }))}
                        className={`px-4 py-3 rounded-xl font-bold transition-all ${
                          formData.gender === option
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {option === 'Laki-laki' ? '👨' : option === 'Perempuan' ? '👩' : '🙋'} {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Kami butuh ini untuk menghitung usiamu dengan tepat</p>
                </div>
              </div>
            )}

            {/* Step 2: Education */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <GraduationCap size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Pendidikan & Pekerjaan</h2>
                </div>

                {/* Education Status */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Status Pendidikan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="education_status"
                    value={formData.education_status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih status pendidikan</option>
                    <option value="Pelajar SD/SMP/SMA">Pelajar SD/SMP/SMA</option>
                    <option value="Mahasiswa D3/S1">Mahasiswa D3/S1</option>
                    <option value="Sudah Bekerja">Sudah Bekerja</option>
                    <option value="Sedang Mencari Kerja">Sedang Mencari Kerja</option>
                    <option value="Lulus/Sudah Tidak Sekolah">Lulus/Sudah Tidak Sekolah</option>
                  </select>
                </div>

                {/* Institution Type (conditional) */}
                {(formData.education_status.includes('Pelajar') || formData.education_status.includes('Mahasiswa')) && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Jenis Institusi <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Negeri', 'Swasta'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, institution_type: option }))}
                          className={`px-4 py-3 rounded-xl font-bold transition-all ${
                            formData.institution_type === option
                              ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Occupation (conditional) */}
                {formData.education_status.includes('Bekerja') && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Pekerjaan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="Contoh: Karyawan Swasta, Wiraswasta, dll"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <MapPin size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Lokasi</h2>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Kota/Kabupaten <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih lokasi</option>
                    <option value="Madura (Sumenep)">Madura (Sumenep)</option>
                    <option value="Madura (Pamekasan)">Madura (Pamekasan)</option>
                    <option value="Madura (Sampang)">Madura (Sampang)</option>
                    <option value="Madura (Bangkalan)">Madura (Bangkalan)</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Jakarta">Jakarta</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Semarang">Semarang</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                    <option value="Malang">Malang</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Custom Location (conditional) */}
                {formData.location === 'Lainnya' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Nama Kota <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location_custom"
                      value={formData.location_custom}
                      onChange={handleInputChange}
                      placeholder="Contoh: Surabaya"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Language Preference */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Bahasa yang Nyaman
                  </label>
                  <select
                    name="language_preference"
                    value={formData.language_preference}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Bahasa Indonesia + Madura">Bahasa Indonesia + Madura</option>
                    <option value="Bahasa Indonesia + Jawa">Bahasa Indonesia + Jawa</option>
                    <option value="Bahasa Indonesia + Inggris">Bahasa Indonesia + Inggris</option>
                    <option value="Bahasa Indonesia saja">Bahasa Indonesia saja</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Kai akan menyesuaikan gaya bahasa sesuai pilihanmu</p>
                </div>

                {/* Success Preview */}
                <div className="mt-8 p-6 bg-gradient-to-r from-violet-50 to-orange-50 rounded-2xl border border-violet-100">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-violet-600 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-bold text-slate-800 mb-2">Hampir Selesai!</h3>
                      <p className="text-sm text-slate-600">
                        Setelah ini, kamu bisa langsung mulai curhat dengan Kai tanpa perlu isi data lagi. Semua informasi tersimpan aman di akunmu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  Kembali
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-orange-500 hover:from-violet-700 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-orange-500 hover:from-violet-700 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Selesai
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
