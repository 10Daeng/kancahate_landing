import Link from 'next/link';
import Image from 'next/image';
import { Phone, Heart, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 60% at 10% 100%, rgba(124, 58, 237, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 90% 80%, rgba(236, 72, 153, 0.12) 0%, transparent 60%),
            #0f0a1e
          `
        }}
      />
      {/* Top gradient divider */}
      <div className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4), transparent)' }}
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-14 pb-8">
        {/* Main Footer Grid */}
        <div className="grid md:grid-cols-12 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/logo.png"
                alt="Kancah Ate Logo"
                width={44}
                height={44}
                className="object-contain"
              />
              <span className="text-xl font-extrabold text-white tracking-tight">
                Kancah <span style={{ background: 'linear-gradient(135deg, #A855F7, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Ate</span>
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6">
              Ruang aman bagi remaja Indonesia untuk berbagi cerita, kenali diri, dan bertumbuh bersama 💜
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider opacity-80">Menu</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-white/50 hover:text-violet-400 transition-colors font-medium">Beranda</Link></li>
              <li><Link href="/psikotes" className="text-white/50 hover:text-violet-400 transition-colors font-medium">Psikotes ✨</Link></li>
              <li><Link href="/ruang-baca" className="text-white/50 hover:text-violet-400 transition-colors font-medium">Ruang Baca</Link></li>
              <li><Link href="/laporan-kejadian" className="text-white/50 hover:text-rose-400 transition-colors font-medium">Lapor Kejadian</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider opacity-80">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/kebijakan-privasi" className="text-white/50 hover:text-violet-400 transition-colors font-medium">Kebijakan Privasi</Link></li>
              <li><Link href="/syarat-ketentuan" className="text-white/50 hover:text-violet-400 transition-colors font-medium">Syarat Layanan</Link></li>
              <li><Link href="/#crisis" className="text-white/50 hover:text-violet-400 transition-colors font-medium">Bantuan Krisis 🆘</Link></li>
            </ul>
          </div>
        </div>

        {/* Crisis Banner */}
        <div
          id="crisis"
          className="rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 mb-10"
          style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(239, 68, 68, 0.1))',
            border: '1px solid rgba(244, 63, 94, 0.25)'
          }}
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(244, 63, 94, 0.15)' }}>
              <Phone size={20} className="text-rose-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Dalam Krisis? 🆘</h4>
              <p className="text-white/50 text-sm max-w-md mt-0.5">
                Jika kamu atau seseorang yang kamu kenal dalam bahaya, hubungi segera.
              </p>
            </div>
          </div>
          <a
            href="tel:119"
            className="whitespace-nowrap font-bold py-3 px-6 rounded-xl text-sm text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #F43F5E, #EF4444)', boxShadow: '0 4px 16px rgba(244, 63, 94, 0.35)' }}
          >
            Hubungi 119 ext 8
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-white/30 flex items-center gap-1.5">
            Dibuat dengan <Heart size={11} className="text-rose-400 fill-rose-400" /> untuk remaja Indonesia • © 2026 Kancah Ate
          </p>
          <div className="flex gap-5">
            <Link href="/kebijakan-privasi" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/syarat-ketentuan" className="text-xs text-white/30 hover:text-white/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
