// --- CRISIS MODAL COMPONENT ---
// Modal darurat untuk menampilkan sumber daya bantuan kesehatan mental

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Phone, HeartHandshake, Heart } from 'lucide-react';

/**
 * CrisisModal - Modal yang muncul ketika terdeteksi risiko tinggi/kritis
 * @param {boolean} isOpen - Apakah modal ditampilkan
 * @param {function} onClose - Callback ketika modal ditutup
 * @param {string} riskLevel - Level risiko ('Kritis', 'Tinggi', 'Sedang', 'Rendah')
 * @param {string} userName - Nama pengguna untuk personalisasi
 */
function CrisisModal({ isOpen, onClose, riskLevel, userName }) {
  const [ackChecked, setAckChecked] = useState(false);
  
  if (!isOpen) return null;

  const isCritical = riskLevel === 'Kritis';
  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border-4 ${
          isCritical ? 'border-red-500' : 'border-orange-400'
        }`}
      >
        <div className="text-center mb-6">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            isCritical ? 'bg-red-100' : 'bg-orange-100'
          }`}>
            <AlertTriangle size={40} className={isCritical ? 'text-red-600' : 'text-orange-600'} />
          </div>
          
          <h3 className={`text-2xl font-bold mb-2 ${
            isCritical ? 'text-red-700' : 'text-orange-700'
          }`}>
            {isCritical ? 'Kami Sangat Peduli Padamu' : 'Kai Ingin Memastikan Kamu Baik-baik Saja'}
          </h3>
          
          <p className="text-slate-600 text-sm leading-relaxed">
            {userName ? `${userName}, ` : ''}Kai mendeteksi bahwa kamu mungkin sedang mengalami 
            masa yang sangat berat. <strong>Kamu tidak sendirian.</strong> 
            Ada orang-orang yang siap membantu 24 jam.
          </p>
        </div>
        
        {/* Hotline Darurat Indonesia */}
        <div className="space-y-3 mb-6">
          <a 
            href="tel:119" 
            className="flex items-center gap-4 p-4 bg-red-50 hover:bg-red-100 rounded-2xl transition-all border border-red-200"
          >
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Phone size={24} className="text-white" />
            </div>
            <div className="text-left">
              <span className="font-bold text-red-700 block">119 ext 8</span>
              <span className="text-xs text-red-600">Hotline Kemenkes RI (24 Jam)</span>
            </div>
          </a>
          
          <a 
            href="https://www.intothelightid.org/" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all border border-blue-200"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <HeartHandshake size={24} className="text-white" />
            </div>
            <div className="text-left">
              <span className="font-bold text-blue-700 block">Into The Light Indonesia</span>
              <span className="text-xs text-blue-600">Komunitas Pencegahan Bunuh Diri</span>
            </div>
          </a>
          
          <a 
            href="https://www.yfrp.org/" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all border border-purple-200"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Heart size={24} className="text-white" />
            </div>
            <div className="text-left">
              <span className="font-bold text-purple-700 block">Yayasan Pulih</span>
              <span className="text-xs text-purple-600">(021) 788-42580 | Konseling Trauma</span>
            </div>
          </a>
        </div>

        <div className="text-center">
          {isCritical ? (
            <>
              {/* SECURITY: Prevent closing without acknowledgment for critical risk */}
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200 mb-4">
                <p className="text-xs text-red-600 font-bold mb-3">
                  ⚠️ Mohon baca sumber daya di atas sebelum melanjutkan
                </p>
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ackChecked}
                    onChange={(e) => setAckChecked(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-700">
                    Saya sudah membaca dan memahami sumber bantuan yang tersedia
                  </span>
                </label>
              </div>
              <button
                onClick={onClose}
                disabled={!ackChecked}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  ackChecked
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Saya Mengerti, Lanjutkan
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl font-bold transition-all bg-orange-500 hover:bg-orange-600 text-white"
            >
              Terima Kasih, Saya Mengerti
            </button>
          )}
          <p className="text-xs text-slate-400 mt-3">
            Kai akan tetap menemanimu di sini. Kamu bisa lanjut bercerita.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default CrisisModal;
