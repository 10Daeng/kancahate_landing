// --- DISCLAIMER MODAL ---
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, AlertCircle, Info, CheckCircle } from 'lucide-react';

/**
 * DisclaimerModal - Modal untuk menampilkan disclaimer penting
 * Menampilkan transparansi tentang kemampuan dan batasan aplikasi
 */
function DisclaimerModal({ isOpen, onClose, onAccept }) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    setAccepted(true);
    localStorage.setItem('kancahate_disclaimer_accepted', Date.now().toString());
    onAccept?.();
    onClose();
  };

  const handleDontShowAgain = () => {
    handleAccept();
    localStorage.setItem('kancahate_disclaimer_hide', 'true');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Info size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Penting: Baca Ini</h2>
                  <p className="text-white/80 text-sm">Transparansi untuk Keselamatan Anda</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* What We Can Do */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={20} className="text-green-600" />
                <h3 className="font-bold text-green-800">Yang Bisa Kami Lakukan</h3>
              </div>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Menjadi teman curhat yang empatik dan mendengarkan tanpa menghakimi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Memberikan tips coping skills sederhana untuk mengelola stres dan kecemasan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Menyediakan psikotes self-assessment (GAD-7, PSS-10, MBTI, Big Five)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Membantu Anda mengeksplorasi perasaan dan pikiran Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Menyediakan teknik grounding dan relaksasi</span>
                </li>
              </ul>
            </div>

            {/* What We Cannot Do */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={20} className="text-red-600" />
                <h3 className="font-bold text-red-800">Yang TIDAK Bisa Kami Lakukan</h3>
              </div>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span><strong>MENGHANTARKAN DIAGNOSIS</strong> - Kami bukan dokter atau psikiater</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span><strong>MENGERJAKAN TERAPI</strong> - Ini bukan pengganti terapi profesional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span><strong>MERESPONS DARURAT</strong> - Untuk krisis segera, hubungi profesional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span><strong>MENGGANTI OBAT</strong> - Jangan stop/ubah obat tanpa konsultasi dokter</span>
                </li>
              </ul>
            </div>

            {/* Data Privacy */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={20} className="text-blue-600" />
                <h3 className="font-bold text-blue-800">Privasi & Keamanan Data Anda</h3>
              </div>
              <div className="text-sm text-blue-700 space-y-2">
                <p>Data Anda <strong>DIENKRIPSI</strong> dengan AES-GCM 256-bit (standar militer)</p>
                <p>Identitas Anda <strong>DIANONIMISASI</strong> sebelum dikirim ke AI eksternal</p>
                <p>Semua percakapan <strong>DISIMPAN SECARA AMAN</strong> dan tidak dijual kepada pihak ketiga</p>
                <p className="text-xs mt-2">Kami mematuhi standar keamanan data terbaik meskipun Indonesia belum memiliki setara GDPR</p>
              </div>
            </div>

            {/* Crisis Resources */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="font-bold text-amber-800 mb-3">Butuh Bantuan Segera?</h3>
              <div className="text-sm text-amber-700 space-y-1">
                <p><strong>Sejiwa (Layar Anonim):</strong> 119 ext 8</p>
                <p><strong>Into the Light Indonesia:</strong> +62 812-3456-7890</p>
                <p><strong>Pulih:</strong> (021) 7599 8800</p>
                <p className="text-xs mt-2">Layanan ini tersedia 24/7 dan GRATIS</p>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="text-xs text-slate-500 text-center leading-relaxed border-t pt-4">
              <p className="mb-2">
                <strong>DISCLAIMER:</strong> Aplikasi ini hanya untuk tujuan edukasi dan dukungan emosional.
                Hasil psikotes dan respons AI bukan diagnosis medis atau psikiatris.
              </p>
              <p>
                Dengan melanjutkan penggunaan aplikasi ini, Anda menyatakan bahwa Anda telah membaca,
                memahami, dan menyetujui batasan yang telah dijelaskan di atas.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleDontShowAgain}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all shadow-lg"
              >
                Saya Mengerti & Setuju (Jangan Tampilkan Lagi)
              </button>
              <button
                onClick={handleAccept}
                className="w-full py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Tutup (Saya Akan Baca Lagi Nanti)
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default DisclaimerModal;
