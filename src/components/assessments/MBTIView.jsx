// --- MBTI TEST COMPONENT ---
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, CheckCircle2, MessageCircle, LogIn, AlertCircle } from 'lucide-react';
import { mbtiQuestions, calculateMBTIResults, MBTI_TYPES } from '../../data/mbti_data';
import { saveAssessmentResult, checkAuthStatus } from '../../services/assessmentService';
import ShareableResult from './ShareableResult';
import GateOverlay from './GateOverlay';


/**
 * MBTIView - Komponen tes kepribadian MBTI
 * @param {function} onBack - Callback untuk kembali ke halaman sebelumnya
 * @param {function} onChat - Callback untuk memulai chat dengan hasil tes
 */
function MBTIView({ onBack, onChat }) {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Email collection state
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle'); // idle, loading, success, error
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    checkAuthStatus().then(({ isLoggedIn }) => {
      setIsLoggedIn(isLoggedIn);
    });
  }, []);

  const totalQuestions = mbtiQuestions.length;
  const currentQuestion = mbtiQuestions[currentIndex];

  const handleAnswer = (qId, value) => {
    const newAnswers = { ...answers, [qId]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        const res = calculateMBTIResults(newAnswers);
        setResult(res);
        setCompletedAt(new Date().toISOString()); // Simpan waktu selesai tes
        setShowResult(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // ENHANCEMENT: Save result (requires login)
        saveAssessmentResult('mbti', res).then(saved => {
          if (saved.success) {
            console.log('MBTI result saved:', saved.data);
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
      const response = await fetch('/api/send-mbti-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          mbtiType: result.type,
          typeName: typeInfo.name,
          description: typeInfo.desc,
          traits: typeInfo.traits,
          scores: result.scores,
          strengths: typeInfo.strengths || [],
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
    const typeInfo = MBTI_TYPES[result.type];
    const isGated = !isLoggedIn;
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>

        {/* Preview tipe — selalu ditampilkan */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl overflow-hidden relative mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/3 text-center">
              <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-rose-500 mb-2">
                {result.type}
              </div>
              <div className="text-xl font-bold text-slate-800 tracking-widest uppercase mb-2">{typeInfo.name}</div>
              {/* Traits hanya tampil jika sudah login */}
              {!isGated && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {typeInfo.traits.map(t => (
                    <span key={t} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Detail — di-gate jika belum login */}
            {isGated ? (
              <div className="md:w-2/3 w-full">
                <GateOverlay
                  testName="MBTI"
                  preview={{ title: result.type, subtitle: typeInfo.name }}
                />
              </div>
            ) : (
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Si {typeInfo.name}</h3>
                <p className="text-slate-600 leading-relaxed text-lg mb-6">{typeInfo.desc}</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="w-8 font-bold text-slate-400">E</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400" style={{ width: `${(result.scores.E + result.scores.I) > 0 ? (result.scores.E / (result.scores.E + result.scores.I)) * 100 : 50}%` }}></div>
                    </div>
                    <span className="w-8 font-bold text-slate-400 text-right">I</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="w-8 font-bold text-slate-400">S</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${(result.scores.S + result.scores.N) > 0 ? (result.scores.S / (result.scores.S + result.scores.N)) * 100 : 50}%` }}></div>
                    </div>
                    <span className="w-8 font-bold text-slate-400 text-right">N</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="w-8 font-bold text-slate-400">T</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400" style={{ width: `${(result.scores.T + result.scores.F) > 0 ? (result.scores.T / (result.scores.T + result.scores.F)) * 100 : 50}%` }}></div>
                    </div>
                    <span className="w-8 font-bold text-slate-400 text-right">F</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="w-8 font-bold text-slate-400">J</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400" style={{ width: `${(result.scores.J + result.scores.P) > 0 ? (result.scores.J / (result.scores.J + result.scores.P)) * 100 : 50}%` }}></div>
                    </div>
                    <span className="w-8 font-bold text-slate-400 text-right">P</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save success / error banner — hanya tampil jika sudah login */}
          {!isGated && saveStatus === 'success' && (
            <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
              <p className="text-sm font-bold text-green-800">Hasil tes berhasil disimpan!</p>
            </div>
          )}
          {!isGated && saveStatus === 'error' && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-sm font-bold text-red-800">Gagal menyimpan hasil tes.</p>
            </div>
          )}

          {/* Email + ShareableResult — hanya untuk yang sudah login */}
          {!isGated && (
            <>
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-100 rounded-2xl p-6">
                {!showEmailInput ? (
                  <div className="text-center">
                    <div className="text-4xl mb-3">📧</div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Dapatkan Laporan Lengkap via Email</h4>
                    <p className="text-sm text-slate-600 mb-4">Dapatkan analisis mendalam, kecocokan karir, dan tips pengembangan diri berdasarkan tipe kepribadianmu.</p>
                    <button onClick={() => setShowEmailInput(true)} className="bg-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors shadow-lg">Kirim Laporan ke Email</button>
                  </div>
                ) : (
                  <div>
                    {emailStatus === 'success' ? (
                      <div className="text-center"><div className="text-5xl mb-3">✅</div><h4 className="text-lg font-bold text-green-700 mb-2">Email Terkirim!</h4><p className="text-sm text-slate-600">Cek inbox kamu untuk laporan lengkapnya.</p></div>
                    ) : (
                      <>
                        <h4 className="text-md font-bold text-slate-800 mb-3 flex items-center gap-2"><span>📧</span> Masukkan Email Kamu</h4>
                        <div className="flex gap-2">
                          <input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-400 focus:outline-none" disabled={emailStatus === 'loading'} />
                          <button onClick={handleSendEmail} disabled={emailStatus === 'loading'} className="bg-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2">{emailStatus === 'loading' ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Mengirim...</> : 'Kirim'}</button>
                        </div>
                        {emailStatus === 'error' && <p className="text-red-500 text-sm mt-2">Email tidak valid atau gagal mengirim.</p>}
                        <p className="text-xs text-slate-500 mt-3">🔒 Email kamu aman dan hanya digunakan untuk mengirim laporan.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-8">
                <ShareableResult testType="MBTI" result={{ type: result.type, description: typeInfo.desc }} userName="Kamu" completedAt={completedAt} />
              </div>
            </>
          )}

          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <button onClick={onBack} className="bg-white border-2 border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-bold hover:border-purple-200 hover:text-purple-500 transition-colors">Selesai</button>
            {!isGated && (
              <button onClick={() => onChat(result)} className="bg-purple-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors shadow-lg shadow-purple-200 flex items-center gap-2">
                <MessageCircle size={18} /> Diskusikan Hasil dengan Kai
              </button>
            )}
          </div>
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
            className="h-full bg-purple-500"
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
                className={`w-full p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                  answers[currentQuestion.id] === opt.value
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-slate-100 bg-white text-slate-600 hover:border-purple-200 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium text-lg">{opt.text}</span>
                {answers[currentQuestion.id] === opt.value && <CheckCircle2 size={24} className="text-purple-500" />}
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

export default MBTIView;
