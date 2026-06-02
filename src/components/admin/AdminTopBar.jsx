'use client';

import { signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

export default function AdminTopBar() {
  return (
    <div className="hidden lg:flex items-center justify-end h-16 px-8 border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
            <User size={16} />
          </div>
          <span>Admin</span>
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </div>
  );
}
