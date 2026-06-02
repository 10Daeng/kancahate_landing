'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FileText, Users, Database, 
  AlertTriangle, ArrowLeft, Menu, X, BookOpen, Search, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';

const ADMIN_MENUS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Publikasi & Artikel', href: '/admin/articles', icon: FileText },
  { name: 'Kelola Pengguna', href: '/admin/users', icon: Users },
  { name: 'Data Riset', href: '/admin/research', icon: Search },
  { name: 'Master Database', href: '/admin/database', icon: Database },
  { name: 'Laporan Insiden', href: '/admin/incident-reports', icon: AlertTriangle },
];

const SidebarContent = ({ pathname, setIsOpen }) => (
  <div className="flex flex-col h-full bg-slate-900 text-white">
    {/* Brand Header */}
    <div className="h-16 flex items-center px-6 border-b border-slate-800">
      <div className="flex items-center gap-3 text-xl font-bold text-violet-400">
        <BookOpen size={24} />
        <span>Kancah Admin</span>
      </div>
    </div>

    {/* Navigation Links */}
    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
      {ADMIN_MENUS.map((menu) => {
        const isActive = pathname?.startsWith(menu.href);
        const Icon = menu.icon;
        
        return (
          <Link
            key={menu.href}
            href={menu.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              isActive 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500'} />
            {menu.name}
          </Link>
        );
      })}
    </div>

    {/* Bottom Actions */}
    <div className="p-4 border-t border-slate-800 space-y-2">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-medium"
      >
        <ArrowLeft size={20} />
        Kembali ke Web
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all font-medium"
      >
        <LogOut size={20} />
        Keluar (Log Out)
      </button>
    </div>
  </div>
);

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-md"
      >
        <Menu size={24} />
      </button>

      {/* Desktop Sidebar (Always visible on large screens) */}
      <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 z-40 bg-slate-900">
        <SidebarContent pathname={pathname} setIsOpen={setIsOpen} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 h-screen w-72 bg-slate-900 z-50 shadow-2xl"
            >
              <button 
                onClick={toggleSidebar}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
              <SidebarContent pathname={pathname} setIsOpen={setIsOpen} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
