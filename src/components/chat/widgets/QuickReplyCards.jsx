// --- QUICK REPLY CARDS WIDGET ---
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Lightbulb, Coffee, Sparkles, ArrowRight } from 'lucide-react';

/**
 * QuickReplyCards - Widget untuk memberikan opsi balasan cepat
 * @param {Array} replies - Array of reply objects { text, icon, value }
 * @param {function} onSelect - Callback ketika user memilih reply
 * @param {string} title - Judul untuk cards (opsional)
 */
function QuickReplyCards({ replies, onSelect, title = "Pilih respon:" }) {
  const defaultReplies = [
    { text: "Iya, begitu bunyinya", value: "confirmation", icon: <MessageCircle size={20} /> },
    { text: "Lanjut, aku mendengarkan", value: "continue", icon: <Heart size={20} /> },
    { text: "Boleh kasih saran?", value: "advice", icon: <Lightbulb size={20} /> },
    { text: "Aku butuh waktu", value: "pause", icon: <Coffee size={20} /> },
  ];

  const replyOptions = replies.length > 0 ? replies : defaultReplies;

  const iconColors = [
    'bg-blue-100 text-blue-600',
    'bg-rose-100 text-rose-600',
    'bg-amber-100 text-amber-600',
    'bg-emerald-100 text-emerald-600',
    'bg-purple-100 text-purple-600',
    'bg-cyan-100 text-cyan-600',
  ];

  const handleSelect = (reply, index) => {
    onSelect({
      text: reply.text,
      value: reply.value || reply.text,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-3">
      {title && (
        <p className="text-sm font-semibold text-slate-500 mb-2 px-1">{title}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {replyOptions.map((reply, index) => {
          const iconColorClass = iconColors[index % iconColors.length];

          return (
            <motion.button
              key={index}
              onClick={() => handleSelect(reply, index)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50 rounded-xl p-4 text-left transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${iconColorClass} flex items-center justify-center flex-shrink-0`}>
                  {reply.icon || <Sparkles size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{reply.text}</p>
                </div>
                <ArrowRight size={16} className="text-slate-400 flex-shrink-0" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Custom Input Option */}
      <motion.button
        onClick={() => onSelect({ text: "Tulis sendiri...", value: "custom_input", timestamp: new Date().toISOString() })}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full bg-slate-50 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-3 text-slate-500 text-sm font-medium transition-all"
      >
        + Tulis respon sendiri
      </motion.button>
    </div>
  );
}

export default QuickReplyCards;
