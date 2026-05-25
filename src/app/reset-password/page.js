'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [validSession, setValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if user came from valid reset link with tokens
  useEffect(() => {
    const checkSession = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      if (!accessToken) {
        setValidSession(false);
        setCheckingSession(false);
        return;
      }

      // Set the session using the tokens from URL
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (error) {
        console.error('Error setting session:', error);
        setValidSession(false);
      } else if (data.session) {
        setValidSession(true);
      } else {
        setValidSession(false);
      }

      setCheckingSession(false);
    };

    checkSession();
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg('Password dan konfirmasi password tidak sama.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      alert("Fitur reset password sedang dalam perbaikan (migrasi database). Silakan hubungi admin.");
      setLoading(false);
      return;

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-white text-slate-800 font-sans px-4">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-white text-slate-800 font-sans px-4">

      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image
            src="/logo.png"
            alt="Kancah Ate Logo"
            width={48}
            height={48}
            className="object-contain"
          />
          <h1 className="text-2xl font-bold text-slate-800">Kancah Ate</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">

          <div className="mb-8 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              validSession ? 'bg-violet-100' : 'bg-red-100'
            }`}>
              <Lock className={validSession ? 'text-violet-600' : 'text-red-600'} size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              {validSession ? 'Buat Password Baru' : 'Link Tidak Valid'}
            </h2>
            <p className="text-slate-500 text-sm">
              {validSession
                ? 'Masukkan password baru Anda untuk akun Kancah Ate.'
                : 'Link reset password sudah kadaluarsa atau tidak valid.'}
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 flex items-start gap-3 border border-red-100 animate-fade-in">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 flex items-start gap-3 border border-green-100 animate-fade-in">
              <CheckCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{successMsg}</p>
            </div>
          )}

          {validSession ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-slate-700">Password Baru</span>
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
                    disabled={loading || !!successMsg}
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

              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-slate-700">Konfirmasi Password</span>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400 pointer-events-none">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-xl border-none bg-slate-50 text-slate-800 placeholder-slate-400 font-medium focus:ring-2 focus:ring-violet-500 transition-all"
                    placeholder="Ketik ulang password"
                    minLength={6}
                    disabled={loading || !!successMsg}
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading || !!successMsg}
                className="w-full h-14 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg shadow-lg shadow-violet-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Menyimpan...
                  </>
                ) : (
                  'Ubah Password'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4">
              <p className="text-slate-600 text-sm">
                Silakan minta link reset password baru.
              </p>
              <Link href="/lupa-password" className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors">
                Minta Link Reset Baru
              </Link>
            </div>
          )}

        </div>

        {/* Bottom Link */}
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
            ← Kembali ke Login
          </Link>
        </div>

      </div>
    </div>
  );
}

// Loading fallback for Suspense
function ResetPasswordFallback() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-white text-slate-800 font-sans px-4">
      <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
    </div>
  );
}

// Export with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
