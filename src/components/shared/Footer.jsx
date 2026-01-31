import Link from 'next/link';
import Image from 'next/image';
import { Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-700 text-white pt-16 pb-8 px-4 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-6">
              <Image 
                src="/logo.png" 
                alt="Kancah Ate Logo" 
                width={48}
                height={48}
                className="object-contain" 
              />
              <h3 className="text-xl font-bold">Kancah Ate</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Ruang digital yang aman bagi remaja untuk berbagi, belajar, dan bertumbuh. Kami menyediakan P3K kesehatan mental dan dukungan sebaya.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="font-bold mb-4">Menu</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link href="/" className="hover:text-violet-400 transition-colors">Beranda</Link></li>
              <li><Link href="/psikotes" className="hover:text-violet-400 transition-colors">Psikotes Gratis</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link href="/kebijakan-privasi" className="hover:text-violet-400 transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="/syarat-ketentuan" className="hover:text-violet-400 transition-colors">Syarat Layanan</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-bold mb-4">Ruang Baca</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link href="/ruang-baca" className="hover:text-violet-400 transition-colors">Artikel</Link></li>
              <li><Link href="/#crisis" className="hover:text-violet-400 transition-colors">Bantuan Krisis</Link></li>
            </ul>
          </div>
        </div>

        {/* Crisis Banner */}
        <div id="crisis" className="border border-white/10 bg-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-full text-red-500">
              <Phone size={20} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Dalam Krisis?</h4>
              <p className="text-white/60 text-sm max-w-md">Jika kamu atau seseorang yang kamu kenal dalam bahaya langsung, segera hubungi layanan darurat.</p>
            </div>
          </div>
          <a href="tel:119" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap">
            Hubungi 119 ext 8
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© 2026 Kancah Ate. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/kebijakan-privasi" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/syarat-ketentuan" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
