'use client';

import { useState, useEffect, useRef } from 'react';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // STT check support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }

    // TTS init
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      synthRef.current.getVoices();
      synthRef.current.onvoiceschanged = () => synthRef.current.getVoices();
    }
  }, []);

  const startListening = (onTranscript) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    // Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    
    // Pada beberapa browser mobile (seperti iOS Safari), continuous=true sering bermasalah.
    // Namun kita tetap coba continuous agar user tidak perlu berkali-kali klik.
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID';
    
    recognitionRef.current = recognition;
    
    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      onTranscript((finalTranscript + interimTranscript).trim());
    };
    
    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      if (e.error !== 'no-speech') setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      // Jika browser mematikan otomatis (timeout), kita biarkan state berhenti
    };
    
    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const speakText = (text) => {
    if (!synthRef.current || !isTTSEnabled) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    const voices = synthRef.current.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) utterance.voice = idVoice;
    setTimeout(() => synthRef.current.speak(utterance), 100);
  };

  const stopSpeaking = () => synthRef.current?.cancel();

  return {
    isListening,
    isTTSEnabled,
    setIsTTSEnabled,
    speechSupported,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  };
}
