'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ChatRoomView from './ChatRoomView';

/**
 * ChatModal - Full-screen modal untuk chat dengan Kai
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Callback untuk close modal
 * @param {object} category - Kategori chat (optional, default general)
 * @param {object} initialData - Data awal (optional, untuk pre-fill dari hasil tes)
 */
export default function ChatModal({ isOpen, onClose, category, initialData }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Default category jika tidak ada
  const defaultCategory = category || {
    id: 'general',
    title: 'Curhat',
    icon: '💬',
    color: 'violet'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              {/* Header with Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 group"
                  aria-label="Close chat"
                >
                  <X size={20} className="text-slate-600 group-hover:text-slate-900" />
                </button>
              </div>

              {/* Chat Room View */}
              <div className="flex-1 overflow-hidden">
                <ChatRoomView
                  category={defaultCategory}
                  onBack={onClose}
                  initialData={initialData}
                  setView={() => {}} // No-op for modal
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
