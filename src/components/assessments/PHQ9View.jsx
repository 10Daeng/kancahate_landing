// --- PHQ-9 DEPRESSION SCREENING VIEW ---
// Gen Z-friendly with crisis detection and resource sharing

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  X,
  CheckCircle2,
  MessageCircle,
  LogIn,
  AlertCircle,
  Heart,
  Phone,
  ExternalLink
} from 'lucide-react';
import { phq9Questions, calculatePHQ9Score } from '../../data/phq9_data';
import { saveAssessmentResult, checkAuthStatus } from '../../services/assessmentService';
import ShareableResult from './ShareableResult';

/**
 * PHQ9View - Depression screening component
 * @param {function} onBack - Callback untuk kembali
 * @param {function} onChat - Callback untuk lanjut ke chat dengan hasil
 */
function PHQ9View({ onBack, onChat }) {
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

  const totalQuestions = phq9Questions.length;
  const currentQuestion = phq9Questions[currentIndex];

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Calculate PHQ-9 score
        const phq9Result = calculatePHQ9Score(newAnswers);
        setResult(phq9Result);
        setCompletedAt(new Date().toISOString()); // Simpan waktu selesai tes
        setShowResult(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Save result (always show result first, save is secondary)
        saveAssessmentResult('phq9', phq9Result).then((saved) => {
          if (saved.success && !saved.savedLocally) {
            console.log('PHQ-9 result saved to database:', saved.data);
            setSaveStatus('success');
          } else if (saved.success && saved.savedLocally) {
            console.log('PHQ-9 result saved locally:', saved.data);
            setSaveStatus(saved.requiresLogin ? 'saved_local_login' : 'saved_local');
          } else if (saved.requiresLogin) {
            setSaveStatus('requires_login');
          } else {
            // Even on error, result is shown - this is just for save status
            console.warn('PHQ-9 save issue:', saved.message);
            setSaveStatus('saved_local');
          }
        });
      }
    }, 250);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  if (showResult && result) {
    return <PHQ9Result result={result} onBack={onBack} onChat={onChat} saveStatus={saveStatus} completedAt={completedAt} />;
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
          <Heart size={18} className="text-rose-500" />
          <span className="text-sm font-bold text-rose-600 uppercase tracking-wider">
            PHQ-9 - Screening Depresi
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-400 to-pink-500"
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
          <div className={`bg-white rounded-[2rem] shadow-xl border-2 p-8 md:p-10 ${currentQuestion.isCrisis ? 'border-rose-200' : 'border-slate-100'}`}>
            {/* Crisis Question Badge */}
            {currentQuestion.isCrisis && (
              <div className="flex justify-center mb-6">
                <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  Pertanyaan Penting
                </div>
              </div>
            )}

            {/* Question Text */}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-8 leading-relaxed">
              Selama 2 minggu terakhir, {currentQuestion.text.toLowerCase()}?
            </h2>

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
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'border-slate-200 hover:border-rose-300 text-slate-700 bg-white'
                    }
                  `}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-semibold flex-1">{option.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Crisis Support Message */}
            {currentQuestion.isCrisis && (
              <div className="mt-6 bg-rose-50 rounded-xl p-4 text-sm text-rose-700">
                <p className="font-semibold mb-2">💟 Jawabanmu bersifat rahasia.</p>
                <p>Jika kamu merasa ingin melukai diri sendiri, tolong segera hubungi bantuan profesional. Kami peduli padamu.</p>
              </div>
            )}
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
 * PHQ-9 Result Component
 */
function PHQ9Result({ result, onBack, onChat, saveStatus, completedAt }) {
  const { score, maxScore, severity, color, gradient, emoji, description, recommendations, crisisAlert } = result;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors"
      >
        <ArrowLeft size={18} /> Kembali ke Beranda
      </button>

      {/* Crisis Alert */}
      {crisisAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-br from-rose-100 to-pink-100 border-2 border-rose-200 rounded-3xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="bg-rose-500 text-white p-3 rounded-full flex-shrink-0">
              <AlertCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-rose-800 mb-2">{crisisAlert.message}</h3>
              <p className="text-sm text-rose-700 mb-4">Kamu tidak sendirian. Bantuan tersedia.</p>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-rose-800">📞 Hotline Bantuan:</p>
                {crisisAlert.resources.map((resource, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-rose-600" />
                    <span className="font-bold text-rose-700">{resource.name}:</span>
                    <span className="text-rose-900">{resource.phone || resource.url}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
            Hasil Screening Depresi
          </div>
          <div className="text-6xl md:text-7xl font-black mb-4">{emoji}</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Depresi {severity}</h1>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-xl mx-auto mb-8">
            {description}
          </p>

          {/* Score */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 inline-block">
            <p className="text-sm opacity-80">Skor PHQ-9</p>
            <p className="text-3xl font-black">{score} / {maxScore}</p>
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
              className="flex items-start gap-3 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100"
            >
              <div className="bg-gradient-to-br from-rose-400 to-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                {idx + 1}
              </div>
              <p className="text-slate-700 leading-relaxed">{rec}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Save Status Messages */}
      {(saveStatus === 'requires_login' || saveStatus === 'saved_local_login') && (
        <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800 mb-1">
              {saveStatus === 'saved_local_login' ? '✓ Hasil Tersimpan di Perangkat' : 'Login Diperlukan'}
            </p>
            <p className="text-xs text-amber-700 mb-3">
              {saveStatus === 'saved_local_login' 
                ? 'Hasil sudah tersimpan sementara. Login untuk menyimpan ke akun agar tidak hilang.' 
                : 'Silakan login untuk menyimpan hasil tes kamu secara permanen.'}
            </p>
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
          <p className="text-sm font-bold text-green-800">Hasil tes berhasil disimpan ke akun!</p>
        </div>
      )}

      {saveStatus === 'saved_local' && (
        <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0" />
          <p className="text-sm font-bold text-blue-800">Hasil tes tersimpan di perangkat ini.</p>
        </div>
      )}

      {/* Shareable Result Card */}
      <div className="mb-8">
        <ShareableResult
          testType="PHQ9"
          result={{
            type: severity,
            score: score,
            description: `Depresi ${severity} - ${description.split('.')[0]}.`
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
          className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle size={20} />
          Diskusikan dengan Kai
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-slate-50 rounded-2xl p-6 text-center text-xs text-slate-500 border border-slate-100">
        <p className="font-semibold text-slate-700 mb-2">Catatan Penting:</p>
        <p>
          Hasil ini BUKAN diagnosis medis. PHQ-9 adalah alat screening untuk mengidentifikasi gejala depresi.
          Konsultasikan dengan profesional kesehatan mental untuk diagnosis dan pengobatan yang tepat.
          Jika dalam keadaan darurat, segera hubungi layanan gawat darurat atau hotline di atas.
        </p>
      </div>
    </div>
  );
}

export default PHQ9View;
