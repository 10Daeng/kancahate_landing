// --- SHAREABLE RESULT COMPONENT ---
// Gen Z-friendly: Share assessment results to social media
// Visual: Estetik, portrait card (9:16 ratio), ready to screenshot for IG Story/WA Status

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Mail, Copy, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

/**
 * ShareableResult - Card hasil tes yang estetik untuk di-share
 * Bisa di-screenshot langsung untuk upload ke sosial media
 *
 * Props:
 * - testType: 'GAD7' | 'PSS10' | 'MBTI' | 'BigFive' | 'RIASEC' | 'PHQ9' | 'ROSENBERG' | 'VARK' | 'MI' | 'LoveLanguages'
 * - result: Object dengan data hasil tes
 * - userName: Nama user (opsional)
 * - completedAt: Timestamp waktu selesai tes (opsional, default: now)
 */
export default function ShareableResult({ testType, result, userName = 'Kamu', completedAt = null }) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef(null);

  // Gunakan waktu selesai tes atau waktu sekarang
  const completionTime = (completedAt && completedAt !== null) ? new Date(completedAt) : new Date();

  // Format tanggal WIB
  const formatDateWIB = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '-';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const currentDate = formatDateWIB(completionTime);

  // Konfigurasi visual untuk setiap tipe tes
  const getTestConfig = (testType) => {
    const configs = {
      GAD7: {
        gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #5eead4 100%)',
        emoji: '🧠',
        title: 'Tingkat Kecemasan',
        textColor: 'white',
      },
      PSS10: {
        gradient: 'linear-gradient(135deg, #c2410c 0%, #f97316 50%, #fdba74 100%)',
        emoji: '😰',
        title: 'Tingkat Stres',
        textColor: 'white',
      },
      MBTI: {
        gradient: 'linear-gradient(135deg, #6b21a8 0%, #a855f7 50%, #f472b6 100%)',
        emoji: '🎭',
        title: 'Tipe Kepribadian',
        textColor: 'white',
      },
      BigFive: {
        gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #93c5fd 100%)',
        emoji: '🌟',
        title: 'Kepribadian Big Five',
        textColor: 'white',
      },
      RIASEC: {
        gradient: 'linear-gradient(135deg, #be185d 0%, #ec4899 50%, #fbcfe8 100%)',
        emoji: '💼',
        title: 'Tes Minat Karir',
        textColor: 'white',
      },
      PHQ9: {
        gradient: 'linear-gradient(135deg, #be123c 0%, #f43f5e 50%, #fda4af 100%)',
        emoji: '💔',
        title: 'Tingkat Depresi',
        textColor: 'white',
      },
      ROSENBERG: {
        gradient: 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #fef08a 100%)',
        emoji: '⭐',
        title: 'Tingkat Harga Diri',
        textColor: '#422006', // dark brown for yellow bg
      },
      VARK: {
        gradient: 'linear-gradient(135deg, #5b21b6 0%, #8b5cf6 50%, #c4b5fd 100%)',
        emoji: '📚',
        title: 'Gaya Belajar',
        textColor: 'white',
      },
      MI: {
        gradient: 'linear-gradient(135deg, #3730a3 0%, #6366f1 50%, #a5b4fc 100%)',
        emoji: '🧠',
        title: 'Multiple Intelligence',
        textColor: 'white',
      },
      LoveLanguages: {
        gradient: 'linear-gradient(135deg, #be185d 0%, #f472b6 50%, #fce7f3 100%)',
        emoji: '❤️',
        title: 'Bahasa Cinta',
        textColor: 'white',
      }
    };
    return configs[testType] || configs.GAD7;
  };

  const getLabelInfo = (testType, result) => {
    switch (testType) {
      case 'GAD7':
        if (result.score <= 4) return { label: 'Kecemasan Minimal', desc: 'Kondisimu baik-baik saja dan terkendali. Pertahankan gaya hidup sehatmu!' };
        if (result.score <= 9) return { label: 'Kecemasan Ringan', desc: 'Tingkat kecemasan ringan. Wajar terjadi, luangkan waktu untuk relaksasi.' };
        if (result.score <= 14) return { label: 'Kecemasan Sedang', desc: 'Perlu perhatian khusus. Cobalah teknik grounding atau mindfulness.' };
        return { label: 'Kecemasan Berat', desc: 'Kecemasanmu cukup tinggi. Jangan ragu untuk mencari bantuan profesional.' };
      case 'PSS10':
        if (result.score <= 13) return { label: 'Stres Rendah', desc: 'Kamu mampu mengelola tekanan hidup dengan sangat baik!' };
        if (result.score <= 26) return { label: 'Stres Sedang', desc: 'Kamu sedang menghadapi beberapa tekanan. Jangan lupa istirahat.' };
        return { label: 'Stres Tinggi', desc: 'Beban stresmu cukup berat. Prioritaskan kesehatan mentalmu saat ini.' };
      case 'PHQ9':
        if (result.score <= 4) return { label: 'Depresi Minimal', desc: 'Kondisi mood kamu stabil dan sangat baik.' };
        if (result.score <= 9) return { label: 'Depresi Ringan', desc: 'Ada sedikit penurunan mood. Pastikan cukup tidur dan bersosialisasi.' };
        if (result.score <= 14) return { label: 'Depresi Sedang', desc: 'Gejala depresimu mulai mengganggu aktivitas. Cari teman curhat.' };
        if (result.score <= 19) return { label: 'Depresi Moderat', desc: 'Kondisimu butuh dukungan. Pertimbangkan untuk konseling.' };
        return { label: 'Depresi Berat', desc: 'Gejala depresi berat. Sangat disarankan untuk konsultasi dengan psikolog/psikiater.' };
      case 'ROSENBERG':
        if (result.score >= 35) return { label: 'Sangat Percaya Diri', desc: 'Kamu memiliki harga diri dan respek yang luar biasa pada dirimu sendiri!' };
        if (result.score >= 30) return { label: 'Percaya Diri', desc: 'Kamu tahu nilai dirimu dan memiliki pandangan positif terhadap dirimu.' };
        if (result.score >= 25) return { label: 'Harga Diri Sedang', desc: 'Kepercayaan dirimu cukup stabil, meski kadang ada keraguan kecil.' };
        return { label: 'Harga Diri Rendah', desc: 'Kamu butuh lebih mengapresiasi diri sendiri. Kamu lebih berharga dari yang kamu kira.' };
      default:
        return { label: result.label || result.type || result.title || 'Hasil Tes', desc: 'Hasil tes kepribadian kamu' };
    }
  };

  const getScoreData = (testType, result) => {
    if (result.score === undefined) return null;
    const maxScores = { GAD7: 21, PSS10: 40, PHQ9: 27, ROSENBERG: 40 };
    const max = maxScores[testType];
    if (!max) return null;
    return { score: result.score, max: max, percentage: Math.min(100, Math.round((result.score / max) * 100)) };
  };

  const config = getTestConfig(testType);
  const labelInfo = getLabelInfo(testType, result);
  const scoreData = getScoreData(testType, result);
  const description = result.description || result.desc || labelInfo.desc;

  // Copy link
  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}?ref=${testType}-${result.type || result.score}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share email
  const handleShareEmail = () => {
    const subject = `Hasil Tes ${config.title} - ${labelInfo.label}`;
    const body = `Aku baru saja tes ${config.title} di Kancah Ate!\n\nHasilku: ${labelInfo.label}\n${description}\n\nCoba tesnya di: ${window.location.href}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Download Image
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        scale: 4, // Scale 4 for HD Instagram Story crispness
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `kancahate-result-${testType}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      alert('Gagal mendownload gambar. Silakan screenshot manual.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Shareable Card - Portrait 9:16 Instagram Story Format */}
      <div className="flex justify-center w-full">
        <div
          ref={cardRef}
          className="relative overflow-hidden"
          style={{
            width: '100%',
            maxWidth: '380px', // Portrait constraint
            aspectRatio: '9/16', // Instagram Story proportion
            minHeight: '675px', // Fallback height
            margin: '0 auto',
            borderRadius: '24px',
            background: config.gradient,
            color: config.textColor,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* TOP BAR: Test Title Badge (Left) & Kancah Ate Logo (Right) */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '24px', position: 'relative', zIndex: 10
          }}>
            {/* Test Badge */}
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '14px' }}>{config.emoji}</span>
              <span>{config.title}</span>
            </div>

            {/* Logo Kancah Ate Asli */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.95)', padding: '6px 10px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <img 
                src="/logo.png" 
                alt="Logo Kancah Ate" 
                crossOrigin="anonymous" 
                style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
              />
              <div style={{
                fontSize: '13px', fontWeight: 800,
                letterSpacing: '0.5px', color: '#1e293b'
              }}>
                Kancah Ate
              </div>
            </div>
          </div>

          {/* MAIN CONTENT: Centered */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: '0 32px', position: 'relative', zIndex: 10,
            textAlign: 'center'
          }}>
            {/* Huge Emoji */}
            <div style={{
              fontSize: '80px',
              lineHeight: 1,
              marginBottom: '24px',
              filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.2))'
            }}>
              {config.emoji}
            </div>

            {/* "YOUR RESULT" Text */}
            <div style={{
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              opacity: 0.9,
              marginBottom: '12px'
            }}>
              Hasil Tes Kamu
            </div>

            {/* Main Result Label */}
            <h1 style={{
              fontSize: labelInfo.label.length > 15 ? '36px' : '48px', // Dinamis jika kata panjang
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-1.5px',
              marginBottom: scoreData ? '24px' : '32px',
              textShadow: '0 8px 16px rgba(0,0,0,0.2)'
            }}>
              {labelInfo.label.toUpperCase()}
            </h1>

            {/* Progress Bar Score (Replacing text score) */}
            {scoreData && (
              <div style={{ width: '100%', maxWidth: '240px', marginBottom: '36px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '6px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <span>Intensitas</span>
                  <span>{scoreData.percentage}%</span>
                </div>
                <div style={{
                  height: '8px',
                  width: '100%',
                  background: 'rgba(0,0,0,0.15)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${scoreData.percentage}%`,
                    background: testType === 'ROSENBERG' ? '#ca8a04' : 'white', // warna kontras
                    borderRadius: '10px',
                    boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                  }}></div>
                </div>
              </div>
            )}

            {/* Description Glass Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <p style={{
                fontSize: '15px',
                lineHeight: 1.6,
                fontWeight: 600,
                margin: 0,
                textShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                "{description}"
              </p>
            </div>
          </div>

          {/* FOOTER: Date & URL */}
          <div style={{
            padding: '24px',
            position: 'relative', zIndex: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            opacity: 0.8
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>
              {userName}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px' }}>
                KANCAHATE.MY.ID
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px', fontWeight: 600 }}>
                {currentDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (outside the card) */}
      <div className="flex gap-3 flex-wrap max-w-[380px] mx-auto mt-6">
        <button
          onClick={() => setShowShareModal(!showShareModal)}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
        >
          <Share2 size={18} />
          Bagikan
        </button>
        <button
          onClick={handleCopyLink}
          className="bg-white border-2 border-slate-200 text-slate-700 px-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all"
          title="Copy Link"
        >
          {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-white border-2 border-slate-200 text-slate-700 px-4 py-3.5 rounded-xl flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
          title="Download Gambar"
        >
          {isDownloading ? (
            <div className="w-[18px] h-[18px] border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download size={18} />
          )}
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[380px] mx-auto mt-4 bg-white rounded-2xl p-6 shadow-xl border border-slate-100"
        >
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Share2 size={18} className="text-purple-500" />
            Share Hasilmu
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShareEmail}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all"
            >
              <Mail size={24} className="text-pink-500" />
              <span className="text-xs font-bold text-slate-700">Email</span>
            </button>
            <button
              onClick={() => {
                const text = `Aku baru saja tes ${config.title} di Kancah Ate! Hasilku: ${labelInfo.label}. Coba deh! 🧠✨`;
                if (navigator.share) {
                  navigator.share({ title: `Hasil ${config.title}`, text: text, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(text);
                  alert('Teks sudah disalin! Paste ke sosmed kamu.');
                }
              }}
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all"
            >
              <Share2 size={24} className="text-blue-500" />
              <span className="text-xs font-bold text-slate-700">Lainnya</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-4">
            Screenshot kartu di atas atau klik tombol download untuk upload ke IG Story!
          </p>
        </motion.div>
      )}
    </div>
  );
}
