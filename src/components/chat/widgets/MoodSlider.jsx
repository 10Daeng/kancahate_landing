// --- MOOD SLIDER WIDGET ---
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Frown, Meh, Smile, Laugh, CloudRain, Sun, Sparkles } from 'lucide-react';

/**
 * MoodSlider - Widget untuk tracking mood dengan slider interaktif
 * @param {function} onMoodSelect - Callback ketika user memilih mood
 * @param {string} question - Pertanyaan yang ditampilkan (opsional)
 */
function MoodSlider({ onMoodSelect, question = "Bagaimana perasaanmu saat ini?" }) {
  const [moodValue, setMoodValue] = useState(5);
  const [isDragging, setIsDragging] = useState(false);

  // Enhanced mood data with better visual mapping
  const moodData = [
    {
      value: 1,
      label: 'Sangat Sedih',
      shortLabel: 'Sedih Banget',
      emoji: '😢',
      color: '#f43f5e',
      bgGradient: 'from-rose-100 to-rose-200',
      textColor: 'text-rose-600',
      icon: <Frown size={28} />,
      dotColor: 'bg-rose-500'
    },
    {
      value: 2,
      label: 'Sedih',
      shortLabel: 'Sedih',
      emoji: '😔',
      color: '#f97316',
      bgGradient: 'from-orange-100 to-orange-200',
      textColor: 'text-orange-600',
      icon: <CloudRain size={28} />,
      dotColor: 'bg-orange-500'
    },
    {
      value: 3,
      label: 'Biasa',
      shortLabel: 'Biasa Aja',
      emoji: '😐',
      color: '#eab308',
      bgGradient: 'from-yellow-100 to-yellow-200',
      textColor: 'text-yellow-600',
      icon: <Meh size={28} />,
      dotColor: 'bg-yellow-500'
    },
    {
      value: 4,
      label: 'Senang',
      shortLabel: 'Senang',
      emoji: '😊',
      color: '#84cc16',
      bgGradient: 'from-lime-100 to-lime-200',
      textColor: 'text-lime-600',
      icon: <Sun size={28} />,
      dotColor: 'bg-lime-500'
    },
    {
      value: 5,
      label: 'Sangat Senang',
      shortLabel: 'Senang Banget',
      emoji: '🤩',
      color: '#22c55e',
      bgGradient: 'from-green-100 to-green-200',
      textColor: 'text-green-600',
      icon: <Sparkles size={28} />,
      dotColor: 'bg-green-500'
    },
  ];

  const currentMood = moodData.find(m => m.value === moodValue) || moodData[2];

  const handleSubmit = () => {
    onMoodSelect({
      value: moodValue,
      label: currentMood.label,
      timestamp: new Date().toISOString()
    });
  };

  // Calculate thumb position percentage for alignment
  const getThumbPosition = () => {
    return ((moodValue - 1) / 4) * 100;
  };

  const thumbPosition = getThumbPosition();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 overflow-hidden">
      {/* Decorative background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentMood.bgGradient} opacity-30 -z-10 transition-all duration-500`} />

      <h3 className="text-lg font-bold text-slate-800 mb-6 text-center relative">{question}</h3>

      {/* Main Mood Display Card */}
      <motion.div
        key={moodValue}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative bg-gradient-to-br ${currentMood.bgGradient} rounded-2xl p-5 mb-6 shadow-lg`}
      >
        <div className="flex items-center justify-center gap-4">
          {/* Emoji */}
          <motion.div
            animate={{ scale: isDragging ? 1.2 : 1, rotate: isDragging ? [0, -10, 10, -10, 0] : 0 }}
            transition={{ duration: 0.3 }}
            className="text-6xl"
          >
            {currentMood.emoji}
          </motion.div>

          {/* Mood Name - Aligned with Visual */}
          <div className="flex flex-col">
            <span className={`text-xl font-black ${currentMood.textColor} leading-tight`}>
              {currentMood.shortLabel}
            </span>
            <span className="text-sm font-semibold text-slate-600">
              {currentMood.label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Custom Slider with Visual Track */}
      <div className="mb-6">
        {/* Mood Labels Above - Aligned with slider positions */}
        <div className="flex justify-between mb-3 px-1">
          {moodData.map((mood) => (
            <div
              key={mood.value}
              className={`flex flex-col items-center transition-all duration-300 ${
                moodValue === mood.value ? 'scale-110' : 'scale-100 opacity-60'
              }`}
              style={{ width: '20%' }}
            >
              {/* Vertical indicator line */}
              <div className={`h-2 w-0.5 rounded-full mb-1 transition-all duration-300 ${
                moodValue === mood.value ? mood.dotColor : 'bg-slate-300'
              }`} />
              {/* Emoji indicator */}
              <span className="text-lg mb-1">{mood.emoji}</span>
            </div>
          ))}
        </div>

        {/* Slider Container */}
        <div className="relative h-12 bg-slate-100 rounded-2xl overflow-hidden">
          {/* Colored track segments */}
          <div className="absolute inset-0 flex">
            {moodData.map((mood, index) => (
              <div
                key={mood.value}
                className="h-full transition-all duration-300"
                style={{
                  width: '20%',
                  backgroundColor: mood.color,
                  opacity: moodValue >= mood.value ? 1 : 0.3
                }}
              />
            ))}
          </div>

          {/* Hidden range input */}
          <input
            type="range"
            min="1"
            max="5"
            value={moodValue}
            onChange={(e) => setMoodValue(parseInt(e.target.value))}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {/* Custom Thumb - Positioned exactly above slider value */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 z-20"
            style={{ left: `${thumbPosition}%` }}
            animate={{ scale: isDragging ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-10 h-10 rounded-full border-4 shadow-lg flex items-center justify-center -translate-x-1/2 transition-all duration-300"
              style={{ backgroundColor: 'white', borderColor: currentMood.color }}
            >
              <span className="text-sm">{currentMood.emoji}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mood Labels Below - Fully aligned with positions */}
      <div className="flex justify-between mb-6 px-1">
        {moodData.map((mood) => (
          <div
            key={mood.value}
            className={`text-center transition-all duration-300 ${
              moodValue === mood.value ? 'font-bold' : 'font-medium'
            }`}
            style={{ width: '20%' }}
          >
            <span className={`text-xs block ${
              moodValue === mood.value ? currentMood.textColor : 'text-slate-500'
            }`}>
              {mood.shortLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <motion.button
        onClick={handleSubmit}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-2xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <span>Kirim Mood</span>
        <span className="text-xl">{currentMood.emoji}</span>
      </motion.button>
    </div>
  );
}

export default MoodSlider;
