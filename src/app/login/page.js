'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, AlertTriangle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        // LOGIN dengan API Neon
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!data.success) {
          setErrorMsg(data.error || 'Login gagal');
          return;
        }

        // Simpan token di localStorage (untuk client-side)
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }

        // Cek apakah admin
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'kancahate.official@gmail.com,lenterabatin.id@gmail.com')
          .split(',')
          .map(e => e.trim().toLowerCase());

        if (adminEmails.includes(email.toLowerCase())) {
          router.push('/kancah-private-auth');
        } else {
          router.push('/dashboard');
        }

      } else {
        // REGISTER dengan API Neon
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: email.split('@')[0] })
        });
        const data = await response.json();

        if (!data.success) {
          setErrorMsg(data.error || 'Pendaftaran gagal');
          return;
        }

        setSuccessMsg('Pendaftaran berhasil! Silakan login.');
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-row overflow-hidden bg-slate-50 text-slate-800 font-sans">

      {/* Left Side: Visual/Hero (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-slate-900 lg:flex overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-br from-violet-600 to-indigo-900 opacity-90"></div>

        {/* Decorative Shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        {/* Real Photo Background - Indonesian Youth */}
        <div className="absolute inset-0 z-10">
          <img
            src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&auto=format&fit=crop"
            alt="Indonesian teenagers"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/90 via-violet-800/60 to-indigo-900/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
             <Image
               src="/logo.png"
               alt="Kancah Ate Logo"
               width={40}
               height={40}
               className="object-contain"
             />
             <span className="font-bold text-2xl tracking-tight">Kancah Ate</span>
          </div>

          <div className="max-w-lg">
            <h2 className="mb-6 text-4xl font-bold leading-tight">
              Temukan kedamaian dan keseimbangan di setiap langkah.
            </h2>
            <p className="text-lg font-medium text-white/80 leading-relaxed">
              Bergabunglah dengan komunitas yang mendukung pertumbuhan mental dan emosional Anda.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-white/60">
            <span>© 2026 Kancah Ate</span>
            <span className="w-1 h-1 rounded-full bg-white/40"></span>
            <Link href="/kebijakan-privasi" className="hover:text-white transition-colors">Privasi</Link>
            <span className="w-1 h-1 rounded-full bg-white/40"></span>
            <Link href="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex w-full flex-col justify-center overflow-y-auto bg-white px-4 py-12 lg:w-1/2 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-[480px] flex flex-col">

          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
             <Image
               src="/logo.png"
               alt="Kancah Ate Logo"
               width={40}
               height={40}
               className="object-contain"
             />
             <span className="text-xl font-bold text-slate-800">Kancah Ate</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-2">
               {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
            </h1>
            <p className="text-slate-500">
               {isLogin ? 'Masuk untuk mengelola hasil tes dan konseling.' : 'Daftar gratis untuk mulai perjalanan kesehatan mentalmu.'}
            </p>
          </div>

          {/* Error / Success Alerts */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 flex items-start gap-3 border border-red-100 animate-fade-in">
               <AlertTriangle size={20} className="shrink-0 mt-0.5" />
               <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 flex items-start gap-3 border border-green-100 animate-fade-in">
               <p className="text-sm font-bold">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
               <span className="text-sm font-bold text-slate-700">Email</span>
               <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none">
                     <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-xl border-none bg-slate-50 text-slate-800 placeholder-slate-400 font-medium focus:ring-2 focus:ring-violet-500 transition-all"
                    placeholder="nama@email.com"
                  />
               </div>
            </label>

            <label className="flex flex-col gap-2">
               <span className="text-sm font-bold text-slate-700">Kata Sandi</span>
               <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none">
                     <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-12 rounded-xl border-none bg-slate-50 text-slate-800 placeholder-slate-400 font-medium focus:ring-2 focus:ring-violet-500 transition-all"
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-violet-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
               </div>
            </label>

            <button
               type="submit"
               disabled={loading}
               className="mt-2 h-14 w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg shadow-lg shadow-violet-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Masuk Sekarang' : 'Buat Akun')}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button
               onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
               className="font-bold text-orange-500 hover:text-orange-600 hover:underline transition-colors"
            >
               {isLogin ? 'Daftar Sekarang' : 'Masuk di sini'}
            </button>
          </div>

          <div className="mt-8 text-center">
             <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                ← Kembali ke Beranda
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
