'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  BookOpen,
  AlertCircle,
  Menu,
  X,
  ArrowRight,
  Quote,
  Heart,
  Phone,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';

import { useSearchParams } from 'next/navigation'; // Add useSearchParams
import ChatRoomView from './chat/ChatRoomView';
import ChatModal from './chat/ChatModal'; // NEW: Chat Modal
import Header from './shared/Header'; // Import logic
import Footer from './shared/Footer'; // Import logic
import { BigFiveView, MBTIView, PSS10View, GAD7View, RIASECView, PHQ9View, RosenbergView, VARKView, MultipleIntelligenceView, LoveLanguagesView } from './assessments';

// Testimonial Data - Pelajar SMP/SMA usia 12-19 tahun
const testimonials = [
  { name: "Fatimah R.", role: "Pelajar SMA • Sumenep", text: "Aku sempat ragu buat cerita, tapi Kai bikin aku nyaman. Akhirnya aku bisa keluarin semua yang aku pendam selama ini.", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Fatimah", bg: "bg-violet-100" },
  { name: "Rizky A.", role: "Pelajar SMA • Pamekasan", text: "Tes kepribadiannya seru dan hasilnya akurat banget! Aku jadi lebih paham sama diriku sendiri.", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Rizky", bg: "bg-emerald-100" },
  { name: "Dina S.", role: "Pelajar SMP • Sampang", text: "Waktu aku lagi down banget, Kancah Ate jadi tempat pelarian yang aman. Terima kasih sudah ada!", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Dina", bg: "bg-pink-100" },
  { name: "Anonim", role: "Pelajar SMA • Bangkalan", text: "Awalnya malu mau curhat, tapi karena anonim jadi lebih bebas. Kai juga nggak judgmental sama sekali.", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Bangkalan", bg: "bg-blue-100" },
  { name: "Fajar M.", role: "Pelajar SMA • Surabaya", text: "Fitur tes karirnya membantu banget! Sekarang aku lebih yakin mau ambil jurusan apa.", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Fajar", bg: "bg-slate-200" },
  { name: "Aisyah K.", role: "Pelajar SMA • Malang", text: "Kai ngerti banget cara ngomong yang bikin nyaman. Kayak curhat sama temen sendiri.", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Aisyah", bg: "bg-purple-100" },
  { name: "Siti N.", role: "Pelajar SMA • Sumenep", text: "Aku suka karena bisa akses kapan aja. Tengah malam juga bisa curhat tanpa ganggu siapa-siapa.", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Siti", bg: "bg-green-100" },
  { name: "Anonim", role: "Pelajar SMP • Jakarta", text: "Hasil tesnya membantu aku sadar bahwa aku perlu cerita sama orang dewasa yang aku percaya.", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Jakarta", bg: "bg-orange-100" },
  { name: "Ahmad F.", role: "Pelajar SMP • Pamekasan", text: "Platform yang keren! Aku jadi punya tempat cerita yang aman tanpa takut dihakimi.", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Ahmad", bg: "bg-blue-100" },
  { name: "Anonim", role: "Pelajar SMA • Bandung", text: "Setelah curhat di sini, beban pikiranku terasa lebih ringan. Aku jadi bisa tidur lebih nyenyak.", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Bandung", bg: "bg-red-100" },
  { name: "Rina M.", role: "Pelajar SMA • Kediri", text: "Dulu aku suka overthinking, tapi setelah ngobrol sama Kai, aku jadi punya perspective baru.", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Rina", bg: "bg-teal-100" },
  { name: "Budi S.", role: "Pelajar SMP • Malang", text: "Tes minat karirnya beneran ngebantu! Aku jadi tahu mau jadi apa ke depannya.", avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Budi", bg: "bg-amber-100" },
];

// Testimonial Carousel Component
function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Number of testimonials per slide based on screen size
  const getItemsPerSlide = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3; // lg: 3 items
      if (window.innerWidth >= 768) return 2;  // md: 2 items
      return 1; // mobile: 1 item
    }
    return 3;
  };

  const itemsPerSlide = getItemsPerSlide();
  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-slide every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 10000);
    return () => clearInterval(interval);
  }, [itemsPerSlide]);

  // Get current testimonials to display
  const getCurrentTestimonials = () => {
    const start = currentIndex * itemsPerSlide;
    const end = start + itemsPerSlide;
    return testimonials.slice(start, end);
  };

  return (
    <section id="testimonials" className="bg-slate-50 py-16">
      <div className="max-w-6xl mx-auto px-4 lg:px-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-3">Apa Kata Mereka?</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Cerita dari teman-teman remaja yang sudah merasakan manfaat berbagi di Kancah Ate.</p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Testimonials Container */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-hidden">
            {getCurrentTestimonials().map((t, index) => (
              <motion.div
                key={currentIndex * itemsPerSlide + index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <Quote size={24} className="text-violet-200 mb-3" />
                <p className="text-sm md:text-base text-slate-700 leading-relaxed mb-4">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt="" className={`w-10 h-10 rounded-full ${t.bg}`} />
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 w-9 h-9 md:w-11 md:h-11 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 w-9 h-9 md:w-11 md:h-11 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all ${i === currentIndex ? 'bg-violet-500 w-6' : 'bg-slate-300 hover:bg-slate-400 w-2'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// KANCAH ATE - STITCH DESIGN IMPLEMENTATION
// ========================================
export default function App() {
  const searchParams = useSearchParams();
  const testParam = searchParams.get('test');
  
  const [currentView, setCurrentView] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Handle URL query param for direct test access
  useEffect(() => {
    if (testParam) {
      // Map param to view state convention
      setCurrentView(`test_${testParam}`);
      // Scroll to top
      window.scrollTo(0, 0);
    }
  }, [testParam]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false); // NEW: Chat modal state

  const startChat = () => {
    // Open modal instead of changing view
    setShowChatModal(true);
  };

  // ASSESSMENT VIEWS
  if (currentView === 'chat' && selectedCategory) {
    return (
      <ChatRoomView 
        category={selectedCategory} 
        onBack={() => setCurrentView('landing')}
        setView={setCurrentView}
      />
    );
  }
  if (currentView === 'test_phq9') return <FullScreenTest><PHQ9View onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes PHQ-9', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_gad7') return <FullScreenTest><GAD7View onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes GAD-7', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_riasec') return <FullScreenTest><RIASECView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes RIASEC', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_mbti') return <FullScreenTest><MBTIView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes MBTI', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_bigfive') return <FullScreenTest><BigFiveView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes Big Five', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_rosenberg') return <FullScreenTest><RosenbergView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes Harga Diri', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;

  // NEW GEN Z TESTS
  if (currentView === 'test_vark') return <FullScreenTest><VARKView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes Gaya Belajar (VARK)', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_multiple_intelligence') return <FullScreenTest><MultipleIntelligenceView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes Multiple Intelligence', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;
  if (currentView === 'test_love_languages') return <FullScreenTest><LoveLanguagesView onBack={() => setCurrentView('landing')} onChat={(result) => { setSelectedCategory({ id: 'test_result', title: 'Hasil Tes Bahasa Cinta', testResult: result }); setCurrentView('chat'); }} /></FullScreenTest>;

  // ========================================
  // MAIN LANDING PAGE (STITCH DESIGN)
  // ========================================
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700">
      {/* ========== HEADER ========== */}
      <Header actionButtonHandler={startChat} />

      {/* ========== HERO SECTION ========== */}
      <section 
        id="hero"
        className="min-h-[600px] flex flex-col justify-end p-8 md:p-12 lg:mx-10 lg:rounded-2xl lg:my-6 bg-cover bg-center shadow-xl animate-fade-in"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format')`
        }}
      >
        <div className="max-w-2xl animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg mb-6">
            Kancah Ate: Teman Cerita & First Aid Kesehatan Mental Remaja
          </h1>
          <p className="text-white/90 text-base md:text-lg lg:text-xl mb-8 drop-shadow-sm max-w-xl leading-relaxed">
            Kamu nggak harus menanggung semuanya sendiri. Ruang aman untuk berbagi cerita, temukan dukungan sebaya, dan alat untuk pikiran yang lebih sehat.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={startChat}
              className="px-8 py-4 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl transition-all text-base md:text-lg premium-btn shadow-lg"
            >
              Mulai Curhat
            </button>
            <a 
              href="#resources"
              className="px-8 py-4 bg-white/95 hover:bg-white text-slate-700 font-bold rounded-xl transition-all backdrop-blur-sm text-base md:text-lg inline-block premium-btn shadow-md"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      {/* ========== QUICK ACCESS SECTION ========== */}
      <section id="resources" className="bg-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Akses Cepat</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Fitur utama yang bisa kamu gunakan sekarang untuk memulai perjalanan kesehatan mentalmu.</p>
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button onClick={startChat} className="premium-card bg-violet-50 border border-violet-100 rounded-2xl p-6 flex items-center gap-5 hover:bg-violet-100 text-left">
              <div className="w-14 h-14 bg-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <MessageCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Mulai Curhat</h4>
                <p className="text-sm text-slate-500">Chat dengan Kai</p>
              </div>
            </button>
            
            <a href="/psikotes" className="premium-card bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-5 hover:bg-emerald-100">
              <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <BookOpen size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Tes Psikologi</h4>
                <p className="text-sm text-slate-500">9 tes gratis</p>
              </div>
            </a>
            
            <a href="/ruang-baca" className="premium-card bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-center gap-5 hover:bg-amber-100">
              <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <ArrowRight size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Ruang Baca</h4>
                <p className="text-sm text-slate-500">Artikel & tips</p>
              </div>
            </a>
            
            <a href="#crisis" className="premium-card bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-center gap-5 hover:bg-rose-100">
              <div className="w-14 h-14 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg whitespace-nowrap">Bantuan Krisis</h4>
                <p className="text-sm text-slate-500">Hotline 119 ext 8</p>
              </div>
            </a>

            <a href="/laporan-kejadian" className="premium-card bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-200 rounded-2xl p-6 flex items-center gap-5 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Lapor Kekerasan / Bullying</h4>
                <p className="text-sm text-slate-500">Melapor itu berani. Identitasmu aman.</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="bg-slate-50 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="mb-14 md:mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Cara Kerjanya</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Mendapatkan dukungan seharusnya tidak rumit. Tiga langkah sederhana untuk memulai.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12 relative">
            {/* Line connector (desktop) */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-5 group">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-violet-500 text-violet-500 flex items-center justify-center text-2xl font-bold z-10 shadow-md group-hover:bg-violet-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-800">Daftar atau Tetap Anonim</h3>
              <p className="text-slate-500 max-w-[280px] leading-relaxed">Buat profil untuk melacak perjalananmu atau chat secara anonim untuk privasi langsung.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-5 group">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-blue-400 text-blue-400 flex items-center justify-center text-2xl font-bold z-10 shadow-md group-hover:bg-blue-400 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-800">Pilih Dukunganmu</h3>
              <p className="text-slate-500 max-w-[280px] leading-relaxed">Pilih antara peer counseling, tes psikologi, atau browsing perpustakaan sumber daya.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-5 group">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-2xl font-bold z-10 shadow-md group-hover:bg-emerald-400 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-800">Mulai Pulih</h3>
              <p className="text-slate-500 max-w-[280px] leading-relaxed">Terhubung dengan pendengar dan mulai merasa didengarkan. Kami ada bersamamu setiap langkah.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <TestimonialCarousel />

      {/* ========== CTA BANNER ========== */}
      <section className="bg-gradient-to-br from-violet-500 to-violet-600 py-16 md:py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-6">Siap memulai perjalananmu?</h2>
          <p className="text-white/90 text-lg mb-10 leading-relaxed">Bergabung dengan ribuan remaja lain yang memprioritaskan kesehatan mental mereka hari ini.</p>
          <button 
            onClick={startChat}
            className="bg-white text-violet-600 hover:bg-slate-50 font-bold py-4 px-10 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
          >
            Mulai Curhat Gratis
          </button>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <Footer />

      {/* ========== FLOATING REPORT BUTTON ========== */}
      <a
        href="/laporan-kejadian"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-full shadow-xl shadow-rose-200 hover:shadow-rose-300 transition-all hover:scale-105 group"
      >
        <Shield size={20} className="group-hover:animate-pulse" />
        <span className="font-bold text-sm hidden sm:inline">Lapor!</span>
      </a>

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
// FULL SCREEN TEST WRAPPER
// ========================================
function FullScreenTest({ children }) {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {children}
    </div>
  );
}
