'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BookOpen, Shield, User, BrainCircuit } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Tes Seru', href: '/psikotes', icon: BrainCircuit },
    { name: 'Ruang Baca', href: '/ruang-baca', icon: BookOpen },
    { name: 'Lapor', href: '/laporan-kejadian', icon: Shield },
    { name: 'Profil', href: '/dashboard', icon: User },
  ];

  if (!mounted) return null;

  // Don't show BottomNav on chat view or specific hidden pages
  if (pathname.startsWith('/chat') || pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/lengkapi-profil')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2">
      <div 
        className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl mb-4 px-2 py-2 flex items-center justify-around"
        style={{
          boxShadow: '0 -4px 24px rgba(124, 58, 237, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-12 px-1"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-violet-100/80 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`flex flex-col items-center gap-1 ${isActive ? 'text-violet-600' : 'text-slate-500'}`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-sm' : ''} />
                <span className={`text-[9.5px] whitespace-nowrap font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                  {item.name}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
