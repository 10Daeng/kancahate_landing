'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  MessageCircle, 
  BookOpen,
  AlertCircle,
  ArrowRight,
  Heart,
  Phone,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  Star,
  Zap,
  Users,
} from 'lucide-react';

import { useSearchParams } from 'next/navigation';
import ChatRoomView from './chat/ChatRoomView';
import ChatModal from './chat/ChatModal';
import Header from './shared/Header';
import Footer from './shared/Footer';
import HeroChatMockup from './HeroChatMockup';
import { BigFiveView, MBTIView, PSS10View, GAD7View, RIASECView, PHQ9View, RosenbergView, VARKView, MultipleIntelligenceView, LoveLanguagesView } from './assessments';

// Testimonial Data
const testimonials = [
  { name: "Fatimah R.", role: "Pelajar SMA • Sumenep", text: "Aku sempat ragu buat cerita, tapi Kai bikin aku nyaman. Akhirnya aku bisa keluarin semua yang aku pendam selama ini.", emoji: "🌸", color: "from-violet-500 to-purple-600", reaction: "12.4k ❤️" },
  { name: "Rizky A.", role: "Pelajar SMA • Pamekasan", text: "Tes kepribadiannya seru dan hasilnya akurat banget! Aku jadi lebih paham sama diriku sendiri.", emoji: "⚡", color: "from-emerald-500 to-teal-600", reaction: "8.7k ✨" },
  { name: "Dina S.", role: "Pelajar SMP • Sampang", text: "Waktu aku lagi down banget, Kancah Ate jadi tempat pelarian yang aman. Terima kasih sudah ada!", emoji: "💙", color: "from-pink-500 to-rose-600", reaction: "21k 💜" },
  { name: "Anonim", role: "Pelajar SMA • Bangkalan", text: "Awalnya malu mau curhat, tapi karena anonim jadi lebih bebas. Kai juga nggak judgmental sama sekali.", emoji: "🎭", color: "from-blue-500 to-indigo-600", reaction: "9.2k 🫶" },
  { name: "Fajar M.", role: "Pelajar SMA • Surabaya", text: "Fitur tes karirnya membantu banget! Sekarang aku lebih yakin mau ambil jurusan apa.", emoji: "🚀", color: "from-amber-500 to-orange-600", reaction: "6.1k 🔥" },
  { name: "Aisyah K.", role: "Pelajar SMA • Malang", text: "Kai ngerti banget cara ngomong yang bikin nyaman. Kayak curhat sama temen sendiri.", emoji: "🌙", color: "from-purple-500 to-violet-600", reaction: "15.3k 💬" },
  { name: "Siti N.", role: "Pelajar SMA • Sumenep", text: "Aku suka karena bisa akses kapan aja. Tengah malam juga bisa curhat tanpa ganggu siapa-siapa.", emoji: "🌟", color: "from-teal-500 to-cyan-600", reaction: "11.8k ⭐" },
  { name: "Ahmad F.", role: "Pelajar SMP • Pamekasan", text: "Platform yang keren! Aku jadi punya tempat cerita yang aman tanpa takut dihakimi.", emoji: "💪", color: "from-rose-500 to-pink-600", reaction: "7.4k 💪" },
];

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return [ref, isInView];
}

// Floating emoji decoration
function FloatingEmoji({ emoji, className }) {
  return (
    <motion.span
      className={`absolute text-2xl select-none pointer-events-none ${className}`}
      animate={{
        y: [0, -12, 0],
        rotate: [-5, 5, -5],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2,
      }}
    >
      {emoji}
    </motion.span>
  );
}

