import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Moon, Sun } from 'lucide-react';

const CalmRoom = ({ onClose }) => {
  // 'universal' atau 'spiritual'
  const [mode, setMode] = useState('universal');
  const [breathingPhase, setBreathingPhase] = useState('tarik'); // tarik, tahan, hembus, tahan_kosong
  const [secondsLeft, setSecondsLeft] = useState(4);

  // Afirmasi teks bergantian setiap 15 detik
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  const affirmations = {
    universal: [
      "Tidak apa-apa jika saat ini semuanya terasa runtuh.",
      "Kamu tidak dituntut untuk menjadi kuat setiap saat.",
      "Di detik ini, di ruangan ini, kamu aman.",
      "Napasmu adalah bukti bahwa kamu masih di sini, bertahan.",
      "Lepaskan sejenak kendalimu, alam semesta sedang mendekapmu dalam keheningan ini.",
      "Hari ini sudah cukup. Kamu sudah melakukan yang terbaik."
    ],
    spiritual: [
      "Saat ini hatimu mungkin sedang sangat lelah. Tidak apa-apa.",
      "Lepaskan sejenak kendalimu, dan sandarkan lelahmu pada Yang Maha Menggenggam Hati.",
      "Sesungguhnya bersama kesulitan ada kemudahan.",
      "Janganlah kamu bersedih, sesungguhnya Allah bersama kita.",
      "Tarik napas, sebut nama-Nya. Hembuskan, lepaskan bebanmu.",
      "Tidak ada daun yang jatuh tanpa seizin-Nya. Kamu dijaga."
    ]
  };

  // Box Breathing Logic (4-4-4-4)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setBreathingPhase((phase) => {
            if (phase === 'tarik') return 'tahan';
            if (phase === 'tahan') return 'hembus';
            if (phase === 'hembus') return 'tahan_kosong';
            return 'tarik';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Ganti Afirmasi setiap 10 detik
  useEffect(() => {
    const affirmationTimer = setInterval(() => {
      setAffirmationIndex((prev) => (prev + 1) % affirmations[mode].length);
    }, 10000);
    return () => clearInterval(affirmationTimer);
  }, [mode, affirmations]);

  const toggleMode = () => {
    setMode(prev => prev === 'universal' ? 'spiritual' : 'universal');
    setAffirmationIndex(0);
  };

  // Animasi Circle
  const getCircleScale = () => {
    if (breathingPhase === 'tarik') return 1.5; // Membesar
    if (breathingPhase === 'hembus') return 1; // Mengecil
    // Kalau tahan, biarkan ukurannya tetap di posisi terakhir (besar atau kecil)
    if (breathingPhase === 'tahan') return 1.5;
    if (breathingPhase === 'tahan_kosong') return 1;
    return 1;
  };

  const getPhaseText = () => {
    if (breathingPhase === 'tarik') return "Tarik Napas...";
    if (breathingPhase === 'hembus') return "Hembuskan Perlahan...";
    if (breathingPhase === 'tahan') return "Tahan...";
    if (breathingPhase === 'tahan_kosong') return "Tahan...";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900 flex flex-col"
    >
      {/* Header Minimalis */}
      <div className="flex justify-between items-center p-6">
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Toggle Mode */}
        <div className="flex bg-slate-800 rounded-full p-1 border border-slate-700 shadow-inner">
          <button
            onClick={() => setMode('universal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              mode === 'universal' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Sun size={14} /> Universal
          </button>
          <button
            onClick={() => setMode('spiritual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              mode === 'spiritual' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Moon size={14} /> Spiritual
          </button>
        </div>
        
        {/* Placeholder for symmetry */}
        <div className="w-10"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Breathing Animation */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-16">
          <motion.div
            animate={{ scale: getCircleScale() }}
            transition={{ duration: 4, ease: "linear" }}
            className={`absolute w-32 h-32 rounded-full opacity-20 ${
              mode === 'universal' ? 'bg-cyan-400' : 'bg-emerald-400'
            }`}
          />
          <motion.div
            animate={{ scale: getCircleScale() }}
            transition={{ duration: 4, ease: "linear" }}
            className={`absolute w-24 h-24 rounded-full opacity-40 blur-sm ${
              mode === 'universal' ? 'bg-cyan-500' : 'bg-emerald-500'
            }`}
          />
          <div className="z-10 text-center">
            <h2 className="text-white text-xl font-medium tracking-wide mb-2">
              {getPhaseText()}
            </h2>
            <p className="text-slate-400 text-sm font-mono">{secondsLeft}</p>
          </div>
        </div>

        {/* Afirmasi */}
        <div className="h-24 px-4 max-w-md mx-auto text-center flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={affirmationIndex + mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1 }}
              className="text-slate-300 text-lg leading-relaxed font-medium"
            >
              {affirmations[mode][affirmationIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
};

export default CalmRoom;
