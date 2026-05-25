// --- CHAT ROOM COMPONENT ---
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Home,
  AlertTriangle,
  Flag,
  Mail,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

// Import encryption service
import { encryptData, decryptData, anonymizeUserData, sanitizeMessage } from '../../services/cryptoService';

// --- RATE LIMITER ---
// Prevent API abuse and control costs
const createRateLimiter = (maxMessages = 10, windowMs = 60000) => {
  let messages = [];

  return {
    canSend: () => {
      const now = Date.now();
      // Remove messages outside the time window
      messages = messages.filter(t => now - t < windowMs);

      if (messages.length < maxMessages) {
        messages.push(now);
        return true;
      }
      return false;
    },
    getRemainingCount: () => {
      const now = Date.now();
      messages = messages.filter(t => now - t < windowMs);
      return maxMessages - messages.length;
    },
    reset: () => {
      messages = [];
    }
  };
};

// --- SESSION TIMEOUT ---
// Auto-end session after inactivity
// Standard counseling session duration: 40 minutes
const SESSION_TIMEOUT_MS = 40 * 60 * 1000; // 40 minutes
const WARNING_TIMEOUT_MS = 35 * 60 * 1000; // 35 minutes (show warning)

const createSessionTimeout = (onWarning, onTimeout) => {
  let timeoutId = null;
  let warningId = null;
  let lastActivity = Date.now();

  const reset = () => {
    lastActivity = Date.now();
    clearTimeout(timeoutId);
    clearTimeout(warningId);

    // Set warning timeout
    warningId = setTimeout(() => {
      const timeUntilTimeout = Math.ceil((SESSION_TIMEOUT_MS - WARNING_TIMEOUT_MS) / 60000);
      onWarning(timeUntilTimeout);
    }, WARNING_TIMEOUT_MS);

    // Set actual timeout
    timeoutId = setTimeout(() => {
      onTimeout();
    }, SESSION_TIMEOUT_MS);
  };

  const clear = () => {
    clearTimeout(timeoutId);
    clearTimeout(warningId);
  };

  return { reset, clear };
};

import { useSession } from 'next-auth/react';
import { getChatDraft, saveChatDraft, deleteChatDraft, getUserProfile } from '../../services/analyticsService';
import { callGeminiAPI, validateAnswer } from '../../services/geminiService';
import { ragPipeline, detectCrisis as ragDetectCrisis } from '../../services/ragService';
import { createOrUpdateUser, createSession, updateSession } from '../../services/analyticsService';
import CrisisModal from './CrisisModal';
import MoodSlider from './widgets/MoodSlider';
import QuickReplyCards from './widgets/QuickReplyCards';
import GroundingCard from './widgets/GroundingCard';

// --- KONFIGURASI FLOW ---
const INTAKE_FLOW = [
  {
    id: 'name',
    text: "Biar lebih akrab, boleh tahu siapa nama panggilanmu?",
    type: 'text'
  },
  {
    id: 'education_status',
    text: "Salam kenal! Apa status pendidikan kamu saat ini?",
    type: 'option',
    options: [
      "Pelajar SD/SMP/SMA",
      "Mahasiswa D3/S1",
      "Sudah Bekerja",
      "Sedang Mencari Kerja",
      "Lulus/Sudah Tidak Sekolah"
    ]
  }
];

// Persona Selection Options
const PERSONA_OPTIONS = [
  {
    id: 'formal',
    name: 'Formal & Profesional',
    description: 'Gaya bicara santai tapi tetap sopan, cocok untuk konsultasi serius',
    tone: 'sopan',
    style: 'Saya akan membantu dengan pendekatan profesional namun tetap hangat',
    keywords: ['profesional', 'formal', 'sopan']
  },
  {
    id: 'casual',
    name: 'Santai & Akrab',
    description: 'Gaya bahasa sehari-hari, seperti ngobrol sama teman, cocok untuk curhat santai',
    tone: 'akrab',
    style: 'Aku bakal jadi teman curhat yang asik dan siap dengerin kamu.',
    keywords: ['santai', 'akrab', 'casual', 'temen']
  },
  {
    id: 'coach',
    name: 'Motivator Coach',
    description: 'Semangat penuh, fokus pada solusi dan aksi, cocok untuk butuh dorongan',
    tone: 'semangat',
    style: 'Ayo kita hadapi sama-sama! Fokus pada solusi dan langkah maju, ya!',
    keywords: ['semangat', 'coach', 'motivator', 'solusi']
  }
];

