'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield, Sparkles, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Header({ actionButtonHandler }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user || null;
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/psikotes', label: 'Tes Seru ✨' },
    { href: '/ruang-baca', label: 'Ruang Baca' },
    { href: '/laporan-kejadian', label: 'Lapor', isRed: true, icon: Shield },
    { href: '/#crisis', label: 'Bantuan' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-white/40 shadow-lg shadow-violet-500/5'
          : 'bg-white/80 backdrop-blur-md border-b border-slate-100/50'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-all group shrink-0">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="Logo Kancah Ate - Platform Kesehatan Mental Remaja Indonesia"
              width={38}
              height={38}
              className="object-contain group-hover:scale-105 transition-transform"
              priority
            />
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">
            Kancah <span className="gradient-text">Ate</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const IconComp = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                  link.isRed
                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                    : isActive
                    ? 'text-violet-700 bg-violet-50'
                    : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50/80'
                }`}
              >
                {IconComp && <IconComp size={13} />}
                {link.label}
                {isActive && !link.isRed && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-violet-100 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href={user.email?.includes('lenterabatin') ? '/kancah-private-auth' : '/dashboard'}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-all"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                  {user.email[0].toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.email.split('@')[0]}</span>
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Keluar"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-xl transition-all"
            >
              Masuk
            </Link>
          )}

          {actionButtonHandler ? (
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={actionButtonHandler}
              className="btn-primary px-5 py-2.5 text-sm flex items-center gap-1.5"
            >
              <Sparkles size={14} className="opacity-90" />
              Mulai Curhat
            </motion.button>
          ) : (
            <Link href="/" className="btn-primary px-5 py-2.5 text-sm inline-flex items-center gap-1.5">
              <Sparkles size={14} className="opacity-90" />
              Mulai Curhat
            </Link>
          )}
        </div>

        {/* Mobile: hamburger */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 -mr-2 text-slate-600 hover:text-violet-600 transition-colors rounded-xl hover:bg-violet-50"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="glass border-t border-white/40 px-4 py-5 space-y-2">
              {/* Links yang tidak ada di BottomNav */}

              {/* Nav Links */}
              <div className="space-y-1 pt-1">
                {[
                  { href: '/psikotes', label: 'Tes Seru ✨' },
                  { href: '/#crisis', label: 'Bantuan Darurat 🆘', red: true },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                      link.red
                        ? 'text-red-500 hover:bg-red-50'
                        : 'text-slate-700 hover:bg-violet-50 hover:text-violet-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* User Mobile Actions */}
              {user && (
                <div className="pt-2 border-t border-slate-100/50 mt-2">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left py-3 px-4 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-xl flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Keluar Akun
                  </button>
                </div>
              )}

              {/* Mobile CTA */}

              {actionButtonHandler ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); actionButtonHandler(); }}
                  className="btn-primary w-full mt-2 py-3.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Mulai Curhat Sekarang
                </button>
              ) : (
                <Link href="/" onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary block w-full text-center mt-2 py-3.5 text-sm font-bold">
                  Mulai Curhat Sekarang
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}