'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Memverifikasi email Anda...');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Link verifikasi tidak valid atau kedaluwarsa.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        });
        
        const data = await res.json();
        
        if (data.success) {
          setStatus('success');
          setMessage('Email berhasil diverifikasi! Anda sekarang dapat masuk (login) ke akun Anda.');
          // Arahkan ke login setelah 3 detik
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Gagal memverifikasi email. Silakan coba lagi.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Terjadi kesalahan pada server.');
      }
    };

    verify();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-violet-500" />
            <h2 className="text-xl font-bold text-slate-800">Sedang Memverifikasi</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="mb-4 h-16 w-16 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-800">Verifikasi Berhasil!</h2>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="mb-4 h-16 w-16 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-800">Verifikasi Gagal</h2>
          </div>
        )}

        <p className="mt-4 text-slate-600">{message}</p>

        {status !== 'loading' && (
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            Menuju Halaman Login
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-violet-500" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
