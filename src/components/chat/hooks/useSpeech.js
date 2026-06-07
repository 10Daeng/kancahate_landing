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
      recognition.continuous = true;
      recognition.interimResults = true;
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
    
    let finalTranscript = '';

    recognitionRef.current.onresult = (event) => {
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
    
    recognitionRef.current.onerror = (e) => {
      if (e.error !== 'no-speech') setIsListening(false);
    };
    recognitionRef.current.onend = () => setIsListening(false);
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error(e);
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
