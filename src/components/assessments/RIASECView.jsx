// --- RIASEC ASSESSMENT VIEW (Holland Code) - RIMB STYLE ---
// Format: Setiap soal menampilkan 6 aktivitas, user pilih yang PALING disukai
// Lebih adil daripada Likert karena memaksa user membandingkan langsung

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  X,
  MessageCircle,
  LogIn,
  AlertCircle,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Info,
  Play,
  Mail
} from 'lucide-react';
import { getRimbQuestions, calculateRIASECRimbScore } from '../../data/riasec_rimb_data';
import { saveAssessmentResult, checkAuthStatus } from '../../services/assessmentService';
import ShareableResult from './ShareableResult';

/**
 * RIASECView - Komponen tes minat karir Holland Code (RIMB Style)
 * @param {function} onBack - Callback untuk kembali
 * @param {function} onChat - Callback untuk lanjut ke chat dengan hasil
 */
function RIASECView({ onBack, onChat }) {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);
  const [showIntro, setShowIntro] = useState(true); // Add intro state

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Randomized questions (only generated once on mount)
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    checkAuthStatus().then(({ isLoggedIn }) => {
      setIsLoggedIn(isLoggedIn);
    });
    // Generate randomized questions once on mount
    setQuestions(getRimbQuestions());
  }, []);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const handleAnswer = (selectedType) => {
    const newAnswers = { ...answers, [currentQuestion.id]: selectedType };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Calculate RIASEC score
        const riasecResult = calculateRIASECRimbScore(newAnswers);
        setResult(riasecResult);
        setCompletedAt(new Date().toISOString()); // Simpan waktu selesai tes
        setShowResult(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Save result
        saveAssessmentResult('riasec', riasecResult).then((saved) => {
          if (saved.success) {
            console.log('RIASEC result saved:', saved.data);
            setSaveStatus('success');
          } else if (saved.requiresLogin) {
            setSaveStatus('requires_login');
          } else {
            setSaveStatus('error');
          }
        });
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  // Show intro page first
  if (showIntro) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12 min-h-[80vh] flex flex-col justify-center">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors">
          <ArrowLeft size={18} /> Kembali
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase size={32} className="text-white" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
            Tes Minat Karir (RIASEC)
          </h1>
          <p className="text-slate-500 mb-6">
            Temukan tipe karir yang sesuai dengan minat dan bakatmu
          </p>

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-center">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-orange-500">10</div>
              <div className="text-xs text-slate-500">Pertanyaan</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-pink-500">~2</div>
              <div className="text-xs text-slate-500">Menit</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-purple-500">Gratis</div>
              <div className="text-xs text-slate-500">100%</div>
            </div>
          </div>

          {/* Disclaimer Info */}
          <div className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-200 text-left">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800 mb-1">
                  Ini adalah tes screening awal (versi quick)
                </p>
                <p className="text-xs text-amber-700">
                  Hasil memberikan indikasi minat karir awalmu. Untuk asesmen karir yang lebih detail dan akurat, kamu bisa hubungi admin atau gunakan layanan konseling karir.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowIntro(false)}
            className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Play size={20} />
            Mulai Tes
          </button>
        </motion.div>
      </div>
    );
  }

  if (showResult && result) {
    return <RIASECResult result={result} onBack={onBack} onChat={onChat} saveStatus={saveStatus} completedAt={completedAt} />;
  }

  // Show loading while questions are being generated
  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12 min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-slate-500">Memuat pertanyaan...</p>
        </div>
      </div>
    );
  }

  // Type colors for highlighting (neutral by default to avoid bias)
  const typeColors = {
    R: 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    I: 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    A: 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    S: 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    E: 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    C: 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
  };

  const typeColorsSelected = {
    R: 'border-orange-500 bg-orange-500 text-white',
    I: 'border-blue-500 bg-blue-500 text-white',
    A: 'border-purple-500 bg-purple-500 text-white',
    S: 'border-green-500 bg-green-500 text-white',
    E: 'border-yellow-500 bg-yellow-500 text-white',
    C: 'border-slate-500 bg-slate-500 text-white'
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 min-h-[80vh] flex flex-col justify-center">
      {/* Progress Header */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <button onClick={onBack} className="text-slate-400 hover:text-orange-500 transition-colors">
            <X size={24} />
          </button>
          <div className="text-xs font-bold text-slate-400 tracking-widest">
            PERTANYAAN {currentIndex + 1} / {totalQuestions}
          </div>
        </div>

        {/* Quiz Title */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Briefcase size={20} className="text-orange-500" />
          <span className="text-sm font-bold text-orange-600 uppercase tracking-wider">
            Tes Minat Karir
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-400 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 md:p-8">
            {/* Question Text */}
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 text-center mb-6 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* Helper Text */}
            <p className="text-center text-slate-500 text-sm mb-6">
              Pilih satu yang PALING kamu sukai 👇
            </p>

            {/* Options - Grid Layout 2x3 */}
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === option.value;
                const colorClass = isSelected
                  ? typeColorsSelected[option.value]
                  : typeColors[option.value];

                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleAnswer(option.value)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all
                      flex items-center gap-3
                      ${colorClass}
                    `}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="font-semibold text-sm text-left flex-1">{option.label}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 size={14} className="text-green-500" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {currentIndex > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handlePrevious}
          className="mt-6 w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          Kembali ke Pertanyaan Sebelumnya
        </motion.button>
      )}
    </div>
  );
}

/**
 * RIASEC Result Component
 */
function RIASECResult({ result, onBack, onChat, saveStatus, completedAt }) {
  const { hollandCode, primaryType, allScores, primaryInfo, typeBreakdown } = result;

  // Email collection state
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle'); // idle, loading, success, error
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleSendReport = async () => {
    if (!email || !email.includes('@')) {
      setEmailStatus('error');
      return;
    }

    setEmailStatus('loading');

    try {
      const response = await fetch('/api/send-riasec-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          hollandCode,
          primaryType,
          typeBreakdown
        })
      });

      if (response.ok) {
        setEmailStatus('success');
        // Save to database (without requiring login)
        setTimeout(() => setShowEmailInput(false), 2000);
      } else {
        setEmailStatus('error');
      }
    } catch (err) {
      console.error('Failed to send report:', err);
      setEmailStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors"
      >
        <ArrowLeft size={18} /> Kembali ke Beranda
      </button>

      {/* Main Result Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-br ${primaryInfo.gradient} rounded-[2.5rem] p-10 md:p-12 text-center text-white shadow-2xl mb-8 relative overflow-hidden`}
      >
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Holland Code */}
        <div className="relative z-10">
          <div className="text-sm font-bold uppercase tracking-widest mb-4 opacity-80">
            Kode Karir Holland
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-4">{hollandCode}</h1>
          <div className="text-4xl md:text-5xl font-bold mb-6">{primaryInfo.emoji}</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{primaryInfo.title}</h2>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-xl mx-auto mb-8">
            {primaryInfo.desc}
          </p>

          {/* Keywords */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {primaryInfo.keywords.map((keyword) => (
              <span
                key={keyword}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Type Breakdown (All 6 Types) */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Profil Minat Kamu</h3>
        <div className="space-y-4">
          {typeBreakdown.map((type) => (
            <div key={type.code} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{type.emoji}</span>
                  <span className="font-bold text-slate-700">{type.title}</span>
                </div>
                <span className="text-sm font-bold text-slate-500">{type.percentage}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${type.percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full ${type.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Recommendations */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[2rem] p-8 mb-6 border-2 border-purple-100">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase size={24} className="text-purple-600" />
          <h3 className="text-2xl font-bold text-slate-800">Rekomendasi Karir</h3>
        </div>
        <p className="text-slate-600 mb-4">Berdasarkan tipe utamamu ({primaryType}), karir-karir ini cocok banget sama kamu:</p>
        <div className="flex flex-wrap gap-3">
          {primaryInfo.jobs.map((job) => (
            <span
              key={job}
              className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-slate-700 border border-purple-200 shadow-sm"
            >
              {job}
            </span>
          ))}
        </div>
      </div>

      {/* Strengths & Advice */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Sparkles size={18} />
            Kelebihan Kamu
          </h4>
          <ul className="space-y-2">
            {primaryInfo.strengths.map((strength) => (
              <li key={strength} className="text-sm text-blue-700 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
          <h4 className="font-bold text-green-800 mb-3">💡 Saran Karir</h4>
          <p className="text-sm text-green-700 leading-relaxed">{primaryInfo.advice}</p>
        </div>
      </div>

      {/* Save Status Messages */}
      {saveStatus === 'requires_login' && (
        <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800 mb-1">Login Diperlukan</p>
            <p className="text-xs text-amber-700 mb-3">Silakan login untuk menyimpan hasil tes kamu secara permanen.</p>
            <button
              onClick={() => (window.location.href = '/login')}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-amber-600 transition-colors"
            >
              <LogIn size={16} />
              Login Sekarang
            </button>
          </div>
        </div>
      )}

      {saveStatus === 'success' && (
        <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
          <p className="text-sm font-bold text-green-800">Hasil tes berhasil disimpan!</p>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-sm font-bold text-red-800">Gagal menyimpan hasil tes. Hasil tetap ditampilkan di bawah.</p>
        </div>
      )}

      {/* Shareable Result Card */}
      <div className="mb-8">
        <ShareableResult
          testType="RIASEC"
          result={{
            code: hollandCode,
            category: primaryInfo.title,
            description: primaryInfo.desc
          }}
          userName="Kamu"
          completedAt={completedAt}
        />
      </div>

      {/* Email Collection Section */}
      {!showEmailInput ? (
        <div className="mb-8">
          <button
            onClick={() => setShowEmailInput(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Mail size={20} />
            Kirim Laporan Lengkap ke Email
          </button>
          <p className="text-xs text-slate-400 text-center mt-2">
            Dapatkan analisa detail, tips karir, & rekomendasi sumber belajar
          </p>
        </div>
      ) : (
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-blue-800 flex items-center gap-2">
              <Mail size={18} />
              Kirim Laporan ke Email
            </h4>
            {emailStatus !== 'idle' && (
              <button
                onClick={() => setShowEmailInput(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {emailStatus === 'success' ? (
            <div className="text-center py-4">
              <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
              <p className="font-bold text-green-700">Laporan berhasil dikirim!</p>
              <p className="text-sm text-slate-600">Cek inbox email kamu.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-3">
                Masukkan email untuk menerima laporan lengkap termasuk:
              </p>
              <ul className="text-xs text-slate-500 mb-4 space-y-1">
                <li>• Analisa mendalam tipe karirmu</li>
                <li>• Tips mengembangkan potensi diri</li>
                <li>• Rekomendasi kursus & sumber belajar</li>
                <li>• Panduan langkah selanjutnya</li>
              </ul>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailStatus('idle');
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                    emailStatus === 'error'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-slate-200 bg-white focus:border-blue-300 focus:outline-none'
                  }`}
                  disabled={emailStatus === 'loading'}
                />
                <button
                  onClick={handleSendReport}
                  disabled={emailStatus === 'loading'}
                  className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${
                    emailStatus === 'loading'
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {emailStatus === 'loading' ? (
                    'Mengirim...'
                  ) : emailStatus === 'error' ? (
                    'Coba Lagi'
                  ) : (
                    'Kirim'
                  )}
                </button>
              </div>
              {emailStatus === 'error' && (
                <p className="text-xs text-red-500 mt-2">
                  Gagal mengirim. Coba lagi atau hubungi admin.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-4 rounded-xl font-bold hover:border-orange-200 hover:text-orange-500 transition-all"
        >
          Selesai
        </button>
        <button
          onClick={() => onChat(result)}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle size={20} />
          Diskusikan dengan Kai
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-slate-50 rounded-2xl p-6 text-center text-xs text-slate-500 border border-slate-100">
        <p className="font-semibold text-slate-700 mb-2">📌 Catatan Penting:</p>
        <p className="mb-3">
          Ini adalah <strong>tes screening awal (versi quick 10 soal)</strong>. Hasil memberikan indikasi minat karir dasar.
        </p>
        <p className="mb-3">
          Untuk <strong>asesmen karir yang lebih detail dan akurat</strong> (versi lengkap 60 soal dengan analisa mendalam),
          silakan hubungi admin atau gunakan layanan konseling karir profesional.
        </p>
        <p className="border-t border-slate-200 pt-3">
          Minat & bakat bisa berkembang seiring waktu. Gunakan hasil ini sebagai bahan eksplorasi,
          bukan sebagai batasan karir masa depan. Selamat menemukan passion kamu! ✨
        </p>
      </div>
    </div>
  );
}

export default RIASECView;