// Quick Access Card
function QuickCard({ icon, emoji, label, sub, gradient, href, onClick, delay = 0 }) {
  const [ref, inView] = useScrollReveal();
  const CardTag = href ? 'a' : 'button';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay }}
    >
      <CardTag
        href={href}
        onClick={onClick}
        className="group w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
          e.currentTarget.style.boxShadow = '0 24px 48px rgba(124, 58, 237, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.25)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
        }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3"
          style={{ background: gradient, boxShadow: `0 8px 20px ${gradient.includes('violet') ? 'rgba(124,58,237,0.35)' : gradient.includes('emerald') ? 'rgba(16,185,129,0.35)' : gradient.includes('amber') ? 'rgba(245,158,11,0.35)' : 'rgba(244,63,94,0.35)'}` }}
        >
          {emoji}
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 text-base leading-tight">{label}</h4>
          <p className="text-sm text-slate-500 mt-0.5">{sub}</p>
        </div>
        <ArrowRight size={18} className="text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all shrink-0" />
      </CardTag>
    </motion.div>
  );
}

// Step Card for How It Works
function StepCard({ number, title, desc, color, delay = 0 }) {
  const [ref, inView] = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 280, damping: 22, delay }}
      className="flex flex-col items-center text-center gap-4 group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-16 h-16 rounded-2xl text-white flex items-center justify-center text-2xl font-black shadow-xl"
        style={{ background: color }}
      >
        {number}
      </motion.div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-slate-500 text-sm max-w-[240px] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// Testimonial Card — Social media style
function TestimonialCard({ t, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.08 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(124,58,237,0.08)',
      }}
    >
      {/* Gradient top strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${t.color}`} />
      
      <div className="p-5">
        {/* Emoji + reaction */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{t.emoji}</span>
          <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-full">{t.reaction}</span>
        </div>
        
        <p className="text-slate-700 text-sm leading-relaxed mb-4 font-medium">
          "{t.text}"
        </p>
        
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: `linear-gradient(135deg, ${t.color.includes('violet') ? '#7C3AED, #EC4899' : t.color.includes('emerald') ? '#10B981, #06B6D4' : t.color.includes('pink') ? '#EC4899, #F97316' : '#3B82F6, #6366F1'})` }}
          >
            {t.name[0]}
          </div>
          <div>
            <div className="font-bold text-slate-800 text-xs">{t.name}</div>
            <div className="text-xs text-slate-400">{t.role}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Testimonial Section
