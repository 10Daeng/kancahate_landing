'use client';

// ============================================================
// CHAT ROOM VIEW — Orchestrator Utama
// Skema baru: Intake → Listening (diagnostik) → Choice → Venting / Advice
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ArrowLeft, Loader2, Home, AlertTriangle, Flag,
  Mic, MicOff, Volume2, VolumeX, BookOpen, Lightbulb, Quote,
  Phone, MessageCircle, Users, Heart, RotateCcw
} from 'lucide-react';
import { useSession } from 'next-auth/react';

import { createOrUpdateUser, createSession, updateSession, getUserProfile } from '../../services/analyticsService';
import { useSpeech } from './hooks/useSpeech';
import { useChatSession } from './hooks/useChatSession';
import {
  INTAKE_FLOW, DIAGNOSTIC_QUESTIONS, EDUCATIONAL_CONTENT,
  SUB_TOPICS, selectPersonaBasedOnIdentity, formatTime
} from './constants/chatConfig';
import CrisisModal from './CrisisModal';
import GroundingCard from './widgets/GroundingCard';
import CalmRoom from './CalmRoom';

// --- Rate Limiter ---
const createRateLimiter = (max = 15, windowMs = 60000) => {
  let timestamps = [];
  return {
    canSend: () => {
      const now = Date.now();
      timestamps = timestamps.filter(t => now - t < windowMs);
      if (timestamps.length < max) { timestamps.push(now); return true; }
      return false;
    }
  };
};

