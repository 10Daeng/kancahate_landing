'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';

export default function Header({ actionButtonHandler }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0">
          <Image
            src="/logo.png"
            alt="Kancah Ate Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <span className="text-lg font-bold text-slate-800 hidden sm:block">Kancah Ate</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link href="/" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all">Beranda</Link>
          <Link href="/psikotes" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all">Tes Seru</Link>
          <Link href="/ruang-baca" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all">Ruang Baca</Link>
          <Link href="/laporan-kejadian" className="px-3 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1.5">
            <Shield size={14} />
            Lapor
          </Link>
          <Link href="/#crisis" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all">Bantuan</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <Link href={user.email?.includes('lenterabatin') ? "/kancah-private-auth" : "/dashboard"} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-all">
              <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 text-xs font-bold">
                {user.email[0].toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate">{user.email.split('@')[0]}</span>
            </Link>
          ) : (
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              Masuk
            </Link>
          )}

          {actionButtonHandler ? (
            <button
              onClick={actionButtonHandler}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5"
            >
              Mulai Curhat
            </button>
          ) : (
            <Link
              href="/"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5"
            >
              Mulai Curhat
            </Link>
          )}
        </div>

        {/* Mobile: hamburger only */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 -mr-2 text-slate-600 hover:text-violet-600 transition-colors">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 animate-fade-in">
          <div className="max-w-6xl mx-auto px-4 py-5 space-y-1">
            {/* Lapor Banner - prominent */}
            <Link
              href="/laporan-kejadian"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-xl text-rose-700 font-bold mb-4"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center text-white shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <span className="block text-sm">Lapor Kekerasan / Bullying</span>
                <span className="block text-xs font-normal text-rose-500">Melapor itu berani</span>
              </div>
            </Link>

            {user ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl text-violet-700 font-bold mb-2">
                <div className="w-8 h-8 bg-violet-200 rounded-full flex items-center justify-center text-violet-600 text-sm font-bold">
                  {user.email[0].toUpperCase()}
                </div>
                <div>
                  <span className="block text-sm">Halo, {user.email.split('@')[0]}</span>
                  <span className="text-xs font-normal opacity-70">Profil & Hasil Tes</span>
                </div>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2.5 mb-2 text-sm font-semibold text-violet-600 hover:text-violet-700">
                Masuk / Daftar
              </Link>
            )}

            <div className="space-y-0.5 pt-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Beranda</Link>
              <Link href="/psikotes" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Tes Seru</Link>
              <Link href="/ruang-baca" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Ruang Baca</Link>
              <Link href="/#crisis" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg">Bantuan Darurat</Link>
            </div>

            {/* Mobile CTA */}
            {actionButtonHandler ? (
              <button
                onClick={() => { setMobileMenuOpen(false); actionButtonHandler(); }}
                className="w-full mt-4 py-3 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-md shadow-violet-200"
              >
                Mulai Curhat
              </button>
            ) : (
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center mt-4 py-3 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-md shadow-violet-200"
              >
                Mulai Curhat
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}