function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ref, inView] = useScrollReveal();

  const getItemsPerSlide = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }
    return 3;
  };

  const itemsPerSlide = getItemsPerSlide();
  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % totalSlides);
    }, 8000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const current = testimonials.slice(currentIndex * itemsPerSlide, currentIndex * itemsPerSlide + itemsPerSlide);

  return (
    <section ref={ref} id="testimonials" className="py-16 md:py-20 relative overflow-hidden z-0">
      {/* Aurora bg */}
      <div className="absolute inset-0 -z-10 aurora-bg" />
      
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-violet-100 text-violet-700 px-4 py-2 rounded-full text-xs font-bold mb-4 shadow-sm">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            Real Stories dari Pengguna
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            Apa Kata Mereka? 💬
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Cerita nyata dari teman-teman remaja yang sudah merasakan manfaatnya.
          </p>
        </motion.div>

        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="wait">
              {current.map((t, i) => (
                <TestimonialCard key={`${currentIndex}-${i}`} t={t} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {/* Nav */}
          <button
            onClick={() => setCurrentIndex(p => (p - 1 + totalSlides) % totalSlides)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-5 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:-translate-y-1/2 hover:-translate-x-5 hover:scale-105"
            style={{ background: 'white', border: '1px solid rgba(168,85,247,0.2)', boxShadow: '0 4px 16px rgba(124,58,237,0.12)' }}
          >
            <ChevronLeft size={18} className="text-violet-600" />
          </button>
          <button
            onClick={() => setCurrentIndex(p => (p + 1) % totalSlides)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-5 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'white', border: '1px solid rgba(168,85,247,0.2)', boxShadow: '0 4px 16px rgba(124,58,237,0.12)' }}
          >
            <ChevronRight size={18} className="text-violet-600" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-7 h-2.5'
                  : 'w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300'
              }`}
              style={i === currentIndex ? { background: 'linear-gradient(90deg, #7C3AED, #EC4899)' } : {}}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// MAIN APP COMPONENT
// ========================================
export default function App() {
  const searchParams = useSearchParams();
  const testParam = searchParams.get('test');
  
  const [currentView, setCurrentView] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    if (testParam) {
      setCurrentView(`test_${testParam}`);
      window.scrollTo(0, 0);
    }
  }, [testParam]);

  const [showChatModal, setShowChatModal] = useState(false);

  const startChat = () => setShowChatModal(true);

  // Assessment views
  if (currentView === 'chat' && selectedCategory) {
    return <ChatRoomView category={selectedCategory} onBack={() => setCurrentView('landing')} setView={setCurrentView} />;
  }
  if (currentView === 'test_phq9') return <FullScreenTest><PHQ9View onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes PHQ-9', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_gad7') return <FullScreenTest><GAD7View onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes GAD-7', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_riasec') return <FullScreenTest><RIASECView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes RIASEC', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_mbti') return <FullScreenTest><MBTIView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes MBTI', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_bigfive') return <FullScreenTest><BigFiveView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes Big Five', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_rosenberg') return <FullScreenTest><RosenbergView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes Harga Diri', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_vark') return <FullScreenTest><VARKView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes Gaya Belajar (VARK)', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_multiple_intelligence') return <FullScreenTest><MultipleIntelligenceView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes Multiple Intelligence', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_love_languages') return <FullScreenTest><LoveLanguagesView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes Bahasa Cinta', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700 overflow-x-hidden">
      <Header actionButtonHandler={startChat} />

      {/* ========== HERO SECTION ========== */}
      <HeroSection onStartChat={startChat} />

      {/* ========== STATS STRIP ========== */}
      <StatsStrip />

      {/* ========== QUICK ACCESS SECTION ========== */}
      <QuickAccessSection onStartChat={startChat} />

      {/* ========== HOW IT WORKS ========== */}
      <HowItWorksSection />

      {/* ========== TESTIMONIALS ========== */}
      <TestimonialSection />

      {/* ========== CTA BANNER ========== */}
      <CTASection onStartChat={startChat} />

      {/* ========== FOOTER ========== */}
      <Footer />

      {/* ========== FLOATING REPORT BUTTON ========== */}
      <motion.a
        href="/laporan-kejadian"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 text-white rounded-full font-bold text-sm"
        style={{
          background: 'linear-gradient(135deg, #F43F5E, #F97316)',
          boxShadow: '0 8px 24px rgba(244, 63, 94, 0.4)',
        }}
      >
        <Shield size={16} />
        <span className="hidden sm:inline">Lapor!</span>
      </motion.a>

      {/* ========== CHAT MODAL ========== */}
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        category={{ id: 'general', title: 'Curhat', icon: '💬', color: 'violet' }}
      />
    </div>
  );
}

// ========================================
// HERO SECTION — Aurora Gradient + Animated
// ========================================
function HeroSection({ onStartChat }) {
  return (
    <section
      id="hero"
      className="relative min-h-[80vh] md:min-h-[85vh] flex items-center overflow-hidden pt-10 pb-8 z-0"
    >
      {/* Aurora background blobs */}
      <div className="absolute inset-0 -z-10" style={{
        background: `
          radial-gradient(ellipse 70% 70% at 15% 25%, rgba(124, 58, 237, 0.22) 0%, transparent 55%),
          radial-gradient(ellipse 60% 60% at 85% 15%, rgba(168, 85, 247, 0.18) 0%, transparent 55%),
          radial-gradient(ellipse 80% 80% at 80% 85%, rgba(236, 72, 153, 0.16) 0%, transparent 55%),
          radial-gradient(ellipse 50% 50% at 5% 90%, rgba(6, 182, 212, 0.12) 0%, transparent 55%),
          #fdfbff
        `
      }} />

      {/* Animated blob shapes */}
      <motion.div
        className="absolute top-10 right-[5%] w-80 h-80 rounded-full -z-10 opacity-30"
        style={{ background: 'linear-gradient(135deg, #A855F7, #EC4899)' }}
        animate={{
          borderRadius: ['60% 40% 30% 70% / 60% 30% 70% 40%', '30% 60% 70% 40% / 50% 60% 30% 60%', '60% 40% 30% 70% / 60% 30% 70% 40%'],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-10 left-[10%] w-64 h-64 rounded-full -z-10 opacity-20"
        style={{ background: 'linear-gradient(135deg, #06B6D4, #10B981)' }}
        animate={{
          borderRadius: ['50% 60% 30% 60% / 30% 60% 70% 40%', '60% 40% 60% 30% / 70% 30% 50% 60%', '50% 60% 30% 60% / 30% 60% 70% 40%'],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Floating emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingEmoji emoji="💬" className="top-[12%] right-[12%] opacity-70" />
        <FloatingEmoji emoji="✨" className="top-[30%] right-[6%] opacity-60" />
        <FloatingEmoji emoji="💜" className="top-[60%] right-[18%] opacity-50" />
        <FloatingEmoji emoji="🌟" className="top-[20%] left-[8%] opacity-40" />
        <FloatingEmoji emoji="🫂" className="bottom-[25%] left-[5%] opacity-50" />
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 md:py-16 w-full flex flex-col lg:flex-row lg:items-center justify-between gap-12 lg:gap-8">
        <div className="max-w-2xl flex-shrink-0 z-10 relative">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-bold text-violet-700"
            style={{
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(168,85,247,0.25)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.1)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            🌏 Untuk Remaja Indonesia
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6"
          >
            Kamu Nggak Harus
            <br />
            <span className="relative">
              <span className="gradient-text">Sendirian.</span>
            </span>
            {' '}💜
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.2 }}
            className="text-slate-500 text-lg leading-relaxed mb-8 max-w-xl font-medium"
          >
            Ruang aman untuk curhat, kenali dirimu lewat tes psikologi, dan dapetin dukungan sebaya yang nonjudgmental.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStartChat}
              className="btn-primary px-7 py-4 text-base flex items-center gap-2"
            >
              <Sparkles size={18} />
              Curhat Sekarang
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href="#resources"
              className="btn-ghost px-7 py-4 text-base text-slate-700 font-bold flex items-center gap-2"
            >
              Jelajahi Fitur
              <ArrowRight size={16} />
            </motion.a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 mt-8 text-sm text-slate-400 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Gratis 100%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Anonim & Aman
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Tersedia 24/7
            </span>
          </motion.div>
        </div>

        {/* Hero Chat Mockup for Desktop */}
        <div className="hidden lg:block w-full max-w-md z-10 relative">
          <HeroChatMockup />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent -z-10" />
    </section>
  );
}

// ========================================
// STATS STRIP
// ========================================
function StatsStrip() {
  const [ref, inView] = useScrollReveal();
  const stats = [
    { value: '9+', label: 'Tes Psikologi', icon: '🧠' },
    { value: '24/7', label: 'Siap Dengerin', icon: '💬' },
    { value: '100%', label: 'Anonim & Gratis', icon: '🔒' },
    { value: '∞', label: 'Ruang Aman', icon: '💜' },
  ];

  return (
    <section ref={ref} className="py-10 relative overflow-hidden z-0">
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7, #EC4899)', opacity: 0.04 }}
      />
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black gradient-text">{stat.value}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// QUICK ACCESS SECTION
// ========================================
function QuickAccessSection({ onStartChat }) {
  const [ref, inView] = useScrollReveal();

  return (
    <section id="resources" className="py-16 md:py-20 relative overflow-hidden z-0">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(245,243,255,0.9), white)' }}
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 px-4 py-2 rounded-full text-xs font-bold mb-4">
            <Zap size={12} className="fill-violet-600" />
            Akses Cepat
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            Mulai dari Sini 🚀
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Pilih apa yang kamu butuhkan sekarang. Semua gratis, tanpa ribet.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickCard
            emoji="💬"
            label="Mulai Curhat"
            sub="Chat langsung sama Kai, AI teman ceritamu"
            gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
            onClick={onStartChat}
            delay={0}
          />
          <QuickCard
            emoji="🧠"
            label="Tes Psikologi"
            sub="9 tes gratis: MBTI, Big Five, RIASEC & lebih"
            gradient="linear-gradient(135deg, #10B981, #06B6D4)"
            href="/psikotes"
            delay={0.06}
          />
          <QuickCard
            emoji="📖"
            label="Ruang Baca"
            sub="Artikel & tips kesehatan mental dari ahlinya"
            gradient="linear-gradient(135deg, #F59E0B, #F97316)"
            href="/ruang-baca"
            delay={0.12}
          />
          <QuickCard
            emoji="🆘"
            label="Bantuan Krisis"
            sub="Hotline 119 ext 8 — selalu siap 24 jam"
            gradient="linear-gradient(135deg, #F43F5E, #EC4899)"
            href="#crisis"
            delay={0.18}
          />
          <QuickCard
            emoji="🛡️"
            label="Lapor Kekerasan"
            sub="Melapor itu berani. Identitasmu terlindungi."
            gradient="linear-gradient(135deg, #F43F5E, #F97316)"
            href="/laporan-kejadian"
            delay={0.24}
          />
        </div>
      </div>
    </section>
  );
}

// ========================================
// HOW IT WORKS SECTION
// ========================================
function HowItWorksSection() {
  const [ref, inView] = useScrollReveal();

  return (
    <section id="how-it-works" className="py-16 md:py-20 relative overflow-hidden z-0">
      {/* Background */}
      <div className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(124,58,237,0.06) 0%, transparent 70%),
            #f8f5ff
          `
        }}
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-violet-100 text-violet-700 px-4 py-2 rounded-full text-xs font-bold mb-4 shadow-sm">
            <span>💡</span>
            Semudah 1-2-3
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            Cara Kerjanya
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Mulai dalam hitungan detik. Nggak ribet, nggak perlu akun dulu.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5"
            style={{ background: 'linear-gradient(90deg, #7C3AED, #A855F7, #EC4899)', opacity: 0.2 }}
          />

          <StepCard
            number="1"
            title="Anonim atau Daftar"
            desc="Nggak mau kasih data? Santai. Chat langsung tanpa akun, identitasmu aman."
            color="linear-gradient(135deg, #7C3AED, #A855F7)"
            delay={0}
          />
          <StepCard
            number="2"
            title="Pilih Dukunganmu"
            desc="Mau curhat? Ikut tes kepribadian? Atau baca artikel? Semua ada di sini."
            color="linear-gradient(135deg, #06B6D4, #10B981)"
            delay={0.1}
          />
          <StepCard
            number="3"
            title="Mulai Pulih 💜"
            desc="Rasakan perbedaannya. Didengar, dipahami, dan lebih siap hadapi hari."
            color="linear-gradient(135deg, #EC4899, #F97316)"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}

