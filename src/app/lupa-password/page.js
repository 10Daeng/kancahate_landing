'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { Mail, AlertTriangle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccessMsg('Link reset password telah dikirim ke email Anda. Silakan cek inbox (atau folder spam).');
      setEmail(''); // Clear form
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="text-violet-600" size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              Lupa Kata Sandi?
            </h2>
            <p className="text-slate-500 text-sm">
              Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
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

          <form onSubmit={handleResetPassword} className="space-y-5">
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
                  Mengirim...
                </>
              ) : (
                'Kirim Link Reset'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors">
              <ArrowLeft size={16} />
              Kembali ke Login
            </Link>
          </div>

        </div>

        {/* Bottom Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>

      </div>
    </div>
  );
}
