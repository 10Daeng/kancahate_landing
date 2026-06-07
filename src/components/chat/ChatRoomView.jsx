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

import { createOrUpdateUser, updateSession, getUserProfile } from '../../services/analyticsService';
import { useSpeech } from './hooks/useSpeech';
import { useChatSession } from './hooks/useChatSession';
import {
  INTAKE_FLOW, EDUCATIONAL_CONTENT,
  SUB_TOPICS, SUBTOPIC_VALIDATION_MESSAGES, selectPersonaBasedOnIdentity, formatTime
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
async function callChatAPI({ history, userData, category, currentRiskLevel, mode, action = 'chat', question, answer, phase }, onChunk) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, userData, category, currentRiskLevel, mode, action, question, answer, phase, useStream: !!onChunk }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { text: errData.text || 'Maaf, terjadi kesalahan. Coba kirim ulang ya.', crisisLevel: null, isError: true };
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }

    // Stream SSE
    const crisisLevelStr = res.headers.get('X-Crisis-Level');
    const crisisLevel = crisisLevelStr ? JSON.parse(crisisLevelStr) : null;
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices?.[0]?.delta?.content) {
              text += data.choices[0].delta.content;
              if (onChunk) onChunk(text);
            }
          } catch (e) {}
        }
      }
    }
    return { text, crisisLevel };
  } catch (err) {
    console.error('[callChatAPI] Network error:', err);
    return { text: 'Koneksi terputus. Periksa internet kamu dan coba lagi ya.', crisisLevel: null, isError: true };
  }
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function ChatRoomView({ onBack }) {
  const { data: sessionData, status } = useSession();
  const rateLimiter = useRef(createRateLimiter(15, 60000)).current;

  // --- Ambil initial data dari LocalStorage ---
  const [initialData] = useState(() => {
    try {
      const resume = localStorage.getItem('kancahate_resume_session');
      if (resume) {
        const session = JSON.parse(resume);
        localStorage.removeItem('kancahate_resume_session');
        return {
          resumeDbSessionId: session.id,
          history: session.chat_history,
          category: { id: session.category, title: session.category, icon: '💬', color: 'violet' }
        };
      }
      
      const testResult = localStorage.getItem('kancahate_test_result');
      if (testResult) {
        const tr = JSON.parse(testResult);
        localStorage.removeItem('kancahate_test_result');
        return {
          isTestResult: true,
          testResult: tr,
          category: { id: 'test_result', title: tr.title, icon: '📋', color: 'violet' }
        };
      }
    } catch (e) {
      console.error("Error reading initial data:", e);
    }
    return null;
  });

  const [category] = useState(() => initialData?.category || { id: 'general', title: 'Curhat', icon: '💬', color: 'violet' });

  // --- Session & Anon ID ---
  const [sessionId] = useState(() => {
    if (initialData?.resumeDbSessionId) return `session_${Date.now()}_resume_${initialData.resumeDbSessionId}`;
    try {
      let id = localStorage.getItem('kancahate_session_id');
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('kancahate_session_id', id);
      }
      return id;
    } catch (e) {
      return `session_${Date.now()}_fallback_` + Math.random().toString(36).substr(2, 9);
    }
  });

  const [anonUserId] = useState(() => {
    try {
      let id = localStorage.getItem('kancahate_anon_id');
      if (!id) {
        id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('kancahate_anon_id', id);
      }
      return id;
    } catch (e) {
      return `anon_${Date.now()}_fallback_` + Math.random().toString(36).substr(2, 9);
    }
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
    if (initialData?.isTestResult) {
      return [{
        role: 'model',
        parts: [{ text: `Halo! Kai baru aja lihat hasil tes ${initialData.testResult.title} kamu nih. Kelihatannya ada hal yang pengen kamu bahas lebih jauh tentang hasil ini. Ceritain pelan-pelan ke Kai yuk, apa yang paling mengganggu pikiranmu saat ini?` }],
        timestamp: new Date().toISOString()
      }];
    }
    return [
      {
        id: 'initial_greet_1',
        role: 'model',
        parts: [{ text: "Halo! Udah dapet posisi duduk yang nyaman buat chatting hari ini? Kenalin aku Kai 👋" }],
        timestamp: new Date().toISOString()
      },
      {
        id: 'initial_greet_2',
        role: 'model',
        parts: [{ text: "Di ruang chat ini aman ya, percakapan kita rahasia. Kamu juga nggak perlu buru-buru balas, ambil waktu aja kalau butuh mikir sebelum ngetik." }],
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [phase, setPhase] = useState(() => {
    if (initialData?.history) return 'resume_choice';
    if (initialData?.isTestResult) return 'cbt_chat';
    return 'initial_hook';
  });

  const [chatMode, setChatMode] = useState(() => {
    if (initialData?.isTestResult) return 'cbt_chat';
    return 'cbt_chat';
  });

  const [intakeIndex, setIntakeIndex] = useState(0);
  const [explorationCount, setExplorationCount] = useState(0);
  const [userData, setUserData] = useState(() => {
    if (initialData?.isTestResult) {
      return {
        ...initialData,
        subtopic: `Diskusi Hasil: ${initialData.testResult.title}`
      };
    }
    return initialData || {};
  });
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isRecovering, setIsRecovering] = useState(!initialData?.history);
  const [existingDbSessionId, setExistingDbSessionId] = useState(initialData?.resumeDbSessionId || null);

  // --- UI State ---
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);


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
  const baseInputRef = useRef('');
  const sessionStartTimeRef = useRef(new Date());
  const messagesRef = useRef(messages);
  
  // Sinkronisasi messagesRef setiap kali messages berubah
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  // --- Idle Timers & Crisis Halt Manager ---
  const idleTimerRef = useRef(null);
  const promptEndTimerRef = useRef(null);

  // Efek untuk mengunci sesi menjadi 'finished' setelah 3 menit di fase 'halt'
  useEffect(() => {
    let crisisTimeout;
    
    if (phase === 'halt') {
      // Timeout otomatis 3 menit (180.000 ms)
      crisisTimeout = setTimeout(async () => {
        setPhase('finished');
        setMessages(prevMsg => [...prevMsg, {
          role: 'model',
          parts: [{ text: "Pesanmu ini sudah kusimpan dengan aman dan diberi tanda prioritas tinggi agar segera dibaca oleh konselor manusia. Jaga dirimu baik-baik ya." }],
          timestamp: new Date().toISOString()
        }]);
        
        // Simpan sesi ke database sebagai Escalated
        try {
          const currentMsgs = messagesRef.current;
          await updateSession(sessionId, {
            chat_history: currentMsgs,
            message_count: currentMsgs.length,
            user_message_count: currentMsgs.filter(m => m.role === 'user').length,
            summary: "CRISIS ESCALATION (Sistem otomatis menghentikan percakapan karena risiko tinggi).",
            detected_keywords: detectedKeywords.length > 0 ? detectedKeywords : null,
            status: 'Escalated',
            metadata: {
              category_title: category?.title,
              chat_mode: chatMode,
              completed_at: new Date().toISOString()
            }
          });
        } catch (err) {
          console.error('Error saving escalated session:', err);
        }
      }, 180000);
    }
    
    // Cleanup function untuk mencegah memory leak
    return () => clearTimeout(crisisTimeout);
  }, [phase, sessionId, detectedKeywords, category, chatMode]);

  // --- Hooks ---
  const {
    isListening, isTTSEnabled, setIsTTSEnabled,
    speechSupported, startListening, stopListening, speakText
  } = useSpeech();

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

  const clearIdleTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (promptEndTimerRef.current) clearTimeout(promptEndTimerRef.current);
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearIdleTimers();
    if (phase === 'cbt_chat') {
      idleTimerRef.current = setTimeout(() => {
        addBotMessage(`Hai ${userData?.name || 'kamu'}, kamu masih di sana? Kalau kamu butuh waktu buat mikir, santai aja ya. Tapi kalau obrolan ini udah cukup melegakan buatmu, aku izin pamit ya biar sesinya tersimpan dengan aman.`, 1000);
        
        promptEndTimerRef.current = setTimeout(() => {
          handleEndSession();
        }, 60000); // 1 menit setelah prompt
      }, 300000); // 5 menit
    }
  }, [phase, userData?.name, clearIdleTimers, addBotMessage]);

  useEffect(() => {
    resetIdleTimer();
    return clearIdleTimers;
  }, [messages, phase, resetIdleTimer, clearIdleTimers]);



  const { clearSession, clearLocalStorageOnly } = useChatSession({
    sessionId,
    anonUserId,
    phase, messages, userData,
    explorationCount, currentRiskLevel, detectedKeywords,
    categoryTitle: category?.title,
    isRecovering,
    onRestore: (restored) => {
      if (restored) {
        setPhase(restored.phase);
        setMessages(restored.messages);
        setUserData(restored.userData);
        setExplorationCount(restored.explorationCount || 0);
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
        
        const pendingSessionId = localStorage.getItem('kancahate_pending_save_session');
        
        if (pendingSessionId) {
          // Link session API call
          fetch('/api/chat/link-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: pendingSessionId })
          }).then(res => res.json()).then(data => {
            if (data.success) {
              setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: 'Yeay! Obrolan kita sebelumnya sudah berhasil disimpan ke akun kamu. 🎉' }],
                timestamp: new Date().toISOString(),
                isEducational: true,
                eduType: 'tip'
              }]);
            }
            localStorage.removeItem('kancahate_pending_save_session');
          }).catch(console.error);
        } else if (messages.length <= 2) {
          // Hanya mulai sesi baru jika tidak sedang merestore draft
          setPhase('subtopic');
          setIntakeIndex(INTAKE_FLOW.length);
          setMessages([{
            role: 'model',
            parts: [{ text: `Halo lagi, ${profile.name}! 👋 Senang ketemu kamu lagi. Hari ini mau ngobrolin tentang apa?` }],
            timestamp: new Date().toISOString()
          }]);
        }
      }
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);



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

    if (phase === 'cbt_chat' && !rateLimiter.canSend()) {
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
        setChatMode('cbt_chat');
        setPhase('cbt_chat');
        
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

    // =============================================
    // JIKA USER MENGIRIM PESAN SAAT EMERGENCY HALT / SELESAI
    // =============================================
    if (phase === 'halt' || phase === 'finished' || phase === 'ending') {
      if (phase === 'halt') {
        // Beri auto-reply agar user tahu sistem sedang dimatikan demi keselamatan
        setMessages(prev => [...prev, {
          role: 'model',
          parts: [{ text: "Maaf, untuk saat ini Kai sedang menonaktifkan balasan otomatis demi memprioritaskan keselamatanmu. Pesan ini tetap tersimpan dengan aman." }],
          timestamp: new Date().toISOString()
        }]);
        
        // Simpan langsung ke database setiap kali user mengetik saat halt
        try {
          await updateSession(sessionId, {
            chat_history: newMessages,
            message_count: newMessages.length,
            user_message_count: newMessages.filter(m => m.role === 'user').length,
            status: 'Escalated',
            summary: "CRISIS ESCALATION (User terus mengirim pesan setelah sistem halt).",
            detected_keywords: detectedKeywords.length > 0 ? detectedKeywords : null,
            metadata: {
              category_title: category?.title,
              chat_mode: chatMode,
              completed_at: new Date().toISOString()
            }
          });
        } catch (err) {}
      }
      return;
    }

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
    // FASE 1.5: SUBTOPIC -> Langsung Pindah ke CBT CHAT
    // =============================================
    if (phase === 'subtopic') {
      let subtopic = textToSend;
      if (subtopic === 'Lainnya / Mau ketik sendiri' || subtopic === 'Lainnya') {
        setPhase('subtopic_custom');
        addBotMessage(`Baik ${userData.name || 'teman'}, boleh ceritakan lebih spesifik?`);
        return;
      }
      setUserData(prev => ({ ...prev, subtopic }));
      setPhase('cbt_chat');
      setIsTyping(true);
      
      const validationMsg = SUBTOPIC_VALIDATION_MESSAGES[subtopic];
      
      setTimeout(() => {
        if (validationMsg) {
          setMessages(prev => [...prev, {
            role: 'model',
            parts: [{ text: validationMsg }],
            timestamp: new Date().toISOString()
          }]);
        }
        
        setTimeout(() => {
          setIsTyping(false);
          const choiceMsg = `Kai sudah siap mendengarkan nih. Boleh ceritain pelan-pelan apa yang mengganggu pikiranmu soal ${subtopic}?`;
          setMessages(prev => [...prev, {
            role: 'model',
            parts: [{ text: choiceMsg }],
            timestamp: new Date().toISOString()
          }]);
        }, validationMsg ? 2000 : 0);
      }, 500);

      return;
    }

    if (phase === 'subtopic_custom') {
      setUserData(prev => ({ ...prev, subtopic: textToSend, subtopic_custom: true }));
      setPhase('cbt_chat');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const choiceMsg = `Kai sudah siap mendengarkan nih. Boleh ceritain pelan-pelan apa yang mengganggu pikiranmu soal ${textToSend}?`;
        setMessages(prev => [...prev, {
          role: 'model',
          parts: [{ text: choiceMsg }],
          timestamp: new Date().toISOString()
        }]);
      }, 1200);
      return;
    }

    // =============================================
    // FASE UTAMA: CBT CHAT
    // =============================================
    if (phase === 'cbt_chat') {
      setIsTyping(true);
      const msgId = Date.now().toString();
      setMessages(prev => [...prev, { id: msgId, role: 'model', parts: [{ text: '' }], timestamp: new Date().toISOString() }]);

      const result = await callChatAPI({ history: newMessages, userData, category, currentRiskLevel, mode: 'cbt_chat' }, (chunk) => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, parts: [{ text: chunk }] } : m));
      });

      setIsTyping(false);
      processCrisisResult(result.crisisLevel);
      
      let botText = result.text;
      
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, parts: [{ text: botText }] } : m));
      if (result.isError) {
        setInput(textToSend);
      } else {
        speakText(botText);
      }
      return;
    }
  };

  // --- Akhiri Sesi ---
  const handleEndSession = async () => {
    setPhase('ending');
    setIsTyping(true);

    try {
      const userMsgCount = messages.filter(m => m.role === 'user').length;
      const dur = Math.floor((Date.now() - sessionStartTimeRef.current.getTime()) / 1000);
      
      // Update the active session directly using sessionId (which now acts as PK/Lookup)
      await updateSession(sessionId, {
        chat_history: messages,
        message_count: messages.length,
        user_message_count: userMsgCount,
        summary: messages.slice(-3).map(m => m.parts[0]?.text?.substring(0, 100)).join(' ') || '',
        detected_keywords: detectedKeywords.length > 0 ? detectedKeywords : null,
        status: 'Completed', // Change to completed so it counts as finished
        metadata: {
          category_title: category?.title,
          chat_mode: chatMode,
          completed_at: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('Error closing session:', err);
    }

    setIsTyping(false);
    setPhase('finished');

    // Add first message
    const msgsToAdd = [{
      id: Date.now().toString(),
      role: 'model',
      parts: [{ text: `Oke sampai jumpa lagi. Terima kasih sudah berbagi cerita dengan Kai 💙` }],
      timestamp: new Date().toISOString()
    }];

    if (!loggedInUser) {
      msgsToAdd.push({
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: `Oh iya, kalau kamu mau percakapan kita tersimpan dan bisa dibaca lagi kapan saja, kamu bisa daftar atau login pakai Google-mu lho.` }],
        timestamp: new Date().toISOString()
      });
    }

    setMessages(prev => [...prev, ...msgsToAdd]);
  };

  const handleSelesaiTanpaLogin = async () => {
    await handleEndSession();
    clearLocalStorageOnly();
  };

  const handleDaftarSimpan = () => {
    localStorage.setItem('kancahate_pending_save_session', sessionId);
    router.push('/login?callbackUrl=/chat');
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
          <div className="pt-2">
            {!loggedInUser ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDaftarSimpan}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-4 py-3.5 rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  Daftar / Login
                </button>
                <button
                  onClick={handleSelesaiTanpaLogin}
                  className="flex-1 bg-white border border-slate-200 text-slate-500 px-4 py-3.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  Tidak, terima kasih
                </button>
              </div>
            ) : (
              <>
                <p className="text-center text-xs text-slate-400 mb-3">Pakai perangkat bersama? Hapus sesi ini dan mulai baru.</p>
                <button
                  onClick={handleNewSession}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border border-slate-200 text-slate-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all"
                >
                  <Home size={16} />
                  Mulai Percakapan Baru
                </button>
              </>
            )}
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
      const topics = SUB_TOPICS[category?.id] || SUB_TOPICS.general;
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



    // Grounding widget
    if (showGrounding) {
      return (
        <div className="w-full max-w-lg mx-auto">
          <GroundingCard onComplete={() => setShowGrounding(false)} />
        </div>
      );
    }

    // Input biasa
    const showEndButton = phase === 'cbt_chat' && messages.length >= 10;
    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Quick starters saat initial hook */}
        {phase === 'initial_hook' && (
          <div className="flex flex-wrap gap-2 mb-2 justify-center">
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
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  baseInputRef.current = input;
                  startListening(t => {
                    const sep = baseInputRef.current.trim() && t.trim() ? ' ' : '';
                    setInput(baseInputRef.current + sep + t);
                    // auto-resize when STT updates
                    if (inputRef.current) {
                      inputRef.current.style.height = 'auto';
                      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
                    }
                  });
                }
              }}
              disabled={isTyping || phase === 'finished'}
              className={`p-3 rounded-2xl transition-colors self-end ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-violet-100 hover:text-violet-600'} disabled:opacity-50`}
              title={isListening ? "Berhenti" : "Bicara"}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}

          <textarea
            ref={inputRef}
            rows={1}
            placeholder={isListening ? "🎤 Sedang mendengarkan..." : "Ketik ceritamu di sini..."}
            className={`flex-1 bg-slate-100 rounded-2xl px-4 py-3 outline-none border-2 border-transparent focus:border-orange-200 text-sm transition-all resize-none overflow-y-auto ${isListening ? 'border-red-300 bg-red-50' : ''}`}
            style={{ minHeight: '48px', maxHeight: '120px' }}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
                e.target.style.height = 'auto';
              }
            }}
            disabled={isTyping || phase === 'finished'}
          />

          <button
            onClick={() => {
              handleSendMessage();
              if (inputRef.current) inputRef.current.style.height = 'auto';
            }}
            disabled={isTyping || !input.trim() || phase === 'finished'}
            className="bg-orange-500 text-white p-3 rounded-2xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors self-end"
          >
            <Send size={20} />
          </button>
        </div>

        {showEndButton && (
          <button
            onClick={handleEndSession}
            className="w-full py-2.5 mt-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm border border-red-100"
          >
            <Flag size={16} />
            Akhiri Sesi
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
            <p className="leading-relaxed italic">{msg.parts ? msg.parts[0].text : msg.text}</p>
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
            {msg.parts ? msg.parts[0].text : msg.text}
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
    cbt_chat: 'Curhat & Diskusi', finishing: 'Menyimpan', finished: 'Selesai'
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
        <div className="relative flex-1 flex flex-col min-h-0 border-x border-slate-100">

          <div
            ref={scrollRef}
            className={`flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3 transition-colors ${
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
