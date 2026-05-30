'use client';

import { useEffect } from 'react';

export default function AntiCloneWrapper({ children }) {
  useEffect(() => {
    // 1. Mencegah Klik Kanan (Context Menu)
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 2. Mencegah Shortcut Keyboard Developer (Inspect Element, View Source)
    const handleKeyDown = (e) => {
      // Mencegah F12
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
      
      // Mencegah Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element selector)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return;
      }
      
      // Mencegah Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return;
      }
      
      // Mencegah Cmd+Option+I / Cmd+Option+J / Cmd+Option+C pada Mac
      if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return;
      }
      
      // Mencegah Cmd+Option+U pada Mac
      if (e.metaKey && e.altKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return;
      }
    };

    // 3. Mencegah Drag & Drop gambar/elemen
    const handleDragStart = (e) => {
      e.preventDefault();
    };

    // Mendaftarkan event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    // Membersihkan event listeners saat unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <div className="select-none anti-clone-wrapper">
      {children}
    </div>
  );
}
