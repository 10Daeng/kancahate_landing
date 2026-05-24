'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';

export default function Header({ actionButtonHandler }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Simple auth check on mount
  useEffect(() => {
    const checkUser = async () => {
      // Dynamic import to avoid SSR issues with supabase client potentially
      const { supabase } = await import('@/lib/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 lg:px-10 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image 
            src="/logo.png" 
            alt="Kancah Ate Logo" 
            width={48}
            height={48}
            className="object-contain" 
            priority
          />
          <h1 className="text-xl font-bold text-slate-800">Kancah Ate</h1>
        </Link>
        
{/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-violet-500 transition-colors">Beranda</Link>
          <Link href="/psikotes" className="text-sm font-medium hover:text-violet-500 transition-colors">Tes Seru</Link>
          <Link href="/ruang-baca" className="text-sm font-medium hover:text-violet-500 transition-colors">Ruang Baca</Link>
          <Link href="/#crisis" className="text-sm font-medium hover:text-violet-500 transition-colors">Bantuan</Link>
        </nav>

        {/* CTA & Auth & Mobile Menu */}
        <div className="flex items-center gap-3">
          <Link href="/laporan-kejadian" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-full font-bold text-xs transition-all hover:shadow-sm hover:shadow-rose-100">
            <Shield size={14} />
            Lapor!
          </Link>
          {user ? (
             <Link href={user.email?.includes('lenterabatin') ? "/kancah-private-auth" : "/dashboard"} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors">
                <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center text-white text-[10px]">
                   {user.email[0].toUpperCase()}
                </div>
                <span>{user.email.split('@')[0]}</span>
             </Link>
          ) : (
             <Link href="/login" className="hidden sm:block px-4 py-2 text-sm font-bold text-violet-600 hover:text-violet-700 border border-violet-200 hover:border-violet-300 rounded-lg transition-colors">
               Masuk
             </Link>
          )}

          {actionButtonHandler ? (
            <button 
              onClick={actionButtonHandler}
              className="px-4 py-2 text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 rounded-lg transition-colors shadow-lg shadow-violet-200"
            >
              Mulai Curhat
            </button>
          ) : (
             <Link 
               href="/"
               className="px-4 py-2 text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 rounded-lg transition-colors shadow-lg shadow-violet-200"
             >
               Mulai Curhat
             </Link>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden ml-1 p-2 text-slate-500">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-6 space-y-4 animate-fade-in">
          {user ? (
             <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl text-violet-700 font-bold">
                 <div className="w-8 h-8 bg-violet-200 rounded-full flex items-center justify-center">
                    {user.email[0].toUpperCase()}
                 </div>
                 <div>
                    <span className="block text-sm">Halo, {user.email.split('@')[0]}</span>
                    <span className="text-xs font-normal opacity-70">Lihat Profil & Hasil Tes</span>
                 </div>
             </Link>
          ) : (
             <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
               Masuk / Daftar
             </Link>
          )}

<div className="space-y-1">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-2 font-medium hover:bg-slate-50 rounded-lg">Beranda</Link>
              <Link href="/psikotes" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-2 font-medium hover:bg-slate-50 rounded-lg">Tes Seru</Link>
              <Link href="/ruang-baca" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-2 font-medium hover:bg-slate-50 rounded-lg">Ruang Baca</Link>
              <Link href="/laporan-kejadian" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-2 font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2">
                <Shield size={16} /> Lapor Kekerasan / Bullying
              </Link>
              <Link href="/#crisis" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-2 font-medium hover:bg-slate-50 rounded-lg text-red-500">Bantuan Darurat</Link>
           </div>
        </div>
      )}
    </header>
  );
}
