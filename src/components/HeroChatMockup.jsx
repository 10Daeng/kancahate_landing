'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroChatMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence timing
    const timers = [
      setTimeout(() => setStep(1), 800),    // User message appears
      setTimeout(() => setStep(2), 2000),   // Kai typing appears
      setTimeout(() => setStep(3), 4500),   // Kai message replaces typing
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto perspective-1000">
      {/* Decorative background glow behind the mockup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-300/30 rounded-full blur-[60px] -z-10" />

      <div className="flex flex-col gap-4 relative z-10" style={{ transform: 'rotateY(-5deg) rotateX(2deg)' }}>
        
        {/* User Message */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="self-end max-w-[85%]"
            >
              <div className="bg-white text-slate-800 px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-xl shadow-slate-200/50 border border-white font-medium text-[15px] leading-relaxed">
                Hari ini rasanya capek banget, pengen nyerah aja... 😔
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kai Typing Indicator */}
        <AnimatePresence>
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="self-start max-w-[85%] flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shrink-0">
                <span className="text-white text-xs font-bold">K</span>
              </div>
              <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl rounded-tl-sm shadow-xl shadow-slate-200/50 border border-white/50 flex gap-1.5 items-center h-11">
                <motion.div
                  className="w-2 h-2 bg-violet-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-violet-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                />
                <motion.div
                  className="w-2 h-2 bg-violet-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kai Message */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="self-start max-w-[90%] flex items-end gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shrink-0 mb-1">
                <span className="text-white text-xs font-bold">K</span>
              </div>
              <div className="bg-gradient-to-br from-violet-600 to-pink-500 text-white px-5 py-4 rounded-2xl rounded-bl-sm shadow-xl shadow-violet-500/20 border border-violet-400/30 text-[15px] leading-relaxed">
                Nggak apa-apa istirahat dulu ya. Kamu udah bertahan sejauh ini dan itu keren banget. Kapan pun kamu siap cerita, aku di sini dengerin kamu 💜
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
