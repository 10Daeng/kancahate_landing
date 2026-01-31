// --- SHAREABLE RESULT COMPONENT ---
// Gen Z-friendly: Share assessment results to Instagram Story
// Visual: Estetik, card-based, ready to screenshot

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Instagram, Copy, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

/**
 * ShareableResult - Card hasil tes yang estetik untuk di-share
 * Bisa di-screenshot langsung untuk Instagram Story
 *
 * Props:
 * - testType: 'GAD7' | 'PSS10' | 'MBTI' | 'BigFive'
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
  const completionTime = completedAt ? new Date(completedAt) : new Date();

  // Konfigurasi untuk setiap tipe tes - dengan design yang lebih menarik
  const getTestConfig = (testType) => {
    const configs = {
      GAD7: {
        headerGradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
        headerBg: '#14b8a6',
        emoji: '🧠',
        emojiLarge: '🧠',
        title: 'Tingkat Kecemasan',
        resultColor: '#16a34a',
        resultBg: '#dcfce7',
        description: 'Tes untuk mengukur tingkat kecemasan yang kamu alami'
      },
      PSS10: {
        headerGradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        headerBg: '#f97316',
        emoji: '😰',
        emojiLarge: '😰',
        title: 'Tingkat Stres',
        resultColor: '#ea580c',
        resultBg: '#fed7aa',
        description: 'Tes untuk mengukur tingkat stres yang kamu alami'
      },
      MBTI: {
        headerGradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        headerBg: '#a855f7',
        emoji: '🎭',
        emojiLarge: '🎭',
        title: 'Tipe Kepribadian',
        resultColor: '#9333ea',
        resultBg: '#f3e8ff',
        description: 'Tes untuk mengetahui 1 dari 16 tipe karaktermu'
      },
      BigFive: {
        headerGradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        headerBg: '#3b82f6',
        emoji: '🌟',
        emojiLarge: '🌟',
        title: 'Kepribadian Big Five',
        resultColor: '#2563eb',
        resultBg: '#dbeafe',
        description: 'Tes untuk mengetahui 5 dimensi utama kepribadianmu'
      },
      RIASEC: {
        headerGradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        headerBg: '#a855f7',
        emoji: '💼',
        emojiLarge: '💼',
        title: 'Tes Minat Karir',
        resultColor: '#9333ea',
        resultBg: '#f3e8ff',
        description: 'Tes Holland Code untuk menemukan karir yang sesuai'
      },
      PHQ9: {
        headerGradient: 'linear-gradient(135deg, #fb7185 0%, #f472b6 100%)',
        headerBg: '#fb7185',
        emoji: '💔',
        emojiLarge: '💔',
        title: 'Tingkat Depresi',
        resultColor: '#e11d48',
        resultBg: '#ffe4e6',
        description: 'Tes untuk mengukur gejala depresi yang mungkin kamu alami'
      },
      ROSENBERG: {
        headerGradient: 'linear-gradient(135deg, #facc15 0%, #f97316 100%)',
        headerBg: '#facc15',
        emoji: '⭐',
        emojiLarge: '⭐',
        title: 'Tingkat Harga Diri',
        resultColor: '#ca8a04',
        resultBg: '#fef9c3',
        description: 'Tes untuk mengukur tingkat kepercayaan diri kamu'
      },
      VARK: {
        headerGradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
        headerBg: '#8b5cf6',
        emoji: '📚',
        emojiLarge: '📚',
        title: 'Gaya Belajar',
        resultColor: '#7c3aed',
        resultBg: '#ede9fe',
        description: 'Tes untuk mengetahui gaya belajarmu'
      },
      MI: {
        headerGradient: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
        headerBg: '#6366f1',
        emoji: '🧠',
        emojiLarge: '🧠',
        title: 'Multiple Intelligence',
        resultColor: '#4f46e5',
        resultBg: '#e0e7ff',
        description: 'Tes untuk mengetahui kecerdasan unikmu'
      },
      LoveLanguages: {
        headerGradient: 'linear-gradient(135deg, #f472b6 0%, #fb7185 100%)',
        headerBg: '#f472b6',
        emoji: '❤️',
        emojiLarge: '❤️',
        title: 'Bahasa Cinta',
        resultColor: '#db2777',
        resultBg: '#fce7f3',
        description: 'Tes untuk mengetahui bahasa cintamu'
      }
    };
    return configs[testType] || configs.GAD7;
  };

  const getLabelInfo = (testType, result) => {
    switch (testType) {
      case 'GAD7':
        if (result.score <= 4) return { label: 'Kecemasan Minimal', emoji: '😊', color: '#16a34a', bg: '#dcfce7', desc: 'Kondisimu baik-baik saja' };
        if (result.score <= 9) return { label: 'Kecemasan Ringan', emoji: '😌', color: '#84cc16', bg: '#bef264', desc: 'Tingkat kecemasan ringan' };
        if (result.score <= 14) return { label: 'Kecemasan Sedang', emoji: '😟', color: '#f59e0b', bg: '#fed7aa', desc: 'Perlu perhatian khusus' };
        return { label: 'Kecemasan Berat', emoji: '😰', color: '#dc2626', bg: '#fecaca', desc: 'Segera cari bantuan' };
      case 'PSS10':
        if (result.score <= 13) return { label: 'Stres Rendah', emoji: '😊', color: '#16a34a', bg: '#dcfce7', desc: 'Tingkat stres rendah' };
        if (result.score <= 26) return { label: 'Stres Sedang', emoji: '😐', color: '#f59e0b', bg: '#fed7aa', desc: 'Tingkat stres sedang' };
        return { label: 'Stres Tinggi', emoji: '😰', color: '#dc2626', bg: '#fecaca', desc: 'Tingkat stres tinggi' };
      case 'PHQ9':
        if (result.score <= 4) return { label: 'Depresi Minimal', emoji: '😊', color: '#16a34a', bg: '#dcfce7', desc: 'Tingkat depresi minimal' };
        if (result.score <= 9) return { label: 'Depresi Ringan', emoji: '😌', color: '#84cc16', bg: '#bef264', desc: 'Tingkat depresi ringan' };
        if (result.score <= 14) return { label: 'Depresi Sedang', emoji: '😟', color: '#f59e0b', bg: '#fed7aa', desc: 'Tingkat depresi sedang' };
        if (result.score <= 19) return { label: 'Depresi Moderat', emoji: '😰', color: '#ea580c', bg: '#f97316', desc: 'Tingkat depresi moderat' };
        return { label: 'Depresi Berat', emoji: '😢', color: '#dc2626', bg: '#fecaca', desc: 'Tingkat depresi berat' };
      case 'ROSENBERG':
        if (result.score >= 35) return { label: 'Harga Diri Sangat Tinggi', emoji: '⭐', color: '#16a34a', bg: '#dcfce7', desc: 'Sangat percaya diri' };
        if (result.score >= 30) return { label: 'Harga Diri Tinggi', emoji: '😊', color: '#14b8a6', bg: '#ccfbf1', desc: 'Percaya diri' };
        if (result.score >= 25) return { label: 'Harga Diri Sedang', emoji: '😐', color: '#f59e0b', bg: '#fed7aa', desc: 'Harga diri sedang' };
        return { label: 'Harga Diri Rendah', emoji: '😟', color: '#ef4444', bg: '#fecaca', desc: 'Perlu tingkatkan' };
      default:
        return { label: result.label || result.type || result.title || 'Hasil Tes', emoji: '📊', color: '#6366f1', bg: '#e0e7ff', desc: 'Hasil tes kamu' };
    }
  };

  const getScoreDisplay = (testType, result, labelInfo) => {
    if (result.score === undefined) return null;
    const maxScores = { GAD7: 21, PSS10: 40, PHQ9: 27, ROSENBERG: 40 };
    const maxScore = maxScores[testType] || '-';
    return `${result.score}/${maxScore}`;
  };

  const getDescription = (testType, result, labelInfo) => {
    if (result.description) return result.description;
    if (result.desc) return result.desc;
    return labelInfo.desc;
  };

  // Format tanggal dan waktu WIB
  const formatDateWIB = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };
  const formatTimeWIB = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} WIB`;
  };
  const currentDate = formatDateWIB(completionTime);
  const currentTime = formatTimeWIB(completionTime);

  const config = getTestConfig(testType);
  const labelInfo = getLabelInfo(testType, result);
  const scoreDisplay = getScoreDisplay(testType, result, labelInfo);
  const description = getDescription(testType, result, labelInfo);

  // Copy link ke clipboard
  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}?ref=${testType}-${result.type || result.score}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share ke Instagram (buka app)
  const handleShareInstagram = () => {
    const instagramUrl = 'https://www.instagram.com/';
    window.open(instagramUrl, '_blank');
  };

  // Download sebagai gambar
  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
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
      console.error("Download fail:", err);
      alert('Gagal mendownload gambar. Silakan screenshot manual.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Shareable Card - dengan inline styles untuk html2canvas */}
      <div
        ref={cardRef}
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Header dengan gradient */}
        <div
          style={{
            padding: '24px',
            paddingBottom: '16px',
            background: config.headerGradient
          }}
        >
          {/* Badge Title */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              marginBottom: '0'
            }}
          >
            <span style={{ fontSize: '14px' }}>{config.emoji}</span>
            <span>{config.title}</span>
          </div>
        </div>

        {/* Content Container */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          {/* Result Card dengan Emoji Besar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: labelInfo.bg,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              border: `2px solid ${labelInfo.color}30`
            }}
          >
            {/* Large Emoji */}
            <div
              style={{
                fontSize: '48px',
                lineHeight: 1,
                flexShrink: 0,
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
              }}
            >
              {config.emojiLarge}
            </div>

            {/* Result Info */}
            <div style={{ flex: 1 }}>
              {/* Label dengan sejajar */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: `${labelInfo.color}99`, fontWeight: 500 }}>
                  Hasil tes
                </span>
              </div>

              {/* Main Label */}
              <div
                style={{
                  color: labelInfo.color,
                  fontSize: '22px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  marginBottom: '4px'
                }}
              >
                {labelInfo.label}
              </div>

              {/* Score Display - sejajar dengan label */}
              {scoreDisplay && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: labelInfo.color
                  }}
                >
                  <span style={{ opacity: 0.7 }}>Skor:</span>
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>{scoreDisplay}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
            {description}
          </p>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo & Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ color: 'white', fontSize: '10px', fontWeight: 700 }}>KA</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>Kancah Ate</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Teman Cerita Virtual</div>
              </div>
            </div>

            {/* Date & URL */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{currentDate} • {currentTime}</div>
              <div style={{ fontSize: '10px', color: '#cbd5e1' }}>kancahate.my.id</div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setShowShareModal(!showShareModal)}
          className="flex-1 min-w-[140px] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
        >
          <Share2 size={18} />
          Share Hasil
        </button>
        <button
          onClick={handleCopyLink}
          className="flex-1 min-w-[140px] bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
        >
          {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          {copied ? 'Tersalin!' : 'Copy Link'}
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-white rounded-2xl p-6 shadow-xl border border-slate-100"
        >
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Share2 size={18} className="text-purple-500" />
            Share Hasilmu
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShareInstagram}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all"
            >
              <Instagram size={24} className="text-pink-500" />
              <span className="text-xs font-bold text-slate-700">Instagram Story</span>
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
            💡 Screenshot kartu hasil di atas untuk upload ke Instagram Story!
          </p>
        </motion.div>
      )}
    </div>
  );
}
