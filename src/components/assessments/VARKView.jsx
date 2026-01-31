
// --- VARK (VISUAL, AUDITORY, READ/WRITE, KINESTHETIC) VIEW ---
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, CheckCircle2, MessageCircle } from 'lucide-react';
import { VARK_QUIZ, VARK_TYPES } from './vark_data';
import ShareableResult from './ShareableResult';

function VARKView({ onBack, onChat }) {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);

  // Email collection state
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle'); // idle, loading, success, error
  const [showEmailInput, setShowEmailInput] = useState(false);

  const totalQuestions = VARK_QUIZ.questions.length;
  const currentQuestion = VARK_QUIZ.questions[currentIndex];

  const handleAnswer = (qId, value) => {
    const newAnswers = { ...answers, [qId]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        finishQuiz(newAnswers);
      }
    }, 250);
  };

  const finishQuiz = (finalAnswers) => {
    const typeScores = { V: 0, A: 0, R: 0, K: 0 };
    VARK_QUIZ.questions.forEach((q) => {
      const ans = finalAnswers[q.id];
      if (typeScores[ans] !== undefined) typeScores[ans]++;
    });

    const sortedTypes = Object.keys(typeScores).sort((a, b) => typeScores[b] - typeScores[a]);
    const mainType = sortedTypes[0];
    const typeInfo = VARK_TYPES[mainType];

    // Hitung total untuk persentase
    const total = Object.values(typeScores).reduce((sum, val) => sum + val, 0);

    const resultData = {
      title: typeInfo.title,
      fullTitle: typeInfo.fullTitle,
      desc: typeInfo.desc,
      strength: typeInfo.strength,
      tips: typeInfo.tips,
      color: "bg-teal-50 border-teal-200 text-teal-900",
      type: mainType,
      scores: typeScores,
      total: total,
      percentage: Math.round((typeScores[mainType] / total) * 100)
    };

    setResult(resultData);
    setCompletedAt(new Date().toISOString());
    setShowResult(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      setEmailStatus('error');
      return;
    }

    setEmailStatus('loading');

    try {
      const typeInfo = VARK_TYPES[result.type];

      const response = await fetch('/api/send-vark-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          varkType: result.type,
          typeName: result.fullTitle,
          title: result.title,
          description: result.desc,
          strength: result.strength,
          tips: result.tips,
          scores: result.scores,
          studyMethods: typeInfo.studyMethods || [],
          careers: typeInfo.careers || [],
          weaknesses: typeInfo.weaknesses || [],
          advice: typeInfo.advice || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        setEmailStatus('success');
      } else {
        setEmailStatus('error');
      }
    } catch (error) {
      console.error('Email error:', error);
      setEmailStatus('error');
    }
  };

  if (showResult && result) {
    // Color mapping untuk setiap tipe VARK
    const typeColors = {
      V: "bg-blue-50 border-blue-200 text-blue-900",
      A: "bg-amber-50 border-amber-200 text-amber-900",
      R: "bg-emerald-50 border-emerald-200 text-emerald-900",
      K: "bg-rose-50 border-rose-200 text-rose-900"
    };
    const resultColor = typeColors[result.type] || result.color;

    return (
      <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>

        <div className={`rounded-[2rem] p-8 md:p-12 border-2 shadow-sm text-center ${resultColor} transition-all`}>
          <h2 className="text-3xl md:text-4xl font-black mb-2">{result.fullTitle}</h2>
          <p className="text-lg font-medium leading-relaxed mb-6 opacity-90">{result.desc}</p>

          {/* Strength Badge */}
          <div className="bg-white/60 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/50 mb-6">
            <p className="text-sm font-bold opacity-60 mb-1">KEKUATANMU</p>
            <p className="font-semibold">{result.strength}</p>
          </div>

          {/* Tips Section */}
          <div className="bg-white/60 p-6 rounded-2xl backdrop-blur-sm border border-white/50 text-left">
            <h4 className="font-bold text-sm uppercase tracking-widest opacity-60 mb-4 text-center">Tips Belajar Efektif</h4>
            <ul className="space-y-3">
              {result.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                  <span className="font-medium">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Score Breakdown */}
          {result.scores && (
            <div className="mt-6 bg-white/40 p-4 rounded-xl">
              <p className="text-xs font-bold opacity-60 mb-3">SKOR PEMBELAJARAN</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {Object.entries(result.scores).map(([key, value]) => (
                  <div key={key} className="bg-white/60 rounded-lg p-2">
                    <p className="text-xs font-bold opacity-60">{key}</p>
                    <p className="text-lg font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Shareable Result Card */}
        <div className="mt-8">
            <ShareableResult
            testType="VARK"
            result={{
                type: result.title,
                description: result.desc
            }}
            userName="Kamu"
            completedAt={completedAt}
            />
        </div>

        {/* Email Collection Section */}
        <div className="mt-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-100 rounded-2xl p-6">
          {!showEmailInput ? (
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Dapatkan Laporan Lengkap via Email</h4>
              <p className="text-sm text-slate-600 mb-4">
                Dapatkan metode belajar yang cocok, rekomendasi karir, dan tips belajar efektif berdasarkan gaya belajarmu.
              </p>
              <button
                onClick={() => setShowEmailInput(true)}
                className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-lg"
              >
                Kirim Laporan ke Email
              </button>
            </div>
          ) : (
            <div>
              {emailStatus === 'success' ? (
                <div className="text-center">
                  <div className="text-5xl mb-3">✅</div>
                  <h4 className="text-lg font-bold text-green-700 mb-2">Email Terkirim!</h4>
                  <p className="text-sm text-slate-600">Cek inbox kamu untuk laporan lengkapnya.</p>
                </div>
              ) : (
                <>
                  <h4 className="text-md font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span>📧</span> Masukkan Email Kamu
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-400 focus:outline-none"
                      disabled={emailStatus === 'loading'}
                    />
                    <button
                      onClick={handleSendEmail}
                      disabled={emailStatus === 'loading'}
                      className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {emailStatus === 'loading' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Mengirim...
                        </>
                      ) : (
                        'Kirim'
                      )}
                    </button>
                  </div>
                  {emailStatus === 'error' && (
                    <p className="text-red-500 text-sm mt-2">Email tidak valid atau gagal mengirim. Coba lagi.</p>
                  )}
                  <p className="text-xs text-slate-500 mt-3">
                    🔒 Email kamu aman dan hanya digunakan untuk mengirim laporan.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
           <button
            onClick={onBack}
            className="bg-white border-2 border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-bold hover:border-violet-200 hover:text-violet-500 transition-colors"
          >
            Selesai
          </button>
           <button
            onClick={() => onChat(result)}
            className="bg-violet-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-violet-600 transition-colors shadow-lg shadow-violet-200 flex items-center gap-2"
          >
            <MessageCircle size={18} />
            Diskusikan dengan Kai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12 min-h-[80vh] flex flex-col justify-center">
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <button onClick={onBack} className="text-slate-400 hover:text-violet-500 transition-colors"><X size={24}/></button>
          <div className="text-xs font-bold text-slate-400 tracking-widest">
            PERTANYAAN {currentIndex + 1} / {totalQuestions}
          </div>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-violet-500"
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
             {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                    answers[currentQuestion.id] === opt.value
                      ? 'border-violet-500 bg-violet-50 text-violet-900 font-bold'
                      : 'border-slate-100 hover:border-violet-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                  {answers[currentQuestion.id] === opt.value && <CheckCircle2 size={20} className="text-violet-500" />}
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

export default VARKView;
