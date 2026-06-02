// --- GAD-7 TEST COMPONENT ---
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, CheckCircle2, MessageCircle, LogIn, AlertCircle } from 'lucide-react';
import { gad7Questions, calculateGAD7Score } from '../../data/gad7_data';
import { saveAssessmentResult, checkAuthStatus } from '../../services/assessmentService';
import ShareableResult from './ShareableResult';

/**
 * GAD7View - Komponen tes kecemasan GAD-7 (Generalized Anxiety Disorder)
 * @param {function} onBack - Callback untuk kembali ke halaman sebelumnya
 * @param {function} onChat - Callback untuk memulai chat dengan hasil tes
 */
function GAD7View({ onBack, onChat }) {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', 'requires_login'

  useEffect(() => {
    // Check login status when component mounts
    checkAuthStatus().then(({ isLoggedIn }) => {
      setIsLoggedIn(isLoggedIn);
    });
  }, []);

  const totalQuestions = gad7Questions.length;
  const currentQuestion = gad7Questions[currentIndex];

  const handleAnswer = (qId, value) => {
    const newAnswers = { ...answers, [qId]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        const res = calculateGAD7Score(newAnswers);
        setResult(res);
        setCompletedAt(new Date().toISOString()); // Simpan waktu selesai tes
        setShowResult(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Save result (always show result first, save is secondary)
        saveAssessmentResult('gad7', res).then(saved => {
          if (saved.success && !saved.savedLocally) {
            console.log('GAD-7 result saved to database:', saved.data);
            setSaveStatus('success');
          } else if (saved.success && saved.savedLocally) {
            console.log('GAD-7 result saved locally:', saved.data);
            setSaveStatus(saved.requiresLogin ? 'saved_local_login' : 'saved_local');
          } else if (saved.requiresLogin) {
            setSaveStatus('requires_login');
          } else {
            setSaveStatus('saved_local');
          }
        });
      }
    }, 250);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  if (showResult && result) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>
        


        {/* Save Status Message */}
        {saveStatus === 'requires_login' && (
          <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 mb-1">Login Diperlukan</p>
              <p className="text-xs text-amber-700 mb-3">Silakan login untuk menyimpan hasil tes kamu secara permanen.</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-amber-600 transition-colors"
              >
                <LogIn size={16} />
                Login Sekarang
              </button>
            </div>
          </div>
        )}

        {saveStatus === 'success' && (
          <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
            <p className="text-sm font-bold text-green-800">Hasil tes berhasil disimpan ke akun!</p>
          </div>
        )}

        {(saveStatus === 'saved_local' || saveStatus === 'saved_local_login') && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0" />
            <p className="text-sm font-bold text-blue-800">Hasil tes tersimpan di perangkat ini.</p>
          </div>
        )}

        {/* Shareable Result Card */}
        <div className="mt-8">
          <ShareableResult
            testType="GAD7"
            result={{
              score: result.totalScore,
              category: result.category,
              description: result.description
            }}
            userName="Kamu"
            completedAt={completedAt}
          />
        </div>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
           <button
            onClick={onBack}
            className="bg-white border-2 border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-bold hover:border-orange-200 hover:text-orange-500 transition-colors"
          >
            Selesai
          </button>
           <button
            onClick={() => onChat(result)}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 flex items-center gap-2"
          >
            <MessageCircle size={18} />
            Diskusikan Hasil dengan Kai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12 min-h-[80vh] flex flex-col justify-center">
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <button onClick={onBack} className="text-slate-400 hover:text-orange-500"><X size={24}/></button>
          <div className="text-xs font-bold text-slate-400 tracking-widest">
            PERTANYAAN {currentIndex + 1} / {totalQuestions}
          </div>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
             {currentQuestion.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                    answers[currentQuestion.id] === opt.value
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                      : 'border-slate-100 hover:border-teal-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-medium">{opt.text}</span>
                  {answers[currentQuestion.id] === opt.value && <CheckCircle2 size={20} className="text-teal-500" />}
                </button>
              ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 h-10 flex items-center">
         {currentIndex > 0 && (
           <button onClick={handlePrevious} className="text-slate-400 font-bold text-sm hover:text-slate-600 flex items-center gap-1">
             <ArrowLeft size={16} /> Sebelumnya
           </button>
         )}
      </div>
    </div>
  );
}

export default GAD7View;