// ========================================
// CTA SECTION — Aurora gradient berani
// ========================================
function CTASection({ onStartChat }) {
  const [ref, inView] = useScrollReveal();

  return (
    <section className="py-16 md:py-20 px-6 relative overflow-hidden z-0">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 30%, #A855F7 60%, #EC4899 85%, #F97316 100%)',
        }}
      />
      {/* Blob overlay */}
      <div className="absolute inset-0 -z-10 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)' }}
      />
      {/* Floating emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingEmoji emoji="✨" className="top-[10%] left-[5%]" />
        <FloatingEmoji emoji="💜" className="top-[20%] right-[8%]" />
        <FloatingEmoji emoji="🌟" className="bottom-[15%] left-[10%]" />
        <FloatingEmoji emoji="💬" className="bottom-[20%] right-[5%]" />
      </div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          <div className="text-5xl mb-5">🫂</div>
          <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
            Siap mulai perjalananmu?
          </h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed font-medium">
            Ribuan remaja sudah buktiin — kesehatan mental itu bisa dijaga bareng-bareng. Yuk, mulai!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStartChat}
              className="px-8 py-4 rounded-2xl font-bold text-lg text-violet-700 bg-white hover:bg-violet-50 transition-all flex items-center gap-2 justify-center"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            >
              <Sparkles size={20} />
              Curhat Gratis Sekarang
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.03 }}
              href="/psikotes"
              className="px-8 py-4 rounded-2xl font-bold text-base text-white flex items-center gap-2 justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              Coba Tes Psikologi ✨
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Full Screen Test Wrapper
function FullScreenTest({ children }) {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {children}
    </div>
  );
}
