'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, AlertTriangle, Loader2, Sparkles, ArrowLeft, KeyRound } from 'lucide-react';
import { signIn, getSession } from 'next-auth/react';
import { Turnstile } from '@marsidev/react-turnstile';
import { checkIsAdmin } from '@/app/admin/actions';

// Greeting dinamis berdasarkan waktu lokal
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)  return { emoji: '🌅', kata: 'Pagi ini,' };
  if (hour >= 12 && hour < 15) return { emoji: '☀️',  kata: 'Siang ini,' };
  if (hour >= 15 && hour < 18) return { emoji: '🌆', kata: 'Sore ini,' };
  return                               { emoji: '🌙', kata: 'Malam ini,' };
}

// Floating emoji decoration
function FloatingEmoji({ emoji, style }) {
  return (
    <motion.span
      className="absolute text-2xl select-none pointer-events-none"
      style={style}
      animate={{
        y: [0, -10, 0],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2,
      }}
    >
      {emoji}
    </motion.span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Login/Register, 2: OTP
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!turnstileToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      setErrorMsg('Harap selesaikan verifikasi keamanan.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, turnstileToken }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      setSuccessMsg(data.message);
      // Reset form
      setName('');
      setPassword('');
      setTurnstileToken('');
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!turnstileToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      setErrorMsg('Harap selesaikan verifikasi keamanan.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      if (data.requireOtp === false) {
        // Admin darurat bypass
        await submitLoginNextAuth('');
      } else {
        setSuccessMsg(data.message);
        setStep(2);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat meminta OTP.');
    } finally {
      setLoading(false);
    }
  };

  const submitLoginNextAuth = async (otpCode) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        otp: otpCode
      });

      if (result?.error) {
        throw new Error(result.error);
      } else {
        const session = await getSession();
        const { isAdmin } = await checkIsAdmin();
        if (isAdmin) {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat login.');
      setLoading(false);
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    await submitLoginNextAuth(otp);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-white font-sans">
      {/* ===== LEFT SIDE: Illustrated/Visual Panel ===== */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between overflow-hidden">
        {/* Aurora gradient background */}
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 80% at 20% 20%, rgba(124, 58, 237, 0.8) 0%, transparent 55%),
              radial-gradient(ellipse 70% 70% at 80% 80%, rgba(236, 72, 153, 0.7) 0%, transparent 55%),
              radial-gradient(ellipse 60% 60% at 70% 20%, rgba(168, 85, 247, 0.5) 0%, transparent 55%),
              #1a0533
            `
          }}
        />

        {/* Animated blob */}
        <motion.div
          className="absolute w-64 h-64 rounded-full opacity-20"
          style={{
            background: 'linear-gradient(135deg, #EC4899, #F97316)',
            bottom: '10%',
            left: '-5%',
          }}
          animate={{
            borderRadius: ['60% 40% 30% 70% / 60% 30% 70% 40%', '30% 60% 70% 40% / 50% 60% 30% 60%', '60% 40% 30% 70% / 60% 30% 70% 40%'],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating emojis */}
        <FloatingEmoji emoji="💜" style={{ top: '15%', right: '15%' }} />
        <FloatingEmoji emoji="✨" style={{ top: '35%', left: '10%' }} />
        <FloatingEmoji emoji="🫂" style={{ bottom: '30%', right: '10%' }} />
        <FloatingEmoji emoji="💬" style={{ bottom: '15%', left: '20%' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Kancah Ate Logo" width={40} height={40} className="object-contain" />
            <span className="font-extrabold text-2xl tracking-tight">Kancah Ate</span>
          </div>

          <div className="max-w-sm">
            {(() => { const g = getGreeting(); return (
              <>
                <div className="text-5xl mb-6">{g.emoji}</div>
                <h2 className="text-4xl font-black leading-tight mb-5">
                  {g.kata}<br />kamu nggak perlu<br />
              <span style={{
                background: 'linear-gradient(135deg, #C084FC, #F9A8D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                    sendirian.
                  </span>
                </h2>
              </>
            ); })()}
            <p className="text-white/65 font-medium leading-relaxed">
              Bergabung dan dapatkan teman cerita, tes kepribadian, dan ruang aman untuk tumbuh.
            </p>

            <div className="flex flex-col gap-2.5 mt-8">
              {[
                { emoji: '🔒', text: 'Keamanan 2-Langkah & Terverifikasi Cloudflare' },
                { emoji: '✨', text: 'Gratis selamanya untuk semua fitur dasar' },
                { emoji: '💜', text: 'Didukung oleh komunitas peduli mental health' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-white/65 text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-white/40">
            <span>© 2026 Kancah Ate</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <Link href="/kebijakan-privasi" className="hover:text-white/70 transition-colors">Privasi</Link>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <Link href="/syarat-ketentuan" className="hover:text-white/70 transition-colors">Syarat</Link>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE: Form ===== */}
      <div className="flex w-full flex-col justify-center overflow-y-auto bg-white px-5 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[440px]">
          
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-violet-600 transition-colors mb-8">
            <ArrowLeft size={15} />
            Kembali ke Beranda
          </Link>

          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Image src="/logo.png" alt="Kancah Ate Logo" width={36} height={36} className="object-contain" />
            <span className="text-xl font-extrabold text-slate-800">Kancah <span style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Ate</span></span>
          </div>

          {step === 1 && (
            <div
              className="flex mb-8 p-1 rounded-2xl gap-1"
              style={{ background: 'rgba(124,58,237,0.06)' }}
            >
              {['Masuk', 'Daftar'].map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => { setIsLogin(i === 0); setErrorMsg(''); setSuccessMsg(''); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style={
                    (i === 0) === isLogin
                      ? {
                          background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                          color: 'white',
                          boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                        }
                      : { color: '#64748B' }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step === 2 ? 'otp' : (isLogin ? 'login' : 'register')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1.5">
                {step === 2 ? 'Verifikasi 2 Langkah 🔐' : (isLogin ? 'Selamat Datang Kembali 👋' : 'Buat Akun Baru ✨')}
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                {step === 2 ? `Masukkan 6 digit OTP yang dikirim ke ${email}.` : (isLogin
                  ? 'Lanjutkan perjalanan kesehatan mentalmu.'
                  : 'Gratis selamanya. Mulai dalam 30 detik.')}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Alerts */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 p-4 rounded-2xl flex items-start gap-3"
                style={{ background: 'rgba(255,235,235,0.9)', border: '1px solid rgba(244,63,94,0.2)' }}
              >
                <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-rose-600">{errorMsg}</p>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 p-4 rounded-2xl"
                style={{ background: 'rgba(209,250,229,0.9)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <p className="text-sm font-bold text-emerald-700">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <>
              {/* Social Login */}
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mb-6 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-700 transition-all"
                style={{
                  height: '56px',
                  background: 'white',
                  border: '1.5px solid rgba(226,232,240,0.8)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Lanjutkan dengan Google
              </motion.button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">atau dengan email</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Form 1 */}
              <form onSubmit={isLogin ? handleLoginRequestOtp : handleRegister} className="flex flex-col gap-4">
                
                {!isLogin && (
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-slate-700">Nama Panggilan</span>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-13 pl-11 pr-4 rounded-xl text-slate-800 placeholder-slate-400 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-violet-400"
                        style={{ background: 'rgba(248,247,255,0.9)', border: '1.5px solid rgba(226,232,240,0.8)', height: '52px' }}
                        placeholder="Nama kamu"
                      />
                    </div>
                  </label>
                )}

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-slate-700">Email</span>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-13 pl-11 pr-4 rounded-xl text-slate-800 placeholder-slate-400 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-violet-400"
                      style={{ background: 'rgba(248,247,255,0.9)', border: '1.5px solid rgba(226,232,240,0.8)', height: '52px' }}
                      placeholder="nama@email.com"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-slate-700">Kata Sandi</span>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 rounded-xl text-slate-800 placeholder-slate-400 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-violet-400"
                      style={{ background: 'rgba(248,247,255,0.9)', border: '1.5px solid rgba(226,232,240,0.8)', height: '52px' }}
                      placeholder="Minimal 6 karakter"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                {isLogin && (
                  <div className="text-right -mt-1">
                    <Link href="/lupa-password" className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                      Lupa kata sandi?
                    </Link>
                  </div>
                )}

                {/* Cloudflare Turnstile */}
                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                   <div className="mt-2 w-full flex justify-center">
                     <Turnstile 
                       siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                       onSuccess={(token) => setTurnstileToken(token)}
                       onError={() => setErrorMsg('Gagal memuat sistem keamanan')}
                       onExpire={() => setTurnstileToken('')}
                     />
                   </div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading || (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken)}
                  whileHover={(!loading && turnstileToken) ? { scale: 1.02, y: -1 } : {}}
                  whileTap={(!loading && turnstileToken) ? { scale: 0.98 } : {}}
                  className="mt-2 w-full rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    height: '56px',
                    background: loading ? '#A855F7' : 'linear-gradient(135deg, #7C3AED, #A855F7, #EC4899)',
                    boxShadow: loading ? 'none' : '0 6px 24px rgba(124,58,237,0.35)',
                    backgroundSize: '200% 100%',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      {isLogin ? 'Masuk' : 'Buat Akun'}
                    </>
                  )}
                </motion.button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">atau</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-slate-600 transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(248,247,255,0.9)', border: '1.5px solid rgba(226,232,240,0.8)' }}
              >
                🎭 Lanjut Tanpa Akun (Anonim)
              </Link>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
               <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-slate-700">Kode OTP</span>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center tracking-[0.5em] h-13 pl-11 pr-4 rounded-xl text-slate-800 placeholder-slate-400 font-bold text-2xl transition-all focus:outline-none focus:ring-2 focus:ring-violet-400"
                      style={{ background: 'rgba(248,247,255,0.9)', border: '1.5px solid rgba(226,232,240,0.8)', height: '64px' }}
                      placeholder="------"
                    />
                  </div>
                </label>
                
                <motion.button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="mt-4 w-full rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    height: '56px',
                    background: loading ? '#A855F7' : 'linear-gradient(135deg, #7C3AED, #A855F7, #EC4899)',
                    boxShadow: loading ? 'none' : '0 6px 24px rgba(124,58,237,0.35)',
                  }}
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /><span>Memverifikasi...</span></>
                  ) : (
                    <><Lock size={16} />Verifikasi & Masuk</>
                  )}
                </motion.button>

                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="mt-4 text-sm font-semibold text-slate-400 hover:text-violet-600 transition-colors"
                >
                  Batal / Kembali ke Halaman Login
                </button>
            </form>
          )}

          <p className="mt-5 text-center text-xs text-slate-400 font-medium leading-relaxed">
            Dengan mendaftar, kamu menyetujui{' '}
            <Link href="/syarat-ketentuan" className="text-violet-600 hover:underline font-semibold">Syarat & Ketentuan</Link>
            {' '}dan{' '}
            <Link href="/kebijakan-privasi" className="text-violet-600 hover:underline font-semibold">Kebijakan Privasi</Link> kami.
          </p>
        </div>
      </div>
    </div>
  );
}
