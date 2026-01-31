
// --- LOVE LANGUAGES VIEW ---
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, CheckCircle2, MessageCircle } from 'lucide-react';
import { LOVELANGUAGES_QUIZ, LOVELANGUAGES_RESULTS } from './love_languages_data';
import ShareableResult from './ShareableResult';

function LoveLanguagesView({ onBack, onChat }) {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);

  // Email collection state
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle'); // idle, loading, success, error
  const [showEmailInput, setShowEmailInput] = useState(false);

  const totalQuestions = LOVELANGUAGES_QUIZ.questions.length;
  const currentQuestion = LOVELANGUAGES_QUIZ.questions[currentIndex];

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
    const typeScores = { Words: 0, Acts: 0, Gifts: 0, Quality: 0, Touch: 0 };
    LOVELANGUAGES_QUIZ.questions.forEach((q) => {
      const choice = finalAnswers[q.id];
      if (choice === "A") typeScores[q.typeA]++;
      if (choice === "B") typeScores[q.typeB]++;
    });

    const sortedTypes = Object.keys(typeScores).sort((a, b) => typeScores[b] - typeScores[a]);
    const topType = sortedTypes[0];
    const info = LOVELANGUAGES_RESULTS[topType];

    const resultData = {
      title: info.title,
      desc: info.desc,
      advice: "Tips: Jelaskan bahasa cintamu ke orang terdekat (sahabat, orang tua, keluarga) biar mereka tahu cara bikin kamu bahagia! ❤️",
      color: info.color || "bg-pink-50 border-pink-200 text-pink-900",
      type: topType,
      scores: typeScores,
      emoji: info.emoji || "❤️"
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
      const typeInfo = LOVELANGUAGES_RESULTS[result.type];

      const response = await fetch('/api/send-love-languages-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          loveLanguage: result.type,
          title: result.title,
          description: result.desc,
          emoji: result.emoji,
          scores: result.scores,
          whatYouNeed: typeInfo.whatYouNeed || [],
          whatYouCanDo: typeInfo.whatYouCanDo || [],
          redFlags: typeInfo.redFlags || [],
          perfectMatch: typeInfo.perfectMatch || [],
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
            testType="LoveLanguages"
            result={{
                type: result.title,
                description: result.desc
            }}
            userName="Kamu"
            completedAt={completedAt}
            />
        </div>

        {/* Email Collection Section */}
        <div className="mt-6 bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-100 rounded-2xl p-6">
          {!showEmailInput ? (
            <div className="text-center">
              <div className="text-4xl mb-3">💌</div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Dapatkan Laporan Lengkap via Email</h4>
              <p className="text-sm text-slate-600 mb-4">
                Dapatkan analisis mendalam tentang bahasa cintamu, tips untuk pasangan, dan cara membangun hubungan yang lebih sehat.
              </p>
              <button
                onClick={() => setShowEmailInput(true)}
                className="bg-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-lg"
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
                    <span>💌</span> Masukkan Email Kamu
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-pink-400 focus:outline-none"
                      disabled={emailStatus === 'loading'}
                    />
                    <button
                      onClick={handleSendEmail}
                      disabled={emailStatus === 'loading'}
                      className="bg-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

  const options = [
    { value: 'A', text: currentQuestion.A },
    { value: 'B', text: currentQuestion.B }
  ];

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
             {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                    answers[currentQuestion.id] === opt.value
                      ? 'border-violet-500 bg-violet-50 text-violet-900 font-bold'
                      : 'border-slate-100 hover:border-violet-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-medium">{opt.text}</span>
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

export default LoveLanguagesView;