// --- SERVER-PROXIED AI CALL ---
// Semua logika sensitif (system prompt, crisis detection, API key)
// dijalankan di server melalui /api/chat
async function callChatAPI({ history, userData, category, currentRiskLevel, mode, action = 'chat', question, answer, phase }) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, userData, category, currentRiskLevel, mode, action, question, answer, phase }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { text: errData.text || 'Maaf, terjadi kesalahan. Coba kirim ulang ya.', crisisLevel: null, isError: true };
    }
    return await res.json();
  } catch (err) {
    console.error('[callChatAPI] Network error:', err);
    return { text: 'Koneksi terputus. Periksa internet kamu dan coba lagi ya.', crisisLevel: null, isError: true };
  }
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function ChatRoomView({ category, onBack, initialData }) {
  const { data: sessionData, status } = useSession();
  const rateLimiter = useRef(createRateLimiter(15, 60000)).current;

  // --- Session & Anon ID ---
  const [sessionId] = useState(() => {
    if (initialData?.resumeDbSessionId) return `session_${Date.now()}_resume_${initialData.resumeDbSessionId}`;
    let id = localStorage.getItem('kancahate_session_id');
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('kancahate_session_id', id);
    }
    return id;
  });

  const [anonUserId] = useState(() => {
    let id = localStorage.getItem('kancahate_anon_id');
    if (!id) {
      id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('kancahate_anon_id', id);
    }
    return id;
  });

  // --- Core State ---
  const [messages, setMessages] = useState(() => {
    if (initialData?.history && initialData.history.length > 0) {
      return [...initialData.history, {
        role: 'model',
        parts: [{ text: "Halo lagi! Senang kamu kembali. Kamu mau melanjutkan cerita tentang sesi ini, atau mau mulai topik obrolan baru?" }],
        timestamp: new Date().toISOString()
      }];
    }
    return [{
      role: 'model',
      parts: [{ text: "Halo! Udah dapet posisi duduk yang nyaman buat chatting hari ini? Kenalin aku Kai 👋\n\nDi ruang chat ini aman ya, percakapan kita rahasia. Kamu juga nggak perlu buru-buru balas, ambil waktu aja kalau butuh mikir sebelum ngetik." }],
      timestamp: new Date().toISOString()
    }];
  });
  const [phase, setPhase] = useState(initialData?.history ? 'resume_choice' : 'initial_hook');
  const [intakeIndex, setIntakeIndex] = useState(0);
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [chatMode, setChatMode] = useState(null); // 'venting' | 'advice' | 'advice_followup'
  const [userData, setUserData] = useState(initialData || {});
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isRecovering, setIsRecovering] = useState(!initialData?.history);
  const [existingDbSessionId, setExistingDbSessionId] = useState(initialData?.resumeDbSessionId || null);

  // --- UI State ---
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [finalQuote, setFinalQuote] = useState('');

  // --- Crisis State ---
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [showCalmRoom, setShowCalmRoom] = useState(false);
  const [currentRiskLevel, setCurrentRiskLevel] = useState({ level: 'Rendah', priority: 1 });
  const [detectedKeywords, setDetectedKeywords] = useState([]);

  // --- Educational content index ---
  const [eduIndex, setEduIndex] = useState(0);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const sessionStartTimeRef = useRef(new Date());

  // --- Hooks ---
  const {
    isListening, isTTSEnabled, setIsTTSEnabled,
    speechSupported, startListening, stopListening, speakText
  } = useSpeech();

  const { clearSession } = useChatSession({
    sessionId,
    anonUserId,
    phase, messages, userData,
    diagnosticIndex, currentRiskLevel, detectedKeywords,
    categoryTitle: category?.title,
    isRecovering,
    onRestore: (restored) => {
      if (restored) {
        setPhase(restored.phase);
        setMessages(restored.messages);
        setUserData(restored.userData);
        setDiagnosticIndex(restored.diagnosticIndex);
        setCurrentRiskLevel(restored.currentRiskLevel);
        setDetectedKeywords(restored.detectedKeywords);
      }
      setIsRecovering(false);
    }
  });

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // Focus input
  useEffect(() => {
    if (!isTyping && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isTyping, phase]);

  // Mark as done recovering if no draft
  useEffect(() => {
    const timer = setTimeout(() => setIsRecovering(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Check logged in user
  useEffect(() => {
    if (status === 'loading') return;
    const user = sessionData?.user;
    if (!user) return;
    setLoggedInUser(user);

    getUserProfile().then(({ success, data: profile }) => {
      if (success && profile) {
        setUserData(prev => ({
          ...prev,
          email: user.email,
          name: profile.name,
          age: profile.age,
          education_status: profile.educationStatus || profile.education_status,
        }));
        const autoPersona = selectPersonaBasedOnIdentity(profile);
        setUserData(prev => ({ ...prev, persona: autoPersona.id }));
        setPhase('subtopic');
        setIntakeIndex(INTAKE_FLOW.length);
        setMessages([{
          role: 'model',
          parts: [{ text: `Halo lagi, ${profile.name}! 👋 Senang ketemu kamu lagi. Hari ini mau ngobrolin tentang apa?` }],
          timestamp: new Date().toISOString()
        }]);
      }
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // --- Helper: tambah pesan bot ---
  const addBotMessage = useCallback((text, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const msg = { role: 'model', parts: [{ text }], timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, msg]);
      speakText(text);
    }, delay);
  }, [speakText]);

  const triggerEmergencyHalt = useCallback(() => {
    setPhase('halt');
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: "Dari kata-kata yang kamu ketik, sistemku menangkap bahwa kamu sedang memikul rasa sakit yang sangat luar biasa saat ini. Meski aku hanya sebuah program, aku diciptakan oleh orang-orang yang benar-benar peduli pada keselamatanmu." }],
        timestamp: new Date().toISOString()
      }]);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'model',
          parts: [{ text: "Di titik yang terasa paling gelap ini, bernapaslah pelan-pelan. Tarik napas... dan hembuskan. Dunia mungkin sedang terasa sangat riuh, tapi tolong izinkan hatimu bersandar sejenak." }],
          timestamp: new Date().toISOString()
        }]);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            role: 'model',
            parts: [{ text: "Karena ruang chat ini anonim, aku tidak tahu kamu ada di mana dan tidak bisa memanggilkan bantuan langsung. Tolong, jangan lewati malam ini sendirian. Bisakah kamu memilih salah satu tombol di bawah ini?" }],
            timestamp: new Date().toISOString()
          }]);
          
          // Timeout otomatis 3 menit
          setTimeout(() => {
            setPhase(p => {
              if (p === 'halt') {
                setMessages(prevMsg => [...prevMsg, {
                  role: 'model',
                  parts: [{ text: "Pesanmu ini sudah kusimpan dengan aman dan diberi tanda prioritas tinggi agar segera dibaca oleh konselor manusia. Jaga dirimu baik-baik ya." }],
                  timestamp: new Date().toISOString()
                }]);
                return 'finished';
              }
              return p;
            });
          }, 180000);
        }, 2000);
      }, 2000);
    }, 1500);
  }, []);

  // --- Helper: proses hasil deteksi krisis dari server ---
  const processCrisisResult = useCallback((crisis) => {
    if (!crisis || !crisis.priority) return;
    if (crisis.priority > currentRiskLevel.priority) {
      setCurrentRiskLevel(crisis);
      if (crisis.keyword) setDetectedKeywords(prev => [...prev, crisis.keyword]);
      if (crisis.priority >= 4) {
        setIsCrisisMode(true);
        triggerEmergencyHalt();
      } else if (crisis.priority === 3) {
        setShowCrisisModal(true);
      } else if (crisis.priority === 2) {
        setShowGrounding(true);
      }
    }
  }, [currentRiskLevel.priority, triggerEmergencyHalt]);

  // --- Helper: name extractor ---
  const extractName = (text) => {
    const lower = text.toLowerCase().trim();
    const prefixes = [
      "nama saya adalah", "nama saya", "nama aku adalah", "nama aku",
      "namaku adalah", "namaku", "panggil saya", "panggil aku",
      "halo", "hai", "hallo", "hi"
    ];
    for (const prefix of prefixes) {
      if (lower.startsWith(prefix)) {
        return text.substring(prefix.length).trim().replace(/[!.,?]+$/, '');
      }
    }
    return text.trim();
  };

  // --- Konten edukatif untuk jeda ---
  const showEducationalCard = () => {
    const contents = EDUCATIONAL_CONTENT[category?.id] || EDUCATIONAL_CONTENT.general;
    const content = contents[eduIndex % contents.length];
    setEduIndex(prev => prev + 1);
    return content;
  };

  // --- MAIN MESSAGE HANDLER ---
  const handleSendMessage = async (manualText = null) => {
    const textToSend = (manualText || input).toString().trim();
    if (!textToSend || isTyping) return;

    if ((phase === 'listening' || phase === 'free_chat' || phase === 'venting' || phase === 'advice_followup') && !rateLimiter.canSend()) {
      setRateLimitWarning(true);
      setTimeout(() => setRateLimitWarning(false), 5000);
      return;
    }

    // =============================================
    // FASE: RESUME CHOICE
    // =============================================
    if (phase === 'resume_choice') {
      if (textToSend === 'Lanjutkan Cerita') {
        const userMsg = { role: 'user', parts: [{ text: textToSend }], timestamp: new Date().toISOString() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        
        // Cek riwayat untuk mengetahui mode sebelumnya
        const isAdvice = initialData?.history?.some(m => m.role === 'model' && m.parts[0].text.includes('Saran tadi ada yang kira-kira bisa kamu coba'));
        const nextPhase = isAdvice ? 'advice_followup' : 'venting';
        setChatMode(isAdvice ? 'advice' : 'venting');
        setPhase(nextPhase);
        
        addBotMessage("Sip, Kai siap dengerin kelanjutannya. Boleh dilanjut ceritanya ya.", 1000);
      } else if (textToSend === 'Mulai Baru') {
        handleNewSession(true); // pass true to skip confirmation
      }
      return;
    }

    const userMsg = { role: 'user', parts: [{ text: textToSend }], timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    // Crisis detection sekarang dijalankan di server saat memanggil /api/chat

    // =============================================
    // FASE 0: INITIAL HOOK
    // =============================================
    if (phase === 'initial_hook') {
      setUserData(prev => ({ ...prev, initialHook: textToSend }));
      setPhase('intake');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: 'model',
          parts: [{ text: INTAKE_FLOW[0].text }],
          timestamp: new Date().toISOString()
        }]);
      }, 1000);
      return;
    }

    // =============================================
    // FASE 1: INTAKE (nama, usia, status)
    // =============================================
    if (phase === 'intake') {
      const currentQ = INTAKE_FLOW[intakeIndex];
      let valueToSave = textToSend;

      if (currentQ.id === 'name') {
        valueToSave = extractName(textToSend);
        if (valueToSave.length < 2) {
          addBotMessage("Hmm, nama panggilanmu belum Kai tangkap. Coba tulis lagi ya? 😊");
          return;
        }
      }

      if (currentQ.id === 'age') {
        const numMatch = textToSend.match(/\d+/);
        const parsedAge = numMatch ? parseInt(numMatch[0]) : null;
        if (!parsedAge || parsedAge < 8 || parsedAge > 80) {
          addBotMessage("Hmm, Kai kurang bisa baca umurnya. Tulis dalam angka ya, contoh: \"17\" atau \"20 tahun\" 🙏");
          return;
        }
        valueToSave = parsedAge;
      }

      const updatedData = { ...userData, [currentQ.id]: valueToSave };
      setUserData(updatedData);

      const nextIndex = intakeIndex + 1;
      setIntakeIndex(nextIndex);

      if (nextIndex >= INTAKE_FLOW.length) {
        // Intake selesai → pilih persona otomatis → ke subtopic
        const autoPersona = selectPersonaBasedOnIdentity(updatedData);
        setUserData({ ...updatedData, persona: autoPersona.id });
        setPhase('subtopic');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            role: 'model',
            parts: [{ text: `Makasih ya, ${updatedData.name}! ✨ Hari ini kamu mau cerita tentang apa? Pilih salah satu atau ketik sendiri.` }],
            timestamp: new Date().toISOString()
          }]);
        }, 1200);
      } else {
        addBotMessage(INTAKE_FLOW[nextIndex].text, 900);
      }
      return;
    }

    // =============================================
    // FASE 1.5: SUBTOPIC
    // =============================================
    if (phase === 'subtopic') {
      let subtopic = textToSend;
      if (subtopic === 'Lainnya') {
        setPhase('subtopic_custom');
        addBotMessage(`Baik ${userData.name || 'teman'}, boleh ceritakan lebih spesifik?`);
        return;
      }
      setUserData(prev => ({ ...prev, subtopic }));
      setPhase('listening');
      setDiagnosticIndex(0);

      const questions = DIAGNOSTIC_QUESTIONS[category?.id] || DIAGNOSTIC_QUESTIONS.general;
      addBotMessage(`Oke, ${userData.name || 'teman'}, kita mulai dari sini ya. ${questions[0]}`, 1200);
      return;
    }

    if (phase === 'subtopic_custom') {
      setUserData(prev => ({ ...prev, subtopic: textToSend, subtopic_custom: true }));
      setPhase('listening');
      setDiagnosticIndex(0);
      const questions = DIAGNOSTIC_QUESTIONS[category?.id] || DIAGNOSTIC_QUESTIONS.general;
      addBotMessage(questions[0], 1200);
      return;
    }

    // =============================================
    // FASE 2: LISTENING (pertanyaan diagnostik hardcoded)
    // =============================================
    if (phase === 'listening') {
      const questions = DIAGNOSTIC_QUESTIONS[category?.id] || DIAGNOSTIC_QUESTIONS.general;
      const nextDiagIdx = diagnosticIndex + 1;

      if (nextDiagIdx < questions.length) {
        // Masih ada pertanyaan diagnostik
        setDiagnosticIndex(nextDiagIdx);

        // Setiap 2 pertanyaan, tampilkan konten edukatif sebagai "jeda"
        if (nextDiagIdx % 2 === 0) {
          const eduContent = showEducationalCard();
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev,
              {
                role: 'model',
                parts: [{ text: eduContent.text }],
                timestamp: new Date().toISOString(),
                isEducational: true,
                eduType: eduContent.type
              },
              {
                role: 'model',
                parts: [{ text: questions[nextDiagIdx] }],
                timestamp: new Date().toISOString()
              }
            ]);
            speakText(questions[nextDiagIdx]);
          }, 1500);
        } else {
          addBotMessage(questions[nextDiagIdx], 1000);
        }
      } else {
        // Semua pertanyaan diagnostik selesai → tawarkan pilihan mode
        setPhase('choice');
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const choiceMsg = `Dari obrolan chat kita hari ini, ${userData.name || 'kamu'} lagi butuh apa nih dari Kai? 🤔\n\n— Pengen didengerin aja tanpa dihakimi\n— Butuh saran atau cari jalan keluar bareng-bareng`;
          setMessages(prev => [...prev, {
            role: 'model',
            parts: [{ text: choiceMsg }],
            timestamp: new Date().toISOString(),
            isChoice: true
          }]);
        }, 1500);
      }
      return;
    }

    // =============================================
    // FASE 3: CHOICE (pilih mode)
    // Ditangani oleh tombol — jika user ketik, arahkan ke pilihan
    // =============================================
    if (phase === 'choice') {
      const lower = textToSend.toLowerCase();
      if (lower.includes('saran') || lower.includes('solusi') || lower.includes('bantu')) {
        handleModeChoice('advice');
      } else {
        handleModeChoice('venting');
      }
      return;
    }

    // =============================================
    // FASE 4a: VENTING MODE (curhat bebas — AI pendek, tanpa saran)
    // =============================================
    if (phase === 'venting') {
      setIsTyping(true);
      const result = await callChatAPI({ history: newMessages, userData, category, currentRiskLevel, mode: 'venting' });
      setIsTyping(false);
      processCrisisResult(result.crisisLevel);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: result.text }], timestamp: new Date().toISOString() }]);
      speakText(result.text);
      return;
    }

    // =============================================
    // FASE 4b: ADVICE FOLLOWUP (iterasi setelah saran pertama)
    // =============================================
    if (phase === 'advice_followup') {
      setIsTyping(true);
      const result = await callChatAPI({ history: newMessages, userData, category, currentRiskLevel, mode: 'advice_followup' });
      setIsTyping(false);
      processCrisisResult(result.crisisLevel);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: result.text }], timestamp: new Date().toISOString() }]);
      speakText(result.text);
      return;
    }
  };

  // --- Pilih Mode Chat ---
  const handleModeChoice = async (mode) => {
    const userLabel = mode === 'venting' ? 'Aku mau cerita aja dulu 😊' : 'Aku mau minta saran dari Kai 💡';
    const userMsg = { role: 'user', parts: [{ text: userLabel }], timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setChatMode(mode);

    if (mode === 'venting') {
      setPhase('venting');
      addBotMessage(`Oke, Kai dengerin sepenuhnya. Cerita aja ya, nggak ada yang dihakimi di sini. 💙\n\nMau lanjut dari mana?`, 1000);
    } else {
      // mode === 'advice'
      setPhase('advice_followup');
      setIsTyping(true);

      const allMessages = [...messages, userMsg];
      const result = await callChatAPI({ history: allMessages, userData, category, currentRiskLevel, mode: 'advice' });
      setIsTyping(false);
      processCrisisResult(result.crisisLevel);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: result.text }], timestamp: new Date().toISOString() }]);
      speakText(result.text);

      // Setelah saran, tanyakan kesesuaian
      setTimeout(() => {
        addBotMessage(`Gimana, ${userData.name || 'teman'}? Saran tadi ada yang kira-kira bisa kamu coba, atau ada yang terasa sulit?`, 2000);
      }, 3000);
    }
  };

  // --- Akhiri Sesi ---
  const handleEndSession = async () => {
    setPhase('ending');
    setIsTyping(true);

    try {
      const { userId: dbUserId, isNewUser } = await createOrUpdateUser(userData);
      if (dbUserId) {
        const userMsgCount = messages.filter(m => m.role === 'user').length;
        const dur = Math.floor((Date.now() - sessionStartTimeRef.current.getTime()) / 1000);
        
        if (existingDbSessionId) {
          // Update the existing session instead of creating a new one
          await updateSession(existingDbSessionId, {
            chat_history: messages,
            message_count: messages.length,
            user_message_count: userMsgCount,
            summary: messages.slice(-3).map(m => m.parts[0]?.text?.substring(0, 100)).join(' ') || '',
            detected_keywords: detectedKeywords.length > 0 ? detectedKeywords : null,
            status: 'Selesai',
            ended_at: new Date().toISOString(),
            duration_seconds: dur,
            completion_rate: 100
          });
        } else {
          // Create new session
          const sessionRec = await createSession({
            userId: dbUserId,
            category: category?.id,
            subtopic: userData.subtopic,
            subtopic_custom: userData.subtopic_custom || false,
            persona_id: userData.persona || 'coach',
            risk_level: currentRiskLevel.level,
            risk_priority: currentRiskLevel.priority || 1,
            chat_history: messages,
            message_count: messages.length,
            user_message_count: userMsgCount,
            summary: messages.slice(-3).map(m => m.parts[0]?.text?.substring(0, 100)).join(' ') || '',
            detected_keywords: detectedKeywords.length > 0 ? detectedKeywords : null,
            started_at: sessionStartTimeRef.current.toISOString(),
            status: 'Selesai',
            metadata: {
              category_title: category?.title,
              chat_mode: chatMode,
              is_new_user: isNewUser,
              completed_at: new Date().toISOString()
            }
          });
          if (sessionRec) {
            await updateSession(sessionRec.id, { ended_at: new Date().toISOString(), duration_seconds: dur, completion_rate: 100 });
          }
        }
      }
    } catch (err) {
      console.error('Error saving session:', err);
    }

    setIsTyping(false);
    setPhase('finished');

    const closingMsg = loggedInUser
      ? `Gimana rasanya setelah ngetik dan ngeluarin unek-unek tadi, ${userData.name || 'Teman'}? 💙\n\nKita sudahi dulu sesi chat hari ini ya. Ceritamu sudah tersimpan aman. Nanti kalau ada yang kepikiran lagi, feel free buat tinggalkan pesan di sini.`
      : `Gimana rasanya setelah ngetik dan ngeluarin unek-unek tadi, ${userData.name || 'Teman'}? 💙\n\nKita sudahi dulu sesi chat hari ini ya. Ceritamu tersimpan aman. Mau buat akun supaya bisa lihat riwayat chat kapan saja?`;

    setMessages(prev => [...prev, {
      role: 'model',
      parts: [{ text: closingMsg }],
      timestamp: new Date().toISOString()
    }]);

    // Generate AI Quote via server
    try {
      const quoteHistory = [
        ...messages.slice(-5),
        { role: 'user', parts: [{ text: `Buatkan SATU kalimat penyemangat singkat yang hangat untuk ${userData.name || 'seseorang'} yang baru selesai berbagi cerita tentang "${userData.subtopic || category?.title}". Jangan pakai tanda kutip atau emoji berlebihan.` }] }
      ];
      const result = await callChatAPI({ history: quoteHistory, userData, category, currentRiskLevel, mode: 'quote' });
      setFinalQuote(result.text || "Kamu sudah luar biasa berani hari ini. Langkah kecilmu sangat berarti!");
    } catch (_) {
      setFinalQuote("Kamu sudah luar biasa berani hari ini. Langkah kecilmu sangat berarti!");
    }
  };

  const handleNewSession = async (skipConfirm = false) => {
    if (!skipConfirm) {
      const confirmed = window.confirm('⚠️ Mulai percakapan baru?\n\nSemua riwayat percakapan saat ini akan dihapus dari perangkat ini.');
      if (!confirmed) return;
    }
    await clearSession();
  };

  // ============================================================
  // RENDER INPUT AREA
  // ============================================================
  const renderInputArea = () => {
    if (phase === 'resume_choice') {
      return (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleSendMessage('Lanjutkan Cerita')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white rounded-xl font-bold shadow-md hover:bg-violet-700 transition-all"
          >
            Lanjutkan Cerita
          </button>
          <button
            onClick={() => handleSendMessage('Mulai Baru')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-200 transition-all"
          >
            Mulai Topik Baru
          </button>
        </div>
      );
    }

    if (isCrisisMode) {
      if (isTyping) {
        return (
          <div className="flex gap-3 justify-center p-4 items-center text-slate-500 animate-pulse bg-slate-50 rounded-2xl border border-slate-200">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <span className="font-medium text-sm">Menunggu pesan dari sistem...</span>
          </div>
        );
      }
      
      const whatsappMsg = encodeURIComponent("Halo, maaf ganggu. Aku lagi ngerasa nggak baik-baik aja dan butuh bantuan. Bisa tolong temenin atau hubungin aku sekarang?");
      return (
        <div className="flex flex-col gap-2.5">
          <p className="text-center text-xs text-slate-500 font-medium mb-1">Bantuan Tersedia Untukmu:</p>
          <a href="tel:119" className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 text-white rounded-xl font-bold shadow-md hover:bg-red-700 transition-all">
            <Phone size={18} /> Hubungi Layanan Sejiwa (119)
          </a>
          <a href="https://wa.me/628113855472" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all">
            <MessageCircle size={18} /> Chat Yayasan Bantuan
          </a>
          <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all">
            <Users size={18} /> Minta Bantuan Teman/Keluarga
          </a>
          <button onClick={() => setShowCalmRoom(true)} className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-800 text-white rounded-xl font-bold shadow-md hover:bg-slate-900 transition-all">
            <Heart size={18} /> Bantu Aku Tenang Sekarang
          </button>
        </div>
      );
    }

    if (phase === 'ending') {
      return (
        <div className="flex gap-3 justify-center p-4 items-center text-slate-500 animate-pulse bg-slate-50 rounded-2xl border border-slate-200">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="font-medium text-sm">Menyimpan percakapan...</span>
        </div>
      );
    }

    if (phase === 'finished') {
      return (
        <div className="flex flex-col gap-3">
          {finalQuote && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
              <p className="text-sm italic font-medium text-indigo-800 mb-3">"{finalQuote}"</p>
              <button
                onClick={() => navigator.share?.({ title: 'Pesan dari Kai', text: `"${finalQuote}" - Kai (Kancah Ate)` }).catch(console.error)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              >
                Bagikan Pesan Kai
              </button>
            </div>
          )}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-center text-xs text-slate-400 mb-2">Pakai perangkat bersama? Hapus sesi ini dan mulai baru.</p>
            <button
              onClick={handleNewSession}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all"
            >
              <Home size={15} />
              Mulai Percakapan Baru
            </button>
          </div>
        </div>
      );
    }

    // INTAKE: tampilkan tombol pilihan jika type === 'option'
    if (phase === 'intake' && INTAKE_FLOW[intakeIndex]?.type === 'option') {
      return (
        <div className="flex flex-wrap gap-2 justify-center p-2">
          {INTAKE_FLOW[intakeIndex].options.map(opt => (
            <button
              key={opt}
              onClick={() => handleSendMessage(opt)}
              disabled={isTyping}
              className="bg-orange-100 text-orange-700 hover:bg-orange-500 hover:text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm border border-orange-200 text-sm disabled:opacity-50"
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    // SUBTOPIC: tampilkan tombol topik
    if (phase === 'subtopic') {
      const topics = SUB_TOPICS[category?.id] || ['Lainnya'];
      return (
        <div className="flex flex-wrap gap-2 justify-center p-2">
          {topics.map(t => (
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

    // CHOICE: tampilkan 2 tombol pilihan mode
    if (phase === 'choice') {
      return (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleModeChoice('venting')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 font-semibold text-sm hover:bg-violet-100 transition-all text-left"
          >
            <span className="text-xl">💬</span>
            <div>
              <div className="font-bold">Dengerin aja dulu</div>
              <div className="text-xs text-violet-500 font-normal">Aku hanya ingin bercerita tanpa mencari saran</div>
            </div>
          </button>
          <button
            onClick={() => handleModeChoice('advice')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition-all text-left"
          >
            <span className="text-xl">💡</span>
            <div>
              <div className="font-bold">Minta saran dari Kai</div>
              <div className="text-xs text-amber-500 font-normal">Aku ingin tahu apa yang bisa aku lakukan</div>
            </div>
          </button>
        </div>
      );
    }

    // Grounding widget
    if (showGrounding) {
      return (
        <div className="w-full max-w-lg mx-auto">
          <GroundingCard onComplete={() => setShowGrounding(false)} />
        </div>
      );
    }

    // Input biasa (listening, venting, advice_followup)
    const showEndButton = ['listening', 'venting', 'advice_followup'].includes(phase) && messages.length >= 8;
    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Quick starters saat initial hook */}
        {phase === 'initial_hook' && (
          <div className="flex flex-wrap gap-2 mb-2 justify-center">
            {["Aku lagi sedih 😢", "Aku stres belajar 📚", "Aku butuh teman cerita 💬"].map(s => (
              <button
                key={s}
                onClick={() => handleSendMessage(s)}
                className="bg-violet-50 text-violet-600 px-4 py-2 rounded-full text-xs font-semibold hover:bg-violet-100 hover:scale-105 transition-all border border-violet-100 shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {rateLimitWarning && (
          <div className="text-center text-xs text-orange-600 bg-orange-50 py-2 px-4 rounded-xl border border-orange-200">
            Slow down ya! Kai perlu waktu buat proses. Tunggu sebentar 🙏
          </div>
        )}

        <div className="flex gap-2 w-full">
          {speechSupported && (
            <button
              onClick={() => isListening ? stopListening() : startListening(t => setInput(prev => prev + t))}
              disabled={isTyping || phase === 'finished'}
              className={`p-3 rounded-2xl transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-violet-100 hover:text-violet-600'} disabled:opacity-50`}
              title={isListening ? "Berhenti" : "Bicara"}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}

          <input
            ref={inputRef}
            type="text"
            placeholder={isListening ? "🎤 Sedang mendengarkan..." : "Ketik ceritamu di sini..."}
            className={`flex-1 bg-slate-100 rounded-2xl px-4 py-3 outline-none border-2 border-transparent focus:border-orange-200 text-sm transition-all ${isListening ? 'border-red-300 bg-red-50' : ''}`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
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

        {showEndButton && (
          <button
            onClick={handleEndSession}
            className="w-full py-2 text-sm text-slate-400 hover:text-orange-500 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Flag size={14} />
            Sudah selesai bercerita? Klik di sini untuk mengakhiri sesi
          </button>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER BUBBLE CHAT (WhatsApp-like + timestamp)
  // ============================================================
  const renderBubble = (msg, i) => {
    const isBot = msg.role === 'model';
    const time = msg.timestamp ? formatTime(msg.timestamp) : '';

    // Bubble konten edukatif — gaya kartu khusus
    if (msg.isEducational) {
      const icon = msg.eduType === 'quote' ? <Quote size={14} /> :
                   msg.eduType === 'tip' ? <Lightbulb size={14} /> :
                   <BookOpen size={14} />;
      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="max-w-[90%] bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl px-4 py-3 text-sm text-slate-600">
            <div className="flex items-center gap-1.5 text-violet-500 font-bold text-xs mb-1.5">
              {icon}
              <span>{msg.eduType === 'quote' ? 'Kutipan' : msg.eduType === 'tip' ? 'Tips' : 'Fakta Menarik'}</span>
            </div>
            <p className="leading-relaxed italic">{msg.parts[0].text}</p>
            <span className="text-[10px] text-slate-400 mt-1 block text-right">{time}</span>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
      >
        {isBot && (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center text-white text-[10px] font-bold mr-2 mt-auto mb-1 flex-shrink-0">
            K
          </div>
        )}
        <div className={`max-w-[78%] flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
            isBot
              ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
              : 'bg-violet-600 text-white rounded-tr-sm'
          }`}>
            {msg.parts[0].text}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 px-1">{time}</span>
        </div>
      </motion.div>
    );
  };

  // ============================================================
  // RENDER UTAMA
  // ============================================================
  const phaseLabel = {
    initial_hook: 'Memulai', intake: 'Pendataan', subtopic: 'Pilih Topik',
    listening: 'Mendengarkan', choice: 'Pilih Mode', venting: 'Curhat Bebas',
    advice_followup: 'Saran & Diskusi', finishing: 'Menyimpan', finished: 'Selesai'
  }[phase] || phase;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 h-[88vh] flex flex-col">
      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        riskLevel={currentRiskLevel.level}
        userName={userData.name}
      />

      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between rounded-t-[2rem] shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full bg-slate-50 hover:bg-orange-50 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            K
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Kai</h4>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${phase === 'finished' ? 'bg-green-500' : 'bg-violet-500 animate-pulse'}`}></span>
              <span className="text-[10px] text-slate-500 font-medium">{phaseLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentRiskLevel.priority > 1 && (
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
              currentRiskLevel.level === 'Kritis' ? 'bg-red-100 text-red-700' :
              currentRiskLevel.level === 'Tinggi' ? 'bg-orange-100 text-orange-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              <AlertTriangle size={11} />
              {currentRiskLevel.level}
            </div>
          )}
          {/* New Chat Button */}
          <button
            onClick={() => handleNewSession()}
            className="p-1.5 rounded-lg text-xs transition-colors bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-600"
            title="Mulai Percakapan Baru"
          >
            <RotateCcw size={15} />
          </button>
          {/* TTS Toggle */}
          <button
            onClick={() => setIsTTSEnabled(!isTTSEnabled)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${isTTSEnabled ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'}`}
            title={isTTSEnabled ? "Matikan suara" : "Aktifkan suara"}
          >
            {isTTSEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      {/* Message Area */}
      {isRecovering ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50 border-x border-slate-100">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memulihkan sesi...</p>
          </div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className={`flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3 border-x border-slate-100 transition-colors ${
            currentRiskLevel.level === 'Kritis' ? 'bg-red-50/40' :
            currentRiskLevel.level === 'Tinggi' ? 'bg-orange-50/40' :
            'bg-slate-50/50'
          }`}
        >
          {messages.map((msg, i) => renderBubble(msg, i))}
          {isTyping && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-orange-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                K
              </div>
              <div className="bg-white p-3 px-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center border border-slate-100 shadow-sm">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white p-4 rounded-b-[2rem] border shadow-lg z-10">
        {renderInputArea()}
      </div>

      <AnimatePresence>
        {showCalmRoom && (
          <CalmRoom onClose={() => setShowCalmRoom(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
