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

    // STT init
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'id-ID';
      recognitionRef.current = recognition;
    }

    // TTS init
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      synthRef.current.getVoices();
      synthRef.current.onvoiceschanged = () => synthRef.current.getVoices();
    }
  }, []);

  const startListening = (onTranscript) => {
    if (!recognitionRef.current) return;
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
    setIsListening(true);
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
