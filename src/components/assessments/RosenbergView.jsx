// --- ROSENBERG SELF-ESTEEM SCALE VIEW ---
// Gen Z-friendly with reverse scoring handled automatically

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  X,
  CheckCircle2,
  MessageCircle,
  LogIn,
  AlertCircle,
  Star
} from 'lucide-react';
import { rosenbergQuestions, calculateRosenbergScore } from '../../data/rosenberg_data';
import { saveAssessmentResult, checkAuthStatus } from '../../services/assessmentService';
import ShareableResult from './ShareableResult';

/**
 * RosenbergView - Self-esteem scale component
 * @param {function} onBack - Callback untuk kembali
 * @param {function} onChat - Callback untuk lanjut ke chat dengan hasil
 */
function RosenbergView({ onBack, onChat }) {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    checkAuthStatus().then(({ isLoggedIn }) => {
      setIsLoggedIn(isLoggedIn);
    });
  }, []);

  const totalQuestions = rosenbergQuestions.length;
  const currentQuestion = rosenbergQuestions[currentIndex];

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Calculate Rosenberg score (handles reverse scoring automatically)
        const rosenbergResult = calculateRosenbergScore(newAnswers);
        setResult(rosenbergResult);
        setCompletedAt(new Date().toISOString());
        setShowResult(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Save result
        saveAssessmentResult('rosenberg', rosenbergResult).then((saved) => {
          if (saved.success) {
            console.log('Rosenberg result saved:', saved.data);
            setSaveStatus('success');
          } else if (saved.requiresLogin) {
            setSaveStatus('requires_login');
          } else {
            setSaveStatus('error');
          }
        });
      }
    }, 250);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  if (showResult && result) {
    return <RosenbergResult result={result} onBack={onBack} onChat={onChat} saveStatus={saveStatus} completedAt={completedAt} />;
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12 min-h-[80vh] flex flex-col justify-center">
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

        {/* Type Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star size={18} className="text-yellow-500" />
          <span className="text-sm font-bold text-yellow-600 uppercase tracking-wider">
            Rosenberg Self-Esteem Scale
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          <div className="bg-white rounded-[2rem] shadow-xl border-2 border-slate-100 p-8 md:p-10">
            {/* Question Text */}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-8 leading-relaxed">
              Sejauh mana kamu setuju dengan pernyataan berikut?
            </h2>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8 border border-yellow-100">
              <p className="text-xl md:text-2xl font-semibold text-slate-800 text-center leading-relaxed">
                "{currentQuestion.text}"
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleAnswer(option.value)}
                  className={`
                    w-full text-left p-4 rounded-xl border-2 transition-all
                    flex items-center gap-4
                    hover:shadow-lg
                    ${
                      answers[currentQuestion.id] === option.value
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-500 text-white'
                        : 'border-slate-200 hover:border-yellow-300 text-slate-700 bg-white'
                    }
                  `}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-semibold flex-1">{option.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Info Note */}
            <div className="mt-6 bg-slate-50 rounded-xl p-4 text-sm text-slate-600 text-center">
              <p>💡 Jawab dengan jujur sesuai perasaanmu saat ini. Tidak ada jawaban yang benar atau salah.</p>
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
 * Rosenberg Result Component
 */
function RosenbergResult({ result, onBack, onChat, saveStatus, completedAt }) {
  const { score, maxScore, minScore, level, color, gradient, emoji, description, recommendations, interpretation } = result;

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
        className={`bg-gradient-to-br ${gradient} rounded-[2.5rem] p-10 md:p-12 text-center text-white shadow-2xl mb-8 relative overflow-hidden`}
      >
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Result */}
        <div className="relative z-10">
          <div className="text-sm font-bold uppercase tracking-widest mb-4 opacity-80">
            Tingkat Harga Diri
          </div>
          <div className="text-6xl md:text-7xl font-black mb-4">{emoji}</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Harga Diri {level}</h1>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-xl mx-auto mb-8">
            {description}
          </p>

          {/* Score */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 inline-block mb-6">
            <p className="text-sm opacity-80">Skor Rosenberg</p>
            <p className="text-3xl font-black">{score} / 40</p>
            <p className="text-xs opacity-70 mt-1">Rentang: {minScore} - {maxScore}</p>
          </div>

          {/* Interpretation */}
          <div className="bg-white/10 rounded-xl p-4 text-left max-w-lg mx-auto">
            <h3 className="font-bold text-lg mb-2">{interpretation.title}</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Kelebihan:</span> {interpretation.strengths.join(', ')}</p>
              {interpretation.challenges.length > 0 && (
                <p><span className="font-semibold">Tantangan:</span> {interpretation.challenges.join(', ')}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Rekomendasi untuk Kamu</h3>
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-100"
            >
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                {idx + 1}
              </div>
              <p className="text-slate-700 leading-relaxed">{rec}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Educational Content */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          <Star size={18} />
          Tentang Harga Diri
        </h3>
        <p className="text-sm text-blue-700 leading-relaxed">
          Harga diri (self-esteem) adalah seberapa banyak kamu menghargai dan menyukai diri sendiri.
          Harga diri yang sehat berarti kamu menerima diri sendiri dengan semua kelebihan dan kekurangan.
          Harga diri BUKAN hal yang statis - bisa ditingkatkan dengan latihan dan kesabaran!
        </p>
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
          testType="ROSENBERG"
          result={{
            type: level,
            score: score,
            description: `${interpretation.title} - Skor: ${score}/40`
          }}
          userName="Kamu"
          completedAt={completedAt}
        />
      </div>

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
          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle size={20} />
          Diskusikan dengan Kai
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-slate-50 rounded-2xl p-6 text-center text-xs text-slate-500 border border-slate-100">
        <p className="font-semibold text-slate-700 mb-2">Catatan Penting:</p>
        <p>
          Hasil ini menunjukkan tingkat harga diri saat ini dan BUKAN diagnosis medis.
          Harga diri bisa berubah seiring waktu dan pengalaman. Jika hasilnya rendah,
          pertimbangkan untuk berbicara dengan konselor atau profesional kesehatan mental.
        </p>
      </div>
    </div>
  );
}

export default RosenbergView;
