// --- GROUNDING TECHNIQUE CARD (5-4-3-2-1) ---
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Ear, Hand, Smile, Play, RotateCcw } from 'lucide-react';

/**
 * GroundingCard - Widget teknik grounding 5-4-3-2-1 untuk mengurangi anxiety
 * @param {function} onComplete - Callback ketika teknik selesai
 */
function GroundingCard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({ sight: [], sound: [], touch: [], smell: [], taste: [] });
  const [currentInput, setCurrentInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  const steps = [
    {
      id: 'sight',
      number: 5,
      sense: 'yang kamu LIHAT',
      icon: <Eye size={28} />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      prompt: 'Sebutkan 5 hal yang bisa kamu lihat di sekitarmu sekarang:',
      example: 'Lampu, meja, jendela, pohon, buku'
    },
    {
      id: 'sound',
      number: 4,
      sense: 'yang kamu DENGAR',
      icon: <Ear size={28} />,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      prompt: 'Sebutkan 4 hal yang bisa kamu dengar sekarang:',
      example: 'Suara AC, burung, mobil, keyboard'
    },
    {
      id: 'touch',
      number: 3,
      sense: 'yang kamu RASAKAN',
      icon: <Hand size={28} />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      prompt: 'Sebutkan 3 hal yang bisa kamu rasakan dengan sentuhan:',
      example: 'Kursi yang keras, pakaian yang halus, udara sejuk'
    },
    {
      id: 'smell',
      number: 2,
      sense: 'yang kamu Cium',
      icon: <span className="text-2xl">👃</span>,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      prompt: 'Sebutkan 2 hal yang bisa kamu cium:',
      example: 'Aroma kopi, sabun'
    },
    {
      id: 'taste',
      number: 1,
      sense: 'yang kamu RASAKAN di mulut',
      icon: <Smile size={28} />,
      color: 'bg-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      prompt: 'Sebutkan 1 hal yang bisa kamu rasakan di mulut:',
      example: 'Rasa manis dari permen'
    }
  ];

  const currentStepData = steps[currentStep];
  const currentAnswers = answers[currentStepData.id];

  const handleAddItem = () => {
    if (currentInput.trim() && currentAnswers.length < currentStepData.number) {
      setAnswers({
        ...answers,
        [currentStepData.id]: [...currentAnswers, currentInput.trim()]
      });
      setCurrentInput('');
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentInput('');
    } else {
      // Complete
      onComplete({
        answers,
        completedAt: new Date().toISOString()
      });
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({ sight: [], sound: [], touch: [], smell: [], taste: [] });
    setCurrentInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  if (!isStarted) {
    return (
      <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-8 text-center text-white shadow-xl">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Play size={40} />
        </div>
        <h3 className="text-2xl font-bold mb-3">Teknik Grounding 5-4-3-2-1</h3>
        <p className="text-white/90 mb-6 leading-relaxed">
          Teknik ini bisa membantu kamu menenangkan diri saat merasa cemas atau overwhelmed.
          Kamu akan fokus pada 5 indera kamu satu per satu.
        </p>
        <div className="bg-white/10 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-medium mb-2">Cara kerja:</p>
          <ul className="text-sm space-y-1 text-white/90">
            <li>• Sebutkan 5 hal yang kamu lihat</li>
            <li>• Sebutkan 4 hal yang kamu dengar</li>
            <li>• Sebutkan 3 hal yang kamu rasakan</li>
            <li>• Sebutkan 2 hal yang kamu cium</li>
            <li>• Sebutkan 1 hal yang kamu rasakan di mulut</li>
          </ul>
        </div>
        <button
          onClick={() => setIsStarted(true)}
          className="w-full bg-white text-teal-600 font-bold py-4 rounded-xl hover:bg-teal-50 transition-all shadow-lg"
        >
          Mulai Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      {/* Header Progress */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-bold text-lg">Teknik Grounding</span>
          <button
            onClick={handleReset}
            className="text-white/80 hover:text-white flex items-center gap-1 text-sm"
          >
            <RotateCcw size={16} /> Ulangi
          </button>
        </div>
        <div className="flex gap-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full transition-all ${
                index < currentStep ? 'bg-white' :
                index === currentStep ? 'bg-white' :
                'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6"
        >
          {/* Icon & Number */}
          <div className="flex items-center justify-center mb-6">
            <div className={`${currentStepData.color} w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg`}>
              {currentStepData.icon}
            </div>
          </div>

          {/* Step Title */}
          <div className="text-center mb-6">
            <div className={`inline-block ${currentStepData.bgColor} ${currentStepData.borderColor} border-2 px-4 py-2 rounded-full mb-3`}>
              <span className="text-2xl font-black">{currentStepData.number}</span>
              <span className="text-sm font-medium ml-1">{currentStepData.sense}</span>
            </div>
            <p className="text-slate-600 text-sm">{currentStepData.prompt}</p>
            {currentAnswers.length < currentStepData.number && (
              <p className="text-xs text-slate-400 mt-1">
                Contoh: {currentStepData.example}
              </p>
            )}
          </div>

          {/* Answers List */}
          {currentAnswers.length > 0 && (
            <div className="mb-4 space-y-2">
              {currentAnswers.map((answer, index) => (
                <div
                  key={index}
                  className={`${currentStepData.bgColor} ${currentStepData.borderColor} border rounded-lg px-4 py-2 text-sm text-slate-700`}
                >
                  <span className="font-semibold mr-2">{index + 1}.</span>
                  {answer}
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          {currentAnswers.length < currentStepData.number ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Hal ke-${currentAnswers.length + 1}...`}
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
              />
              <button
                onClick={handleAddItem}
                disabled={!currentInput.trim()}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  currentInput.trim()
                    ? `${currentStepData.color} text-white shadow-lg hover:shadow-xl`
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Tambah
              </button>
            </div>
          ) : (
            <div className={`${currentStepData.bgColor} border-l-4 ${currentStepData.borderColor} p-4 rounded-lg mb-4`}>
              <p className="text-sm font-semibold text-slate-700">
                Hebat! Kamu sudah menemukan {currentStepData.number} hal. ✨
              </p>
            </div>
          )}

          {/* Navigation */}
          <button
            onClick={handleNext}
            disabled={currentAnswers.length < currentStepData.number}
            className={`w-full mt-4 py-3 rounded-xl font-bold transition-all ${
              currentAnswers.length >= currentStepData.number
                ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {currentStep < steps.length - 1 ? 'Lanjut' : 'Selesai'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default GroundingCard;
