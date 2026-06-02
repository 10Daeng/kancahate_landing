'use client';

import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowRight, UserPlus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * GateOverlay — ditampilkan di atas hasil tes lengkap untuk user anonim.
 * Mendorong user untuk sign up agar bisa lihat hasil penuh.
 *
 * Props:
 *  - testName: string (misal "MBTI", "RIASEC")
 *  - preview: { title: string, subtitle: string } — info hasil parsial yang boleh ditampilkan
 */
export default function GateOverlay({ testName, preview }) {
  const router = useRouter();

  const handleSignUp = useCallback(() => {
    // Simpan state bahwa user sedang dalam proses lihat hasil tes
    sessionStorage.setItem('kancahate_gate_test', testName);
    router.push('/login?action=register');
  }, [router, testName]);

  const handleLogin = useCallback(() => {
    sessionStorage.setItem('kancahate_gate_test', testName);
    router.push('/login');
  }, [router, testName]);

  return (
    <div className="relative w-full">
      {/* Konten blur di belakang */}
      <div
        className="pointer-events-none select-none"
        style={{
          filter: 'blur(6px)',
          opacity: 0.35,
          userSelect: 'none',
        }}
      >
        {/* Placeholder konten tersembunyi */}
        <div className="space-y-4 p-6">
          {[80, 65, 90, 55, 75].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded-full bg-violet-200" style={{ width: `${w}%` }} />
                <div className="h-2 rounded-full bg-slate-200" style={{ width: `${w - 20}%` }} />
              </div>
            </div>
          ))}
          <div className="h-32 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 mt-4" />
          <div className="h-20 rounded-2xl bg-slate-100 mt-2" />
        </div>
      </div>

      {/* Overlay utama */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center"
        style={{ backdropFilter: 'blur(2px)' }}
      >
        <div
          className="mx-4 w-full max-w-sm rounded-3xl p-7 text-center shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,247,255,0.98) 100%)',
            border: '1.5px solid rgba(139,92,246,0.15)',
            boxShadow: '0 24px 64px rgba(124,58,237,0.18), 0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          {/* Icon */}
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
          >
            <Lock size={28} className="text-white" />
          </div>

          {/* Preview hasil parsial */}
          {preview && (
            <div
              className="mb-4 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 mb-1">
                Tipe {testName} kamu
              </p>
              <p className="text-lg font-black text-slate-800">{preview.title}</p>
              {preview.subtitle && (
                <p className="text-sm text-slate-500 mt-0.5">{preview.subtitle}</p>
              )}
            </div>
          )}

          <h3 className="text-xl font-black text-slate-900 mb-2">
            Lihat Hasil Lengkap!
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Daftar gratis untuk melihat <strong>analisis mendalam</strong>, saran karier/personal, dan simpan hasil tesmu selamanya.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <motion.button
              onClick={handleSignUp}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white text-sm"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #A855F7, #EC4899)',
                boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
              }}
            >
              <UserPlus size={16} />
              Daftar Gratis — Lihat Hasil Penuh
              <Sparkles size={14} />
            </motion.button>

            <button
              onClick={handleLogin}
              className="w-full rounded-2xl py-3 text-sm font-semibold text-violet-600 transition-colors hover:text-violet-800"
              style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}
            >
              Sudah punya akun? Masuk
              <ArrowRight size={14} className="inline ml-1" />
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            ✨ Gratis selamanya • Tidak perlu kartu kredit
          </p>
        </div>
      </motion.div>
    </div>
  );
}
