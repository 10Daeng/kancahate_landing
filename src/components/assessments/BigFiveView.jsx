// --- BIG FIVE TEST COMPONENT (SHORT VERSION - 30 QUESTIONS) ---
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, CheckCircle2, MessageCircle, LogIn, AlertCircle } from 'lucide-react';
import { bigFiveShortQuestions, bigFiveShortChoices, calculateBigFiveShortResults, BIG_FIVE_TYPES, getBigFiveDescription } from '../../data/bf_short_data';
import { saveAssessmentResult, checkAuthStatus } from '../../services/assessmentService';
import ShareableResult from './ShareableResult';
import GateOverlay from './GateOverlay';

/**
 * BigFiveView - Komponen tes kepribadian Big Five (OCEAN)
 * @param {function} onBack - Callback untuk kembali ke halaman sebelumnya
 * @param {function} onChat - Callback untuk memulai chat dengan hasil tes
 */
function BigFiveView({ onBack, onChat }) {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Email collection state
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle');
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    checkAuthStatus().then(({ isLoggedIn }) => {
      setIsLoggedIn(isLoggedIn);
    });
  }, []);

  const totalQuestions = bigFiveShortQuestions.length;
  const currentQuestion = bigFiveShortQuestions[currentIndex];

  const handleAnswer = (qId, value) => {
    // 1. Update Answer
    const newAnswers = { ...answers, [qId]: value };
    setAnswers(newAnswers);

    // 2. Auto-advance (Delay for visual feedback)
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Finish - Calculate results
        const res = calculateBigFiveShortResults(newAnswers);
        setResults(res);
        setCompletedAt(new Date().toISOString());
        setShowResult(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // ENHANCEMENT: Save result (requires login)
        saveAssessmentResult('bigfive', res).then(saved => {
          if (saved.success) {
            console.log('Big Five result saved:', saved.data);
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
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      setEmailStatus('error');
      return;
    }

    setEmailStatus('loading');

    try {
      // Prepare detailed results for each domain
      const domainDetails = {};
      Object.keys(results.scores).forEach(domain => {
        const typeInfo = BIG_FIVE_TYPES[domain];
        const desc = getBigFiveDescription(domain, results.scores[domain]);
        domainDetails[domain] = {
          name: typeInfo.name,
          emoji: typeInfo.emoji,
          score: results.scores[domain],
          level: results.levels[domain],
          title: desc.title,
          description: desc.desc,
          strengths: desc.strengths || [],
          careers: desc.careers || [],
          advice: desc.advice || ''
        };
      });

      const response = await fetch('/api/send-bigfive-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          scores: results.scores,
          levels: results.levels,
          domainDetails
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

  if (showResult && results) {
    const isGated = !isLoggedIn;
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>
        {isGated ? (
          <GateOverlay
            testName="Big Five"
            preview={{ title: 'Profil Big Five Kamu', subtitle: '5 dimensi kepribadian' }}
          />
        ) : (
          <>
            <div className="mb-8">
              <ShareableResult
                testType="BigFive"
                result={{
                  dominant: Object.entries(results.scores).sort((a, b) => b[1] - a[1])[0][0],
                  description: `Dominan: ${BIG_FIVE_TYPES[Object.entries(results.scores).sort((a, b) => b[1] - a[1])[0][0]].name}`
                }}
                userName="Kamu"
                completedAt={completedAt}
              />
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-slate-900">Analisis Dimensi Kepribadian</h3>
            </div>
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(results.scores).map(([domain, score]) => {
            const typeInfo = BIG_FIVE_TYPES[domain];
            const levelInfo = getBigFiveDescription(domain, score);
            const scoreNum = parseFloat(score);
            const barColor = scoreNum >= 4.0 ? typeInfo.hexColor : scoreNum < 3.0 ? '#94a3b8' : typeInfo.hexColor;

            return (
              <div key={domain} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{typeInfo.emoji}</span>
                    <h3 className="font-bold text-lg text-slate-800">{typeInfo.name}</h3>
                  </div>
                  <span className="font-bold" style={{ color: barColor }}>{score}</span>
                </div>
                <p className="text-sm text-slate-500 mb-3">{typeInfo.desc}</p>
                <div className="bg-slate-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-bold text-slate-400 mb-1">{levelInfo.title}</p>
                  <p className="text-sm text-slate-700">{levelInfo.desc}</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(scoreNum / 5) * 100}%`, backgroundColor: barColor }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

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
            <p className="text-sm font-bold text-green-800">Hasil tes berhasil disimpan!</p>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm font-bold text-red-800">Gagal menyimpan hasil tes. Hasil tetap ditampilkan di bawah.</p>
          </div>
        )}



        {/* Email Collection Section */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-6">
          {!showEmailInput ? (
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Dapatkan Analisis Lengkap via Email</h4>
              <p className="text-sm text-slate-600 mb-4">
                Dapatkan analisis mendalam 5 dimensi kepribadianmu, strengths, weaknesses, dan rekomendasi karir.
              </p>
              <button
                onClick={() => setShowEmailInput(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg"
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
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none"
                      disabled={emailStatus === 'loading'}
                    />
                    <button
                      onClick={handleSendEmail}
                      disabled={emailStatus === 'loading'}
                      className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

        <div className="mt-12 flex justify-center gap-4 flex-wrap">
            <button
            onClick={onBack}
            className="bg-white border-2 border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-bold hover:border-orange-200 hover:text-orange-500 transition-colors"
          >
            Selesai
          </button>
            <button
            onClick={() => onChat(results)}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 flex items-center gap-2"
          >
            <MessageCircle size={18} />
            Diskusikan Hasil dengan Kai
          </button>
        </div>
        </>)}

        {isGated && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={onBack}
              className="bg-white border-2 border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-bold hover:border-orange-200 hover:text-orange-500 transition-colors"
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12 min-h-[80vh] flex flex-col justify-center">
      {/* Progress Bar & Header */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <button onClick={onBack} className="text-slate-400 hover:text-orange-500"><X size={24}/></button>
          <div className="text-xs font-bold text-slate-400 tracking-widest">
            PERTANYAAN {currentIndex + 1} / {totalQuestions}
          </div>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
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
          className="flex-1"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {bigFiveShortChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => handleAnswer(currentQuestion.id, choice.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                  answers[currentQuestion.id] === choice.value
                  ? 'border-orange-500 bg-orange-50 text-orange-900'
                  : 'border-slate-100 bg-white text-slate-600 hover:border-orange-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${
                        answers[currentQuestion.id] === choice.value ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-400 border-slate-200 group-hover:border-orange-300'
                    }`}>
                        {choice.value}
                    </div>
                    <span className="font-medium">{choice.text}</span>
                </div>
                {answers[currentQuestion.id] === choice.value && <CheckCircle2 size={20} className="text-orange-500" />}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Nav */}
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

export default BigFiveView;