// ENHANCEMENT: Auto-select persona based on user identity
const selectPersonaBasedOnIdentity = (userData) => {
  const age = userData.dob ? (() => {
    const today = new Date();
    const birthDate = new Date(userData.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  })() : 17;

  const isStudent = userData.education_status?.includes('Pelajar') || userData.education_status?.includes('Mahasiswa');
  const isWorking = userData.education_status?.includes('Bekerja');
  const isGraduate = userData.education_status?.includes('Lulus');

  // Logic: Younger + Student = Casual, Older + Working = Formal
  if (age <= 18 && isStudent) {
    return PERSONA_OPTIONS[1]; // Casual/gaul
  } else if (age >= 25 || isWorking || isGraduate) {
    return PERSONA_OPTIONS[0]; // Formal
  } else {
    return PERSONA_OPTIONS[2]; // Coach - default for teens/young adults
  }
};

const SUB_TOPICS = {
  psikologi: ["Cemas Berlebih", "Depresi", "Trauma/PTSD", "Self-Harm", "Pikiran Bunuh Diri", "Gangguan Tidur", "Masalah Body Image", "Lainnya"],
  karir: ["Bingung Jurusan", "Gagal Tes/Seleksi", "Tekanan Orang Tua", "Lainnya"],
  pendidikan: ["Stres Ujian", "Tekanan Akademik", "Bullying", "Lainnya"],
  pertemanan: ["Konflik Teman", "Dikucilkan", "Jealousy", "Lainnya"],
  keluarga: ["Masalah Ortu", "KDRT", "Perceraian", "Sibling Rivalry", "Lainnya"],
  agama: ["Krisis Iman", "Rasa Bersalah", "Tekanan Sosial", "Lainnya"],
  cinta: ["Patah Hati", "Toxic Relationship", "LDR", "Dijodohkan", "Orientasi Seksual", "Lainnya"],
  medsos: ["Kecanduan Gadget", "FOMO", "Insecure karena Sosmed", "Cyberbullying", "Lainnya"],
  general: ["Kecemasan/Stress", "Hubungan Sosial", "Akademik/Karir", "Keluarga", "Lainnya"]
};

const CATEGORY_QUESTIONS = {
  psikologi: [
    "Sudah berapa lama perasaan ini kamu rasakan?",
    "Apakah hal ini mulai mengganggu aktivitas harianmu seperti tidur, makan, atau sekolah?",
    "Apa yang biasanya memicu perasaan ini muncul?"
  ],
  karir: [
    "Apa yang paling membuatmu bingung soal karirmu saat ini?",
    "Apakah ada tekanan dari orang-orang sekitar?",
    "Kalau bisa memilih bebas, apa yang sebenarnya kamu inginkan?"
  ],
  pendidikan: [
    "Bagaimana situasi di sekolah/kampusmu?",
    "Apakah ada mata pelajaran/dosen tertentu yang membuatmu stres?",
    "Bagaimana support system-mu di tempat belajar?"
  ],
  pertemanan: [
    "Bisa ceritakan tentang konflik dengan temanmu?",
    "Bagaimana perasaanmu setelah kejadian itu?",
    "Apakah kamu punya orang lain untuk curhat soal ini?"
  ],
  keluarga: [
    "Situasi seperti apa yang membuatmu tidak nyaman di rumah?",
    "Apakah ada anggota keluarga yang lebih mengerti perasaanmu?",
    "Bagaimana hal ini mempengaruhi suasana hatimu?"
  ],
  agama: [
    "Apa yang sedang kamu pertanyakan tentang keyakinanmu?",
    "Apakah ada kejadian yang memicu perasaan ini?",
    "Bagaimana kamu biasanya mencari jawaban?"
  ],
  cinta: [
    "Sudah berapa lama kamu merasakan hal ini?",
    "Apakah kamu sudah membicarakan perasaanmu?",
    "Bagaimana perasaan ini mempengaruhi aktivitas harianmu?"
  ],
  medsos: [
    "Berapa lama rata-rata kamu menggunakan gadget per hari?",
    "Apakah kamu merasa cemas saat tidak bisa akses sosmed?",
    "Apa yang paling membuatmu insecure di sosmed?"
  ],
  general: [
    "Apa hal yang paling mengganggu pikiranmu saat ini?",
    "Sejak kapan kamu merasakan hal ini?",
    "Apakah hal ini mempengaruhi aktivitas sehari-harimu?"
  ]
};

const MENTAL_HEALTH_KNOWLEDGE = {
  'kecemasan': {
    definition: "Perasaan takut/khawatir berlebih yang sulit dikendalikan.",
    symptoms: "Jantung berdebar, keringat dingin, sulit fokus, overthinking.",
    tips: "Deep breathing, teknik grounding 5-4-3-2-1, kurangi kafein."
  },
  'kesedihan': {
    definition: "Perasaan sedih mendalam yang persisten.",
    symptoms: "Lelah terus menerus, perubahan nafsu makan/tidur, merasa tidak berharga.",
    tips: "Lakukan 1 hal kecil, bicara pada orang terpercaya, tidur teratur."
  },
  'general': {
    definition: "Kondisi kesehatan mental seseorang.",
    symptoms: "Perubahan mood, perilaku, atau cara berpikir.",
    tips: "Istirahat cukup, kelola stres, olahraga, berani minta bantuan."
  }
};

// Crisis Detection
const CRISIS_INDICATORS = {
  critical: [
    'bunuh diri', 'mau mati', 'ingin mati', 'lebih baik mati',
    'mengakhiri hidup', 'akhiri hidupku', 'tidak ingin hidup',
    'gantung diri', 'loncat', 'overdosis', 'minum racun',
    'menyakiti diri', 'lukai diri', 'sayat', 'iris'
  ],
  high: [
    'tidak ada gunanya', 'hidup tidak bermakna', 'beban keluarga',
    'tidak ada yang peduli', 'sendirian di dunia', 'hopeless', 'putus asa',
    'diperkosa', 'dilecehkan', 'kekerasan seksual', 'kdrt'
  ],
  moderate: [
    'sangat sedih', 'depresi', 'tertekan sekali', 'stress berat',
    'anxiety parah', 'panik terus', 'tidak mau keluar rumah'
  ]
};

// SECURITY: Improved crisis detection with regex patterns
// Detects obfuscated text like "b.u.n.u.h" or "bunuh diri" with spaces
function detectCrisisLevel(text) {
  const lowerText = text.toLowerCase();

  // Remove common obfuscation patterns
  const normalizedText = lowerText
    .replace(/[.\s\-_]+/g, '')  // Remove dots, spaces, hyphens, underscores
    .replace(/(.)\1{2,}/g, '$1'); // Remove repeated characters (e.g., "maaaat")

  // Check critical indicators with regex
  const criticalPatterns = [
    /b[.\s\-_]*u[.\s\-_]*n[.\s\-_]*u[.\s\-_]*h[.\s\-_]*d[.\s\-_]*i[.\s\-_]*r[.\s\-_]*i/,
    /m[.\s\-_]*a[.\s\-_]*u[.\s\-_]*m[.\s\-_]*a[.\s\-_]*t[.\s\-_]*i/,
    /i[.\s\-_]*n[.\s\-_]*g[.\s\-_]*i[.\s\-_]*n[.\s\-_]*m[.\s\-_]*a[.\s\-_]*t[.\s\-_]*i/,
    /m[.\s\-_]*e[.\s\-_]*n[.\s\-_]*g[.\s\-_]*a[.\s\-_]*k[.\s\-_]*h[.\s\-_]*i[.\s\-_]*r[.\s\-_]*u[.\s\-_]*p[.\s\-_]*h[.\s\-_]*i[.\s\-_]*d[.\s\-_]*u[.\s\-_]*p/,
    /g[.\s\-_]*a[.\s\-_]*n[.\s\-_]*t[.\s\-_]*u[.\s\-_]*n[.\s\-_]*g/,
    /o[.\s\-_]*v[.\s\-_]*e[.\s\-_]*r[.\s\-_]*d[.\s\-_]*o[.\s\-_]*s[.\s\-_]*i[.\s\-_]*s/,
    /m[.\s\-_]*i[.\s\-_]*n[.\s\-_]*u[.\s\-_]*m[.\s\-_]*r[.\s\-_]*a[.\s\-_]*c[.\s\-_]*u[.\s\-_]*n/,
    /m[.\s\-_]*e[.\s\-_]*n[.\s\-_]*y[.\s\-_]*a[.\s\-_]*k[.\s\-_]*i[.\s\-_]*t[.\s\-_]*i[.\s\-_]*d[.\s\-_]*i[.\s\-_]*r[.\s\-_]*i/,
    /l[.\s\-_]*u[.\s\-_]*k[.\s\-_]*a[.\s\-_]*i[.\s\-_]*d[.\s\-_]*i[.\s\-_]*r[.\s\-_]*i/,
    /s[.\s\-_]*a[.\s\-_]*y[.\s\-_]*a[.\s\-_]*t/
  ];

  for (const pattern of criticalPatterns) {
    if (pattern.test(normalizedText)) {
      return { level: 'Kritis', color: 'red', priority: 4, keyword: 'suicide/self-harm detected' };
    }
  }

  // Fallback to keyword matching for critical
  for (const keyword of CRISIS_INDICATORS.critical) {
    if (lowerText.includes(keyword) || normalizedText.includes(keyword.replace(/\s/g, ''))) {
      return { level: 'Kritis', color: 'red', priority: 4, keyword };
    }
  }

  // Check high indicators
  for (const keyword of CRISIS_INDICATORS.high) {
    if (lowerText.includes(keyword) || normalizedText.includes(keyword.replace(/\s/g, ''))) {
      return { level: 'Tinggi', color: 'orange', priority: 3, keyword };
    }
  }

  // Check moderate indicators
  for (const keyword of CRISIS_INDICATORS.moderate) {
    if (lowerText.includes(keyword)) {
      return { level: 'Sedang', color: 'yellow', priority: 2, keyword };
    }
  }

  return { level: 'Rendah', color: 'green', priority: 1, keyword: null };
}

/**
 * ChatRoomView - Komponen utama untuk sesi chat dengan Kai
 * @param {object} category - Kategori masalah yang dipilih
 * @param {function} onBack - Callback untuk kembali ke halaman sebelumnya
 * @param {object} initialData - Data awal dari assessment atau previous session
 * @param {function} setView - Function untuk mengubah view (untuk navigasi)
 */
function ChatRoomView({ category, onBack, initialData, setView }) {
  // Session ID untuk auto-save
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('kancahate_session_id');
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('kancahate_session_id', id);
    }
    return id;
  });
  
  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: "Halo! Kenalin aku Kai 👋\n\nSebelum kita ngobrol, apa yang lagi kamu rasain sekarang?" }] }
  ]);
  
  const [phase, setPhase] = useState('initial_hook');
  const [intakeIndex, setIntakeIndex] = useState(0);
  const [userData, setUserData] = useState(initialData || {});

  // ENHANCEMENT: Persistent user identification & persona
  const [userId] = useState(() => {
    // Generate or retrieve persistent user_id
    let id = localStorage.getItem('kancahate_user_id');
    if (!id) {
      // Generate UUID-like ID for anonymous users
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('kancahate_user_id', id);
    }
    return id;
  });
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null); // Track logged-in user

  const { data: sessionData, status } = useSession();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecovering, setIsRecovering] = useState(true);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const sessionStartTimeRef = useRef(new Date());
  
  // Crisis Detection State
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [currentRiskLevel, setCurrentRiskLevel] = useState({ level: 'Rendah', priority: 1 });
  const [detectedKeywords, setDetectedKeywords] = useState([]);

  // SECURITY: Rate limiter to prevent API abuse
  // 10 messages per minute maximum
  const rateLimiter = useRef(createRateLimiter(10, 60000)).current;
  const [rateLimitWarning, setRateLimitWarning] = useState(false);

  // ENHANCEMENT: Session timeout management
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(null);
  const sessionTimeoutRef = useRef(null);

  // WIDGET STATE
  const [activeWidget, setActiveWidget] = useState(null); // 'mood', 'quick_reply', 'grounding', or null
  const [widgetData, setWidgetData] = useState(null); // Additional data for widgets

  // ACCESSIBILITY: STT (Speech-to-Text) & TTS (Text-to-Speech) State
  const [isListening, setIsListening] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Gen Z UX Features
  const [isNightMode, setIsNightMode] = useState(false);
  const [isTypingSoundEnabled, setIsTypingSoundEnabled] = useState(true);
  const [finalQuote, setFinalQuote] = useState("");
  const audioContextRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  //  // Gen Z UX: Auto Night Mode
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) {
      setIsNightMode(true);
    }
  }, []);

  // Gen Z UX: Typing Sound Effect (Web Audio API)
  const playTypingSound = () => {
    if (!isTypingSoundEnabled) return;
    
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const now = ctx.currentTime;
    if (now < nextNoteTimeRef.current) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    // Random frequency for mechanical keyboard feel
    osc.frequency.value = 800 + Math.random() * 400; 
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
    
    // Schedule next note randomly between 50-150ms
    nextNoteTimeRef.current = now + 0.05 + Math.random() * 0.1;
  };

  useEffect(() => {
    let animationFrame;
    const playLoop = () => {
      if (isTyping) playTypingSound();
      animationFrame = requestAnimationFrame(playLoop);
    };
    if (isTyping && isTypingSoundEnabled) {
      animationFrame = requestAnimationFrame(playLoop);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isTyping, isTypingSoundEnabled]);

  // Check for logged-in user and existing profile
  useEffect(() => {
    const checkSession = async () => {
      if (status === 'loading') return;
      try {
        const user = sessionData?.user;
        if (user) {
          setLoggedInUser(user);
          console.log('[Auth] User already logged in:', user.email);
          
          // Fetch user profile from database
          const { success, data: profile, error } = await getUserProfile();
          
          if (success && profile) {
            console.log('[Profile] User profile found, skipping intake');
            
            // Pre-fill userData from profile
            setUserData(prev => ({
              ...prev,
              email: user.email,
              name: profile.name,
              gender: profile.gender,
              dob: profile.dob,
              age: profile.age,
              education_status: profile.educationStatus || profile.education_status,
              institution_type: profile.institutionType || profile.institution_type,
              occupation: profile.occupation,
              location: profile.location,
              location_custom: profile.locationCustom || profile.location_custom
            }));
            
            // Skip intake phase, go directly to subtopic selection
            setPhase('subtopic');
            setIntakeIndex(INTAKE_FLOW.length); // Mark intake as complete
            
            // Auto-select persona based on profile
            const autoPersona = selectPersonaBasedOnIdentity(profile);
            setUserData(prev => ({ ...prev, persona: autoPersona.id }));
            
            // Welcome message with user's name
            setMessages([{
              role: 'model',
              parts: [{
                text: `Halo lagi, ${profile.name}! 👋 Senang bertemu kamu lagi. Aku Kai, siap mendengarkan ceritamu hari ini. Mau cerita tentang apa?`
              }]
            }]);
          } else {
            // No profile found, continue with normal intake
            console.log('[Profile] No profile found, continuing with intake');
            setUserData(prev => ({ ...prev, email: user.email }));
          }
        }
      } catch (error) {
        console.error('[Auth] Error checking session:', error);
      }
    };
    checkSession();
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'id-ID'; // Indonesian language
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + transcript);
          setIsListening(false);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
      
      // Initialize TTS
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        // Pre-load voices
        synthRef.current.getVoices();
        // Voices load asynchronously, so listen for the voiceschanged event
        synthRef.current.onvoiceschanged = () => {
          synthRef.current.getVoices();
        };
      }
    }
  }, []);

  // TTS Function - Read bot messages aloud
  const speakText = (text) => {
    if (!synthRef.current || !isTTSEnabled) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    
    // Find Indonesian voice if available
    const voices = synthRef.current.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) {
      utterance.voice = idVoice;
    }
    
    // Workaround for Chrome bug where speech doesn't start immediately
    setTimeout(() => {
      synthRef.current.speak(utterance);
    }, 100);
  };

  // Toggle STT
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Stop TTS
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isTyping && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isTyping, phase, messages]);

  // Session Recovery
  useEffect(() => {
    const recoverSession = async () => {
      try {
        const { success, data } = await getChatDraft(sessionId);
        
        if (!success || !data) {
          recoverFromLocalStorage();
        } else {
          console.log('Session recovered from database:', sessionId);
          setPhase(data.phase);
          setMessages(data.messages || [{ role: 'model', parts: [{ text: INTAKE_FLOW[0].text }] }]);
          setUserData(data.user_data || {});
          setCurrentRiskLevel({ level: data.current_risk_level || 'Rendah', priority: 1 });
          setDetectedKeywords(data.detected_keywords || []);
          setIntakeIndex(data.user_data?.intake_index || 0);
        }
      } catch (err) {
        console.error('Error recovering session:', err);
        recoverFromLocalStorage();
      } finally {
        setIsRecovering(false);
      }
    };
    
    const recoverFromLocalStorage = async () => {
      try {
        const saved = localStorage.getItem(`kancahate_draft_${sessionId}`);
        if (saved) {
          const draft = await decryptData(saved);
          if (draft) {
            console.log('Session recovered from LocalStorage:', sessionId);
            setPhase(draft.phase || 'intake');
            setMessages(draft.messages || [{ role: 'model', parts: [{ text: INTAKE_FLOW[0].text }] }]);
            setUserData(draft.userData || {});
            setCurrentRiskLevel(draft.currentRiskLevel || { level: 'Rendah', priority: 1 });
            setDetectedKeywords(draft.detectedKeywords || []);
            setIntakeIndex(draft.intakeIndex || 0);
          }
        }
      } catch (err) {
        console.error('Error parsing LocalStorage draft:', err);
      }
    };
    
    recoverSession();
  }, [sessionId]);
  
  // Auto-save draft
  useEffect(() => {
    if (isRecovering || phase === 'finished' || phase === 'saving') return;
    
    const saveDraft = async () => {
      const draft = {
        session_id: sessionId,
        phase,
        messages,
        user_data: { ...userData, intake_index: intakeIndex },
        category: category.title,
        current_risk_level: currentRiskLevel.level,
        detected_keywords: detectedKeywords
      };

      // SECURITY: Encrypt with AES-GCM before storing in localStorage
      const encrypted = await encryptData(draft);

      try {
        if (encrypted) {
          localStorage.setItem(`kancahate_draft_${sessionId}`, encrypted);
          localStorage.setItem(`kancahate_draft_backup`, encrypted);
        }
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
      
      saveChatDraft(sessionId, draft).then(({ success, error }) => {
        if (!success) console.error('Failed to auto-save draft to server:', error);
        else console.log('Draft auto-saved to server:', sessionId);
      });
    };
    
    saveDraft();
    autoSaveTimerRef.current = setInterval(saveDraft, 30000);
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [phase, messages, userData, intakeIndex, currentRiskLevel, detectedKeywords, sessionId, isRecovering, category.title]);

  // ENHANCEMENT: Session timeout initialization
  useEffect(() => {
    // Skip timeout for finished/saving phases
    if (phase === 'finished' || phase === 'saving') return;

    const handleTimeoutWarning = (minutesLeft) => {
      setSessionTimeoutWarning(minutesLeft);
    };

    const handleTimeout = () => {
      setSessionTimeoutWarning(null);
      setPhase('finished');
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{
          text: `Halo ${userData.name || 'kawan'}! Kai perhatikan kamu sudah cukup lama diam sesi ini. Kalau kamu mau lanjut cerita, kamu bisa mulai sesi baru dengan kode akses yang sama nanti. Ingat, ceritamu aman bersama Kai ya! 🌟`
        }]
      }]);
    };

    // Initialize session timeout
    const sessionTimeout = createSessionTimeout(handleTimeoutWarning, handleTimeout);
    sessionTimeoutRef.current = sessionTimeout;
    sessionTimeout.reset();

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      if (sessionTimeoutRef.current) {
        sessionTimeoutRef.current.reset();
        // Clear warning when user becomes active
        if (sessionTimeoutWarning) {
          setSessionTimeoutWarning(null);
        }
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (sessionTimeoutRef.current) {
        sessionTimeoutRef.current.clear();
      }
    };
  }, [phase, sessionTimeoutWarning, userData.name]);

  // System Prompt Generator with CBT/ACT Framework
  const generateSystemPrompt = () => {
    // SECURITY: Proper age calculation accounting for month/day
    const calculateAge = (dob) => {
      if (!dob) return 'Belum tahu';
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const age = calculateAge(userData.dob);

    // ENHANCEMENT: Get persona style based on auto-selection
    const currentPersona = PERSONA_OPTIONS.find(p => p.id === userData.persona) || PERSONA_OPTIONS[2]; // Default to coach

    // Tentukan pendekatan terapi berdasarkan kategori dan intensitas
    const cbtCategories = ['psikologi', 'pendidikan', 'karir']; // Masalah kognitif/anxiety
    const actCategories = ['keluarga', 'cinta', 'agama', 'pertemanan']; // Masalah relasional/penerimaan

    const useCBT = cbtCategories.includes(category.id) || currentRiskLevel.priority >= 2;
    const useACT = actCategories.includes(category.id) || userData.subtopic?.includes('Trauma');

    let prompt = `
      IDENTITAS: Kamu adalah 'Kai' (dari Kancah Ate), teman curhat virtual & konselor sebaya untuk remaja Indonesia.
      GAYA BICARA: ${currentPersona.style}
      KARAKTER: Hangat, empatik, tidak menghakimi, bijak.
    JANGAN kaku seperti robot/CS. Jadilah seperti sahabat yang peduli.
    
    DATA USER:
    - Nama: ${userData.name || 'Teman'}
    - Gender: ${userData.gender}
    - Umur: ${age} th
    - Status: ${userData.education_status} (${userData.institution_type || '-'})
    - Asal: ${userData.location}
    - Topik: ${category.title} (${userData.subtopic || 'Umum'})
    - Risiko Saat Ini: ${currentRiskLevel.level}
    `;

    // FRAMEWORK TERAPI BERBASIS BUKTI
    if (useCBT && !useACT) {
      prompt += `
      PENDEKATAN: CBT (Cognitive Behavioral Therapy) LITE
      Cocok untuk: Kecemasan, overthinking, pola pikir negatif, stress akademik.
      
      TEKNIK YANG DIGUNAKAN:
      1. IDENTIFIKASI PIKIRAN OTOMATIS: "Coba ceritakan, apa yang langsung muncul di pikiranmu saat itu terjadi?"
      2. COGNITIVE RESTRUCTURING: Bantu user melihat bukti yang mendukung/menentang pikirannya.
         - "Hmm, apa ada kemungkinan lain kenapa itu terjadi?"
         - "Kalau temanmu cerita hal yang sama, apa yang akan kamu bilang ke dia?"
      3. BEHAVIORAL ACTIVATION: Dorong aksi kecil yang bisa dilakukan.
         - "Kira-kira ada 1 hal kecil yang bisa kamu coba besok?"
      4. REALITY TESTING: "Seberapa besar kemungkinan hal buruk itu benar-benar terjadi?"
      `;
    } else if (useACT) {
      prompt += `
      PENDEKATAN: ACT (Acceptance and Commitment Therapy) LITE
      Cocok untuk: Masalah relasional, trauma, penerimaan diri, konflik nilai.
      
      TEKNIK YANG DIGUNAKAN:
      1. ACCEPTANCE: Jangan langsung coba "fix" perasaan. Normalize dan terima.
         - "Wajar banget kamu ngerasa gitu. Perasaan itu valid."
         - "Kadang emang kita gak bisa kontrol perasaan, dan itu oke."
      2. DEFUSION: Bantu user "jaga jarak" dari pikiran negatifnya.
         - "Coba ganti 'Aku gagal' jadi 'Aku lagi punya pikiran bahwa aku gagal'. Gimana rasanya?"
      3. VALUES CLARIFICATION: Gali apa yang penting buat user.
         - "Di situasi ini, apa sih yang paling penting buat kamu?"
         - "Kalau ini beres, kamu pengennya hubungan kalian kayak gimana?"
      4. COMMITTED ACTION: Dorong aksi kecil yang sesuai nilai mereka.
         - "Langkah sekecil apapun, apa yang bisa kamu lakukan yang sesuai sama nilai itu?"
      `;
    } else {
      // Default: Kombinasi ringan
      prompt += `
      PENDEKATAN: SUPPORTIVE COUNSELING
      1. VALIDASI perasaan tanpa judgement
      2. KLARIFIKASI untuk memahami situasi lebih dalam
      3. NORMALISASI pengalaman mereka
      4. EKSPLORASI opsi tanpa memaksa solusi
      `;
    }

    // FASE-BASED GUIDANCE
    if (phase === 'deepening' || phase === 'free_chat') {
      prompt += `
      
      FASE SAAT INI: PENDALAMAN & MENDENGARKAN
      - Fokus utama: MENDENGARKAN, bukan memberi solusi
      - Gunakan refleksi: "Jadi yang kamu rasakan adalah..."
      - Pertanyaan eksplorasi: "Bisa ceritain lebih lanjut?", "Apa yang terjadi setelah itu?"
      - Validasi: "Itu pasti berat ya...", "Wajar banget kamu ngerasa gitu"
      - TAHAN SOLUSI sampai user benar-benar sudah cerita cukup
      `;
    }

    // RISK-BASED ADJUSTMENTS
    if (currentRiskLevel.priority >= 3) {
      prompt += `
      
      ⚠️ PERINGATAN RISIKO TINGGI: ${currentRiskLevel.level} ⚠️
      - Prioritaskan KEAMANAN user
      - Tunjukkan kepedulian ekstra: "Aku sangat peduli sama keselamatanmu"
      - Tanyakan langsung tapi lembut: "Kadang kalau lagi berat banget, ada pikiran mau menyakiti diri sendiri gak?"
      - Arahkan ke hotline/bantuan profesional: "Aku saranin banget kamu hubungi Into The Light (119 ext 8)" 
      - JANGAN tinggalkan user sendirian dengan perasaan itu
      `;
    } else if (currentRiskLevel.priority === 2) {
      prompt += `
      
      ⚠️ PERHATIAN RISIKO SEDANG: ${currentRiskLevel.level}
      - Monitor dengan lebih sensitif
      - Tanyakan: "Gimana tidurmu belakangan? Makanmu gimana?"
      - Cek support system: "Ada orang yang bisa kamu ajak cerita langsung gak di real life?"
      `;
    }

    const knowledge = MENTAL_HEALTH_KNOWLEDGE[category.id] || MENTAL_HEALTH_KNOWLEDGE['general'];
    if (knowledge) {
      prompt += `
      KONTEKS KLINIS (${category.title}):
      - ${knowledge.definition}
      - Tips: ${knowledge.tips}
      `;
    }

    prompt += `

    GAYA BICARA:
    - Bahasa Indonesia natural (aku-kamu, slang wajar)
    - JANGAN kaku/formal
    - Jawaban max 2-3 kalimat per paragraf
    - Selalu akhiri dengan pertanyaan untuk menjaga percakapan mengalir
    `;

    return prompt;
  };

  /**
   * Generate RAG-enhanced system prompt
   * Uses RAG pipeline to include verified clinical context
   * @param {string} userMessage - Latest user message
   * @returns {Promise<string>} - Enhanced prompt with RAG context
   */
  const generateRAGEnhancedPrompt = async (userMessage) => {
    // Get base system prompt
    const basePrompt = generateSystemPrompt();

    try {
      // Run RAG pipeline to get clinical context WITH USER DATA for personalized filtering
      const ragResult = await ragPipeline(
        userMessage,
        basePrompt,
        userData // ← Pass userData for personalized RAG (age group, education, etc.)
      );

      // Use enhanced prompt if context was found
      if (ragResult.enhancedPrompt && ragResult.retrievedContexts.length > 0) {
        console.log('[RAG] Retrieved', ragResult.retrievedContexts.length, 'clinical contexts');

        // Log personalized filtering info
        if (userData.dob) {
          const age = new Date().getFullYear() - new Date(userData.dob).getFullYear();
          console.log('[RAG] Personalized for age:', age, 'education:', userData.education_status);
        }

        return ragResult.enhancedPrompt;
      }

      return basePrompt;
    } catch (error) {
      console.error('[RAG] Error generating enhanced prompt:', error);
      return basePrompt;
    }
  };

  const systemPrompt = generateSystemPrompt();

  const addBotMessage = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text }] }]);
      // ACCESSIBILITY: Read message aloud if TTS is enabled
      speakText(text);
    }, 800);
  };

  const finishSession = async () => {
    setPhase('finished');
    addBotMessage("Terima kasih sudah bercerita! Ceritamu sudah kami simpan dengan aman. Tetap semangat ya, kamu tidak sendirian! 💪");
    
    // Generate AI Quote
    try {
      const quotePrompt = `Berdasarkan curhatan user bernama ${userData.name || 'kawan'} tentang topik ${category.title}, buatkan SATU kalimat penyemangat/quote singkat yang hangat dan inspiratif. Jangan pakai tanda kutip atau emoji berlebihan.`;
      const quote = await callGeminiAPI(messages, quotePrompt, 1, userData.name);
      setFinalQuote(quote);
    } catch (e) {
      setFinalQuote("Kamu hebat sudah berani cerita hari ini. Langkah kecilmu sangat berarti!");
    }
  };

  // Handler untuk tombol "Selesai Bercerita"
  const handleEndChatSession = async () => {
    setPhase('ending');
    setIsTyping(true);

    // Save to Supabase dengan schema baru
    try {
      if (supabase) {
        // Step 1: Create or update user
        const { userId: dbUserId, isNewUser } = await createOrUpdateUser(userData);

        if (dbUserId) {
          // Step 2: Create session record
          const userMessageCount = messages.filter(m => m.role === 'user').length;
          const startedAt = sessionStartTimeRef.current;

          const sessionData = await createSession({
            userId: dbUserId,
            category: category.id,
            subtopic: userData.subtopic,
            subtopic_custom: userData.subtopic_custom || false,
            persona_id: userData.persona || 'coach',
            risk_level: currentRiskLevel.level,
            risk_priority: currentRiskLevel.priority || 1,
            chat_history: messages,
            message_count: messages.length,
            user_message_count: userMessageCount,
            summary: messages.slice(-3).map(m => m.parts[0]?.text?.substring(0, 100)).join(' ') || '',
            detected_keywords: detectedKeywords.length > 0 ? detectedKeywords : null,
            started_at: startedAt.toISOString(),
            status: 'Selesai',
            metadata: {
              category_title: category.title,
              is_new_user: isNewUser,
              completed_at: new Date().toISOString()
            }
          });

          if (sessionData) {
            console.log('[Analytics] Session saved:', sessionData.id);

            // Update session dengan durasi
            const durationSeconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
            await updateSession(sessionData.id, {
              ended_at: new Date().toISOString(),
              duration_seconds: durationSeconds,
              completion_rate: 100.0
            });
          }
        }

        // Cleanup draft
        localStorage.removeItem(`kancahate_draft_${sessionId}`);
        localStorage.removeItem('kancahate_session_id');
        await deleteChatDraft(sessionId);
      }
    } catch (err) {
      console.error('Error saving session:', err);
    }

    setIsTyping(false);

    // Skip account offering if user already logged in
    if (loggedInUser) {
      console.log('[Auth] User already logged in, skipping account creation');
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: `Terima kasih sudah curhat, ${userData.name}! 💙 Ceritamu sudah tersimpan dengan aman di akunmu.\n\nKamu bisa lihat riwayat chat di dashboard kapan saja. Semangat ya! 🌟` }]
      }]);
      setPhase('finished');
      return;
    }

    // Tawarkan buat akun untuk user anonim
    setMessages(prev => [...prev, {
      role: 'model',
      parts: [{ text: `Terima kasih sudah curhat, ${userData.name}! 💙 Ceritamu sudah tersimpan dengan aman.\n\nMau buat akun rahasia agar bisa melihat riwayat chat dan melanjutkan kapan saja?` }]
    }]);
    setPhase('offering_account');
  };

  // State untuk email input saat buat akun
  const [accountEmail, setAccountEmail] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleAccountCreation = async (wantsAccount) => {
    if (wantsAccount) {
      // Tampilkan form email
      setIsCreatingAccount(true);
    } else {
      addBotMessage("Baiklah, tidak masalah. Tetap jaga kesehatan mentalmu ya. Kami ada di sini kapanpun kamu butuh. 🤗");
      setPhase('finished');
    }
  };

  const handleSendMagicLink = async () => {
    if (!accountEmail || !accountEmail.includes('@')) {
      alert('Masukkan email yang valid ya!');
      return;
    }

    setIsTyping(true);
    try {
      // TODO: Update email di db. Belum didukung Drizzle action langsung di sini.
      // Kirim magic link NextAuth tidak didukung default OTP
      const error = new Error("Magic Link is not configured in NextAuth yet.");
      
      if (error) throw error;

      setIsTyping(false);
      addBotMessage(`Magic Link sudah terkirim ke ${accountEmail}! 📧\n\nCek inbox (atau folder spam) dan klik link tersebut untuk mengaktifkan akunmu. Sampai jumpa lagi!`);
      setIsCreatingAccount(false);
      setPhase('finished');
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      addBotMessage("Maaf, ada masalah saat mengirim link. Tapi jangan khawatir, datamu tetap aman!");
      setPhase('finished');
    }
  };

  // WIDGET HANDLERS
  const handleMoodSelect = (moodData) => {
    // User message representation
    const moodText = `Saya merasa ${moodData.label}`;
    setMessages(prev => [...prev, { role: 'user', parts: [{ text: moodText }] }]);

    setActiveWidget(null);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      // Response logic combining Mood Response + Topic Question
      const personaStyle = selectedPersona?.style || "Aku siap dengerin kamu.";
      const topicQuestion = `Kira-kira apa yang paling menggambarkan situasi kamu di topik ${category.title} ini?`;
      
      const responseText = `Terima kasih sudah sharing mood kamu! Kai mencatat kamu merasa ${moodData.label}. ${personaStyle} ${topicQuestion}`;
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
      speakText(responseText);
      
      // Transition to Subtopic phase
      setPhase('subtopic');
    }, 1000);
  };

  const handleQuickReply = (replyData) => {
    if (replyData.value === 'custom_input') {
      setActiveWidget(null);
      inputRef.current?.focus();
    } else {
      handleSendMessage(replyData.text);
      setActiveWidget(null);
    }
  };

  const handleGroundingComplete = (result) => {
    addBotMessage("Hebat! Kamu sudah menyelesaikan teknik grounding 5-4-3-2-1. Bagaimana rasanya? Apakah ada perubahan dalam perasaanmu setelah fokus pada inderamu?");
    setActiveWidget(null);
  };

  const triggerMoodWidget = () => {
    setActiveWidget('mood');
    setWidgetData({ question: "Bagaimana perasaanmu saat ini?" });
  };

  const triggerQuickReplyWidget = (replies) => {
    setActiveWidget('quick_reply');
    setWidgetData({ replies });
  };

  const triggerGroundingWidget = () => {
    setActiveWidget('grounding');
  };

  const handleSendMessage = async (manualText = null) => {
    const textToSend = manualText || input;
    if (!textToSend.toString().trim() || isTyping) return;

    // SECURITY: Rate limiting check (skip for intake phase options)
    if (phase === 'deepening' || phase === 'free_chat') {
      if (!rateLimiter.canSend()) {
        setRateLimitWarning(true);
        setTimeout(() => setRateLimitWarning(false), 5000);
        return;
      }
    }

    const newMessages = [...messages, { role: 'user', parts: [{ text: textToSend }] }];
    setMessages(newMessages);
    setInput('');
    setActiveWidget(null);
    setWidgetData(null);

    // PHASE 0: INITIAL HOOK
    if (phase === 'initial_hook') {
      setUserData(prev => ({ ...prev, initialHook: textToSend }));
      setPhase('intake');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const nameQ = INTAKE_FLOW[0].text;
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: nameQ }] }]);
        speakText(nameQ);
      }, 1000);
      return;
    }

    // PHASE 1: INTAKEG Service for enhanced detection
    const ragCrisisCheck = ragDetectCrisis(textToSend);
    const crisisCheck = ragCrisisCheck.isCrisis ? {
      level: ragCrisisCheck.level,
      priority: ragCrisisCheck.priority,
      keyword: ragCrisisCheck.keyword,
      color: ragCrisisCheck.priority >= 3 ? 'red' : ragCrisisCheck.priority >= 2 ? 'orange' : 'yellow',
      protocol: ragCrisisCheck.protocol
    } : { level: 'Rendah', priority: 1, keyword: null };

    if (crisisCheck.priority > currentRiskLevel.priority) {
      setCurrentRiskLevel(crisisCheck);
      setDetectedKeywords(prev => [...prev, crisisCheck.keyword]);

      // WIDGET: Trigger Grounding for moderate-high crisis
      if (crisisCheck.priority >= 2 && crisisCheck.priority < 3) {
        setTimeout(() => {
          setActiveWidget('grounding');
        }, 2000);
      }

      if (crisisCheck.priority >= 3) {
        setShowCrisisModal(true);
      }
    }

    // ENHANCEMENT: Answer validation for intake and deepening phases
    const isOptionButton = phase === 'intake' && INTAKE_FLOW[intakeIndex]?.type === 'option';

    // For free text input, do basic validation first (skip API for better UX)
    if (!isOptionButton && textToSend.length < 2) {
      addBotMessage("Jawabanmu terlalu singkat. Coba tulis sedikit lebih detail ya, supaya Kai bisa mengerti.");
      return;
    }

    // Check for gibberish answers (repeated characters, all same char, etc)
    const normalizedInput = textToSend.toLowerCase().replace(/\s/g, '');
    if (normalizedInput.length > 3 && new Set(normalizedInput).size < 3) {
      addBotMessage("Hmm, Kai nggak bisa baca jawabanmu. Bisa tulis dengan jelas?");
      return;
    }

    // Helper to extract name from sentence
    const extractName = (text) => {
      const lower = text.toLowerCase().trim();
      
      // Removed common prefixes
      const prefixes = [
        "nama saya adalah", "nama saya", "nama aku adalah", "nama aku", "namaku adalah", "namaku", 
        "panggil saya", "panggil aku", "panggil aja", "boleh panggil", "kenalin aku", "kenalin saya",
        "halo nama saya", "hai nama saya", "hallo nama saya", "hi nama saya",
        "halo saya", "hai saya", "hallo saya", "hi saya",
        "halo", "hai", "hallo", "hi"
      ];
      
      for (const prefix of prefixes) {
        if (lower.startsWith(prefix)) {
          // Return the rest of the string, capitalized properly
          const rawName = text.substring(prefix.length).trim();
          // Remove punctuation
          return rawName.replace(/[!.,?]+$/, ''); 
        }
      }
      
      // If no prefix match, just return the text (assuming they just typed their name)
      return text.trim();
    };

    // PHASE 1: INTAKE
    if (phase === 'intake') {
      const currentQ = INTAKE_FLOW[intakeIndex];
      let valueToSave = textToSend;
      
      // Clean name input if current question is name
      if (currentQ.id === 'name') {
        valueToSave = extractName(textToSend);
      }
      
      const updatedData = { ...userData, [currentQ.id]: valueToSave };
      setUserData(updatedData);

      let nextIndex = intakeIndex + 1;
      while (
        nextIndex < INTAKE_FLOW.length && 
        INTAKE_FLOW[nextIndex].condition && 
        !INTAKE_FLOW[nextIndex].condition(updatedData)
      ) {
        nextIndex++;
      }

      setIntakeIndex(nextIndex);

      if (nextIndex >= INTAKE_FLOW.length) {
        // ENHANCEMENT: Auto-select persona based on identity, langsung masuk ke subtopic
        const autoPersona = selectPersonaBasedOnIdentity(updatedData);
        setSelectedPersona(autoPersona);

        const updatedDataWithPersona = { ...updatedData, persona: autoPersona.id };
        setUserData(updatedDataWithPersona);

        setPhase('subtopic');
        setIntakeIndex(0);
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          
          const topicQ = `Terima kasih datanya, ${updatedData.name || 'teman'}! ✨ Nah, hari ini kamu mau ngobrolin tentang apa? Pilih salah satu topik di bawah atau ketik sendiri ya.`;
          
          setMessages(prev => [...prev, {
            role: 'model',
            parts: [{ text: topicQ }]
          }]);
          
          speakText(topicQ);
        }, 1500);
      } else {
        addBotMessage(INTAKE_FLOW[nextIndex].text);
      }
    } 
    // PHASE 2: SUBTOPIC
    else if (phase === 'subtopic') {
        const subtopic = textToSend;
        
        if (subtopic === 'Lainnya') {
          setPhase('subtopic_custom');
          addBotMessage(`Baik ${userData.name}, boleh ceritakan lebih spesifik?`);
          return;
        }
        
        const updatedData = { ...userData, subtopic };
        setUserData(updatedData);
        
        setPhase('deepening');
        setIsTyping(true);
        
        const subtopicPrompt = `
          User bernama ${userData.name} memilih kategori "${category.title}" dengan sub-topik "${subtopic}".
          Berikan respons singkat (2-3 kalimat) yang validasi perasaan mereka dan akhiri dengan pertanyaan: "${CATEGORY_QUESTIONS[category.id]?.[0] || 'Ceritakan lebih lanjut?'}"
        `;
        
        const aiResponse = await callGeminiAPI([
          { role: 'user', parts: [{ text: subtopicPrompt }] }
        ], systemPrompt, 3, userData.name || 'kawan');

        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: aiResponse }] }]);

        // TTS: Read AI response aloud if enabled
        speakText(aiResponse);

        // Mood widget removed from here (moved to pre-subtopic)
    }
    // PHASE 2.5: CUSTOM SUBTOPIC
    else if (phase === 'subtopic_custom') {
        const customSubtopic = textToSend;
        const updatedData = { ...userData, subtopic: customSubtopic, subtopic_custom: true };
        setUserData(updatedData);
        
        setPhase('deepening');
        setIsTyping(true);
        
        const customPrompt = `
          User bernama ${userData.name} mendeskripsikan situasinya sebagai: "${customSubtopic}".
          Berikan respons empati singkat dan akhiri dengan pertanyaan: "${CATEGORY_QUESTIONS[category.id]?.[0] || 'Ceritakan lebih lanjut?'}"
        `;
        
        const aiResponse = await callGeminiAPI([
          { role: 'user', parts: [{ text: customPrompt }] }
        ], systemPrompt, 3, userData.name || 'kawan');

        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: aiResponse }] }]);

        // TTS: Read AI response aloud if enabled
        speakText(aiResponse);

        // Mood widget removed from here (moved to pre-subtopic)
    }
    // PHASE 3: DEEPENING / FREE CHAT
    // Sekarang ini adalah percakapan bebas dengan AI - tidak ada batasan jumlah pertanyaan
    else if (phase === 'deepening' || phase === 'free_chat') {

      // DETEKSI: Apakah user ingin mengakhiri?
      const endSignals = [
        'tidak ada', 'nggak ada', 'ga ada', 'gak ada',
        'sudah cukup', 'udah cukup', 'cukup',
        'sudah lega', 'udah lega', 'lega',
        'itu saja', 'itu aja', 'segitu aja', 'segitu saja',
        'makasih', 'terima kasih', 'thanks',
        'tidak', 'nggak', 'enggak', 'engga', 'gak', 'ga'
      ];

      const lowerText = textToSend.toLowerCase().trim();
      const isShortResponse = lowerText.length < 20;
      const containsEndSignal = endSignals.some(signal => lowerText.includes(signal));

      // Jika respons pendek + mengandung signal akhir + sudah cukup banyak pesan
      if (isShortResponse && containsEndSignal && messages.length >= 8) {
        // User ingin mengakhiri - langsung end session
        handleEndChatSession();
        return;
      }

      // Langsung kirim ke AI untuk respons natural
      setIsTyping(true);

      // Hitung jumlah exchange (pesan user)
      const userMessageCount = messages.filter(m => m.role === 'user').length;
      const shouldAskIfMore = userMessageCount >= 5 && userMessageCount % 3 === 0; // Setiap 3 exchange setelah 5

      // ENHANCEMENT: Use RAG-enhanced prompt with clinical context
      let enhancedPrompt;

      try {
        // RAG: Get enhanced prompt with clinical context
        enhancedPrompt = await generateRAGEnhancedPrompt(textToSend);
      } catch (error) {
        console.error('[RAG] Error, falling back to base prompt:', error);
        enhancedPrompt = generateSystemPrompt();
      }

      // Tambah context ke system prompt untuk percakapan yang lebih panjang
      enhancedPrompt += `

      INSTRUKSI PERCAKAPAN NATURAL:
      - Ini adalah sesi curhat BEBAS. User boleh cerita sepanjang apapun.
      - JANGAN buru-buru mengakhiri percakapan.
      - Terus ajukan pertanyaan follow-up yang relevan untuk menggali lebih dalam.
      - Validasi perasaan user di setiap respons.
      - Gunakan teknik active listening: "Oh jadi kamu merasa...", "Kedengarannya berat ya..."
      - Jangan kasih solusi terlalu cepat. Fokus MENDENGARKAN dulu.

      ${shouldAskIfMore ? `
      PENTING: Setelah merespons, tanyakan dengan natural:
      "Ada hal lain yang ingin kamu ceritakan atau tanyakan?" atau variasi serupa.
      Ini bukan untuk mengakhiri chat, tapi memberi kesempatan user menambah cerita atau berpindah topik.
      ` : ''}

      Jumlah pesan user: ${userMessageCount}
      `;

      const aiResponse = await callGeminiAPI(newMessages, enhancedPrompt, 3, userData.name || 'kawan');
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: aiResponse }] }]);

      // TTS: Read AI response aloud if enabled
      speakText(aiResponse);

      // WIDGET: Trigger Quick Reply Cards ONLY when contextually appropriate
      // Only show when: AI asks a confirmation/choice question AND after enough messages
      const isConfirmationQuestion = aiResponse.includes('?') && (
        aiResponse.toLowerCase().includes('apakah') ||
        aiResponse.toLowerCase().includes('bagaimana menurutmu') ||
        aiResponse.toLowerCase().includes('apa yang kamu') ||
        aiResponse.toLowerCase().includes('mau cerita') ||
        aiResponse.toLowerCase().includes('bisa ceritakan') ||
        aiResponse.toLowerCase().includes('gimana') ||
        aiResponse.toLowerCase().includes('masih ada') ||
        aiResponse.toLowerCase().includes('ada lagi')
      );
      
      // Show quick reply only for confirmation questions, not every 4 messages
      if (isConfirmationQuestion && userMessageCount > 3 && !activeWidget) {
        setTimeout(() => {
          // Dynamic replies based on context
          const contextualReplies = aiResponse.toLowerCase().includes('masih ada') || aiResponse.toLowerCase().includes('ada lagi')
            ? [
                { text: "Ya, masih ada yang ingin aku ceritakan", value: "continue", icon: null },
                { text: "Aku rasa sudah cukup untuk sekarang", value: "enough", icon: null },
              ]
            : [
                { text: "Iya, benar sekali", value: "agree", icon: null },
                { text: "Hmm, kurang tepat sih", value: "disagree", icon: null },
                { text: "Bisa dijelaskan lebih lanjut?", value: "clarify", icon: null },
              ];
          setActiveWidget('quick_reply');
          setWidgetData({ replies: contextualReplies });
        }, 1500);
      }

      // Update phase ke free_chat setelah beberapa pesan
      if (phase === 'deepening' && messages.length >= 8) {
        setPhase('free_chat');
      }
    }
    // PHASE 5: FREE CHAT
    else {
      setIsTyping(true);
      const aiResponse = await callGeminiAPI(newMessages, systemPrompt, 3, userData.name || 'kawan');
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: aiResponse }] }]);

      // TTS: Read AI response aloud if enabled
      speakText(aiResponse);
    }
  };

  const renderInputArea = () => {
    // ENHANCEMENT: Session timeout warning
    if (sessionTimeoutWarning !== null) {
      return (
        <div className="flex gap-3 justify-center p-4 items-center text-blue-600 w-full bg-blue-50 rounded-2xl border border-blue-200">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium text-sm">
            Sesi akan berakhir dalam {sessionTimeoutWarning} menit karena tidak ada aktivitas. Ketuk atau ketik sesuatu untuk melanjutkan!
          </span>
        </div>
      );
    }

    // SECURITY: Rate limit warning
    if (rateLimitWarning) {
      return (
        <div className="flex gap-3 justify-center p-4 items-center text-amber-600 w-full bg-amber-50 rounded-2xl border border-amber-200">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium text-sm">
            Mohon tunggu sebentar ya, Kai nggak mau kewalahan kok. Coba lagi dalam 1 menit.
          </span>
        </div>
      );
    }

    if (phase === 'saving') {
      return (
        <div className="flex gap-3 justify-center p-4 items-center text-slate-500 animate-pulse w-full bg-slate-50 rounded-2xl border border-slate-200">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="font-medium text-sm">Menyimpan sesi ceritamu...</span>
        </div>
      );
    }

    if (phase === 'finished') {
       return (
          <div className="flex flex-col items-center gap-3 w-full p-4 bg-green-50 rounded-3xl border border-green-100">
            <div className="flex items-center gap-2 text-green-700 font-bold mb-1">
              <CheckCircle2 size={20} />
              <span>Sesi Selesai</span>
            </div>
            <button 
              onClick={() => setView('landing')} 
              className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md flex items-center gap-2 w-full justify-center"
            >
              <Home size={18} /> Kembali ke Beranda
            </button>
          </div>
       );
    }

    if (phase === 'offering_account') {
      if (isCreatingAccount) {
        // Form input email
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="nama@email.com"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                className="flex-1 bg-slate-100 rounded-xl px-4 py-3 outline-none border-2 border-transparent focus:border-orange-300 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMagicLink()}
              />
              <button
                onClick={handleSendMagicLink}
                disabled={!accountEmail || isTyping}
                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                <Mail size={18} />
                Kirim Link
              </button>
            </div>
            <button
              onClick={() => { setIsCreatingAccount(false); setPhase('finished'); addBotMessage('Baik, tidak masalah! Tetap semangat ya! 🤗'); }}
              className="text-slate-400 text-sm hover:text-slate-600"
            >
              Lewati, tidak perlu akun
            </button>
          </div>
        );
      }
      
      return (
        <div className="flex gap-4 justify-center w-full">
          <button onClick={() => handleAccountCreation(true)} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md flex items-center gap-2">
            <Mail size={18} />
            Ya, Buat Akun
          </button>
          <button onClick={() => handleAccountCreation(false)} className="bg-slate-100 text-slate-500 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">Tidak, Terima Kasih</button>
        </div>
      );
    }

    if (phase === 'ending') {
      return (
        <div className="flex gap-3 justify-center p-4 items-center text-slate-500 animate-pulse w-full bg-slate-50 rounded-2xl border border-slate-200">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="font-medium text-sm">Menyimpan percakapan...</span>
        </div>
      );
    }
    
    if (phase === 'subtopic') {
        const topics = SUB_TOPICS[category.id] || ["Lainnya"];
        return (
          <div className="flex flex-wrap gap-2 justify-center p-2">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => handleSendMessage(t)}
                className="bg-orange-100 text-orange-700 hover:bg-orange-500 hover:text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm border border-orange-200 text-sm"
              >
                {t}
              </button>
            ))}
          </div>
        );
    }

    if (phase === 'intake' && intakeIndex < INTAKE_FLOW.length) {
      const currentQ = INTAKE_FLOW[intakeIndex];
      if (currentQ.type === 'option') {
        return (
          <div className="flex flex-wrap gap-2 justify-center p-2">
            {currentQ.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSendMessage(opt)}
                disabled={isTyping}
                className="bg-orange-100 text-orange-700 hover:bg-orange-500 hover:text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm border border-orange-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {opt}
              </button>
            ))}
          </div>
        );
      }
    }

    // WIDGET DISPLAY - Show active widgets
    if (activeWidget) {
      if (activeWidget === 'mood') {
        return (
          <div className="w-full max-w-md mx-auto">
            <MoodSlider
              question={widgetData?.question || "Bagaimana perasaanmu saat ini?"}
              onMoodSelect={handleMoodSelect}
            />
          </div>
        );
      }
      if (activeWidget === 'quick_reply') {
        return (
          <div className="w-full">
            <QuickReplyCards
              replies={widgetData?.replies || []}
              onSelect={handleQuickReply}
              title="Pilih respon:"
            />
          </div>
        );
      }
      if (activeWidget === 'grounding') {
        return (
          <div className="w-full max-w-lg mx-auto">
            <GroundingCard onComplete={handleGroundingComplete} />
          </div>
        );
      }
    }

    // Input area biasa + tombol "Selesai" saat free_chat
    const showEndButton = (phase === 'free_chat' || phase === 'deepening') && messages.length >= 8;
    
    return (
      <div className="flex flex-col gap-2 w-full">
        
        {/* Gen Z UX: Quick Starters */}
        {phase === 'initial_hook' && (
          <div className="flex flex-wrap gap-2 mb-2 items-center justify-center">
            {["Aku lagi sedih 😢", "Aku stres belajar 📚", "Aku butuh teman cerita 💬"].map((starter) => (
              <button 
                key={starter}
                onClick={() => handleSendMessage(starter)}
                className="bg-violet-50 text-violet-600 px-4 py-2.5 rounded-full text-xs font-semibold hover:bg-violet-100 hover:scale-105 transition-all border border-violet-100 shadow-sm"
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {/* Gen Z UX: AI Share Quote */}
        {phase === 'finished' && finalQuote && (
          <div className={`w-full p-4 rounded-xl border ${isNightMode ? 'bg-indigo-900/30 border-indigo-800' : 'bg-indigo-50 border-indigo-100'} text-center mt-2`}>
            <p className={`text-sm italic font-medium mb-3 ${isNightMode ? 'text-indigo-200' : 'text-indigo-800'}`}>"{finalQuote}"</p>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Pesan dari Kai',
                    text: `"${finalQuote}" - Kai (Kancah Ate)`,
                  }).catch(console.error);
                } else {
                  alert('Fitur share tidak didukung di browser ini.');
                }
              }}
              className="mx-auto bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
            >
              Bagikan Pesan Kai
            </button>
          </div>
        )}

        {/* Accessibility Controls */}
        <div className="flex items-center justify-end gap-2 mb-1">
          {/* Gen Z UX: Sound Effect Toggle */}
          <button
            onClick={() => setIsTypingSoundEnabled(!isTypingSoundEnabled)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${isTypingSoundEnabled ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500'}`}
            title={isTypingSoundEnabled ? "Matikan suara ketikan" : "Aktifkan suara ketikan"}
          >
            {isTypingSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>SFX {isTypingSoundEnabled ? 'Aktif' : 'Mati'}</span>
          </button>
          
          {speechSupported && (
            <button
              onClick={() => setIsTTSEnabled(!isTTSEnabled)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${isTTSEnabled ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500'}`}
              title={isTTSEnabled ? "Matikan pembacaan suara" : "Aktifkan pembacaan suara"}
            >
              {isTTSEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>Suara {isTTSEnabled ? 'Aktif' : 'Mati'}</span>
            </button>
          )}
        </div>
        
        <div className="flex gap-2 w-full">
          {/* Microphone Button for STT */}
          {speechSupported && (
            <button 
              onClick={toggleListening}
              disabled={isTyping || phase === 'finished'}
              className={`p-3 rounded-2xl transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-slate-100 text-slate-500 hover:bg-violet-100 hover:text-violet-600'
              } disabled:opacity-50`}
              title={isListening ? "Berhenti mendengarkan" : "Bicara untuk mengetik"}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
          
          <input 
            ref={inputRef}
            type={phase === 'intake' && INTAKE_FLOW[intakeIndex]?.type === 'date' ? "date" : "text"}
            placeholder={
              isListening ? "🎤 Sedang mendengarkan..." :
              phase === 'subtopic_custom' ? "Contoh: Merasa tidak dihargai..." :
              "Ketik ceritamu di sini..."
            } 
            className={`flex-1 bg-slate-100 rounded-2xl px-4 py-3 outline-none border-2 border-transparent focus:border-orange-200 text-sm transition-all ${isListening ? 'border-red-300 bg-red-50' : ''}`}
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
            disabled={isTyping || phase === 'finished'}
          />
          <button 
            onClick={() => handleSendMessage()} 
            disabled={isTyping || !input.trim() || phase === 'finished'}
            className="bg-orange-500 text-white p-3 rounded-2xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Tombol Selesai Bercerita - muncul setelah 8+ pesan */}
        {showEndButton && (
          <button
            onClick={handleEndChatSession}
            className="w-full py-2 text-sm text-slate-400 hover:text-orange-500 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Flag size={14} />
            Sudah selesai bercerita? Klik di sini untuk mengakhiri sesi
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-2xl mx-auto px-4 py-6 h-[85vh] flex flex-col ${isNightMode ? 'bg-slate-900 text-slate-200 rounded-[2rem]' : ''}`}>
      {/* Crisis Modal */}
      <CrisisModal 
        isOpen={showCrisisModal} 
        onClose={() => setShowCrisisModal(false)} 
        riskLevel={currentRiskLevel.level}
        userName={userData.name}
      />
      
      <div className={`border-b p-4 flex items-center justify-between rounded-t-[2rem] shadow-sm ${isNightMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isNightMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-50 hover:bg-orange-50'}`}><ArrowLeft size={20} /></button>
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className={`p-2 rounded-xl ${
              category.color === 'violet' ? 'bg-violet-100 text-violet-600' :
              category.color === 'rose' ? 'bg-rose-100 text-rose-600' :
              category.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
              category.color === 'amber' ? 'bg-amber-100 text-amber-600' :
              'bg-blue-100 text-blue-600'
            }`}
          >
            {category.icon}
          </motion.div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Konseling: {category.title}</h4>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${phase === 'finished' ? 'bg-green-500' : 'bg-violet-500 animate-pulse'}`}></span>
              <span className="text-[10px] text-slate-500 font-medium">
                {phase === 'intake' ? 'Pendataan Awal' : phase === 'subtopic' ? 'Pilih Topik' : phase === 'deepening' ? 'Sesi Curhat' : 'Menyimpan Data'}
              </span>
            </div>
          </div>
        </div>
        
        {currentRiskLevel.priority > 1 && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
            currentRiskLevel.level === 'Kritis' ? 'bg-red-100 text-red-700' :
            currentRiskLevel.level === 'Tinggi' ? 'bg-orange-100 text-orange-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            <AlertTriangle size={12} />
            {currentRiskLevel.level}
          </div>
        )}
      </div>

      {isRecovering && (
        <div className="flex-1 flex items-center justify-center bg-slate-50/50 border-x border-slate-100">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memulihkan sesi...</p>
          </div>
        </div>
      )}

      {!isRecovering && (
        <div 
          ref={scrollRef} 
          className={`flex-1 overflow-y-auto p-6 flex flex-col gap-4 border-x border-slate-100 transition-colors duration-1000 ${
            currentRiskLevel.level === 'Kritis' ? 'bg-red-50/40' :
            currentRiskLevel.level === 'Tinggi' ? 'bg-orange-50/40' :
            currentRiskLevel.level === 'Sedang' ? 'bg-yellow-50/40' :
            'bg-slate-50/50'
          }`}
        >
        {messages.map((msg, i) => (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group relative`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm whitespace-pre-line leading-relaxed relative ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-none' : isNightMode ? 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700' : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'}`}>
                <span className="text-[10px] font-bold block mb-1 opacity-50 uppercase">{msg.role === 'model' ? 'Kai' : 'User'}</span>
              {msg.parts[0].text}
              
              {/* Gen Z UX: Reaction Badge */}
              {msg.reaction && msg.role === 'model' && (
                <div className={`absolute -bottom-3 -right-2 border shadow-sm rounded-full px-2 py-0.5 text-xs z-10 ${isNightMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  {msg.reaction}
                </div>
              )}
            </div>
            
            {/* Gen Z UX: Reaction Selector on Hover */}
            {msg.role === 'model' && phase !== 'finished' && (
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 -right-16 shadow-md rounded-full px-2 py-1 flex gap-1 z-10 border text-xs ${isNightMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                {['❤️', '😢', '💪'].map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => {
                      setMessages(prev => prev.map((m, idx) => idx === i ? { ...m, reaction: m.reaction === emoji ? null : emoji } : m));
                    }}
                    className={`hover:scale-125 transition-transform ${msg.reaction === emoji ? (isNightMode ? 'bg-slate-700' : 'bg-slate-100') + ' rounded-full' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 px-4 rounded-2xl flex gap-1.5 items-center border border-slate-100 shadow-sm">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
      </div>
      )}

      <div className={`p-4 rounded-b-[2rem] border shadow-lg z-10 ${isNightMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
        {renderInputArea()}
      </div>
    </div>
  );
}

export default ChatRoomView;
