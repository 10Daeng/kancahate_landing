
// --- MULTIPLE INTELLIGENCE (MI) VIEW ---
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, CheckCircle2, MessageCircle } from 'lucide-react';
import { MI_QUIZ, MI_RESULTS } from './mi_data';
import ShareableResult from './ShareableResult';

function MultipleIntelligenceView({ onBack, onChat }) {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);

  // Email collection state
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const totalQuestions = MI_QUIZ.questions.length;
  const currentQuestion = MI_QUIZ.questions[currentIndex];

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
    const typeScores = { LM: 0, VL: 0, VS: 0, BK: 0, M: 0, I: 0, IN: 0, N: 0 };
    MI_QUIZ.questions.forEach((q) => {
        const val = finalAnswers[q.id] || 0;
        if (typeScores[q.type] !== undefined) typeScores[q.type] += parseInt(val);
    });

    const sortedTypes = Object.keys(typeScores).sort((a, b) => typeScores[b] - typeScores[a]);
    const mainType = sortedTypes[0];
    const info = MI_RESULTS[mainType];

    const resultData = {
      title: info.title,
      desc: info.desc,
      advice: `Karir yang cocok: ${info.careers.join(", ")}. Kamu punya bakat alami di sini! 🌟`,
      color: info.color || "bg-indigo-50 border-indigo-200 text-indigo-900",
      type: mainType,
      emoji: info.emoji || "🧠",
      scores: typeScores
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
      const typeInfo = MI_RESULTS[result.type];

      const response = await fetch('/api/send-mi-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          miType: result.type,
          title: result.title,
          description: result.desc,
          emoji: result.emoji,
          scores: result.scores,
          strengths: typeInfo.strengths || [],
          weaknesses: typeInfo.weaknesses || [],
          studyTips: typeInfo.studyTips || [],
          careers: typeInfo.careers || [],
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
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>
        
        <div className={`rounded-[2rem] p-8 md:p-12 border-2 shadow-sm text-center ${result.color} transition-all`}>
          <h2 className="text-3xl md:text-4xl font-black mb-4">{result.title}</h2>
          <p className="text-lg font-medium leading-relaxed mb-8 opacity-90">{result.desc}</p>
          
          <div className="bg-white/60 p-6 rounded-2xl backdrop-blur-sm border border-white/50">
             <h4 className="font-bold text-sm uppercase tracking-widest opacity-60 mb-3">Insight Untukmu</h4>
             <p className="text-slate-800 font-medium">
               {result.advice}
             </p>
          </div>
        </div>

        {/* Shareable Result Card */}
        <div className="mt-8">
            <ShareableResult
            testType="MI"
            result={{
                type: result.title,
                description: result.desc
            }}
            userName="Kamu"
            completedAt={completedAt}
            />
        </div>

        {/* Email Collection Section */}
        <div className="mt-6 bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-100 rounded-2xl p-6">
          {!showEmailInput ? (
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Dapatkan Analisis Lengkap via Email</h4>
              <p className="text-sm text-slate-600 mb-4">
                Dapatkan detail kecerdasanmu, tips belajar, kelemahan, dan rekomendasi karir yang lengkap.
              </p>
              <button
                onClick={() => setShowEmailInput(true)}
                className="bg-violet-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-600 transition-colors shadow-lg"
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
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none"
                      disabled={emailStatus === 'loading'}
                    />
                    <button
                      onClick={handleSendEmail}
                      disabled={emailStatus === 'loading'}
                      className="bg-violet-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
             {MI_QUIZ.optionsStandard.map((opt, idx) => (
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

export default MultipleIntelligenceView;
