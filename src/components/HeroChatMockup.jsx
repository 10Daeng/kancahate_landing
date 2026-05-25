'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroChatMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let timers = [];
    let loopTimer;

    const runSequence = () => {
      setStep(0); // Reset animation
      timers.forEach(clearTimeout);
      
      timers = [
        setTimeout(() => setStep(1), 500),    // User message 1
        setTimeout(() => setStep(2), 1500),   // Kai typing 1
        setTimeout(() => setStep(3), 3500),   // Kai message 1
        setTimeout(() => setStep(4), 5000),   // User message 2
        setTimeout(() => setStep(5), 6500),   // Kai typing 2
        setTimeout(() => setStep(6), 9000),   // Kai message 2
      ];
    };

    runSequence();
    
    // Loop the sequence every 14 seconds
    loopTimer = setInterval(() => {
      runSequence();
    }, 14000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loopTimer);
    };
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto perspective-1000">
      {/* Decorative background glow behind the mockup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-300/30 rounded-full blur-[60px] -z-10" />

      {/* Continuous floating container */}
      <motion.div 
        className="flex flex-col gap-4 relative z-10" 
        animate={{ 
          y: [0, -15, 0],
          rotateY: [-5, -1, -5],
          rotateX: [2, 4, 2]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        
        {/* User Message 1 */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="self-end max-w-[85%]"
            >
              <div className="p-4 rounded-2xl shadow-sm text-sm whitespace-pre-line leading-relaxed relative bg-violet-600 text-white rounded-br-none">
                <span className="text-[10px] font-bold block mb-1 opacity-50 uppercase">User</span>
                Hari ini rasanya capek banget, tugas sekolah numpuk terus... 😔
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kai Typing Indicator 1 */}
        <AnimatePresence>
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="self-start max-w-[85%]"
            >
              <div className="p-4 rounded-2xl shadow-sm text-sm whitespace-pre-line leading-relaxed relative bg-white text-slate-700 rounded-bl-none border border-slate-100">
                <span className="text-[10px] font-bold block mb-1 opacity-50 uppercase">Kai</span>
                <div className="flex gap-1.5 items-center h-5">
                  <motion.div className="w-2 h-2 bg-slate-300 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-2 h-2 bg-slate-300 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                  <motion.div className="w-2 h-2 bg-slate-300 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kai Message 1 */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="self-start max-w-[85%]"
            >
              <div className="p-4 rounded-2xl shadow-sm text-sm whitespace-pre-line leading-relaxed relative bg-white text-slate-700 rounded-bl-none border border-slate-100">
                <span className="text-[10px] font-bold block mb-1 opacity-50 uppercase">Kai</span>
                Wajar banget kok merasa capek kalau tugas lagi numpuk. Udah sempat istirahat atau makan belum nih?
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Message 2 */}
        <AnimatePresence>
          {step >= 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="self-end max-w-[85%]"
            >
              <div className="p-4 rounded-2xl shadow-sm text-sm whitespace-pre-line leading-relaxed relative bg-violet-600 text-white rounded-br-none">
                <span className="text-[10px] font-bold block mb-1 opacity-50 uppercase">User</span>
                Belum, rasanya ngerasa bersalah kalau mau istirahat...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kai Typing Indicator 2 */}
        <AnimatePresence>
          {step === 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="self-start max-w-[85%]"
            >
              <div className="p-4 rounded-2xl shadow-sm text-sm whitespace-pre-line leading-relaxed relative bg-white text-slate-700 rounded-bl-none border border-slate-100">
                <span className="text-[10px] font-bold block mb-1 opacity-50 uppercase">Kai</span>
                <div className="flex gap-1.5 items-center h-5">
                  <motion.div className="w-2 h-2 bg-slate-300 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-2 h-2 bg-slate-300 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                  <motion.div className="w-2 h-2 bg-slate-300 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kai Message 2 */}
        <AnimatePresence>
          {step >= 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="self-start max-w-[85%]"
            >
              <div className="p-4 rounded-2xl shadow-sm text-sm whitespace-pre-line leading-relaxed relative bg-white text-slate-700 rounded-bl-none border border-slate-100">
                <span className="text-[10px] font-bold block mb-1 opacity-50 uppercase">Kai</span>
                Hei, istirahat itu bukan dosa lho. Kadang kita butuh jeda biar otak segar lagi. Mau tarik napas pelan-pelan bareng aku? 💜
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
