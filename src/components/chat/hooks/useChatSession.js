'use client';

import { useEffect, useRef } from 'react';
import { encryptData, decryptData } from '../../../services/cryptoService';
import { getChatDraft, saveChatDraft, deleteChatDraft } from '../../../services/analyticsService';

export function useChatSession({
  sessionId,
  anonUserId,
  phase,
  messages,
  userData,
  diagnosticIndex,
  currentRiskLevel,
  detectedKeywords,
  categoryTitle,
  isRecovering,
  onRestore,
}) {
  const autoSaveTimerRef = useRef(null);

  // Session Recovery on mount
  useEffect(() => {
    const recoverSession = async () => {
      try {
        const { success, data } = await getChatDraft(sessionId);
        if (success && data) {
          onRestore({
            phase: data.phase,
            messages: data.messages,
            userData: data.user_data || {},
            diagnosticIndex: data.user_data?.diagnostic_index || 0,
            currentRiskLevel: { level: data.current_risk_level || 'Rendah', priority: 1 },
            detectedKeywords: data.detected_keywords || [],
          });
          return;
        }
      } catch (_) {}

      // Fallback: localStorage
      try {
        const saved = localStorage.getItem(`kancahate_draft_${sessionId}`);
        if (saved) {
          const draft = await decryptData(saved);
          if (draft) {
            onRestore({
              phase: draft.phase || 'intake',
              messages: draft.messages || [],
              userData: draft.userData || {},
              diagnosticIndex: draft.diagnosticIndex || 0,
              currentRiskLevel: draft.currentRiskLevel || { level: 'Rendah', priority: 1 },
              detectedKeywords: draft.detectedKeywords || [],
            });
            return;
          }
        }
      } catch (_) {}
      
      // If we reach here, there is no draft to restore
      onRestore(null);
    };

    recoverSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (isRecovering || phase === 'finished' || phase === 'saving') return;

    const saveDraft = async () => {
      const draft = {
        session_id: sessionId,
        anonUserId,
        phase,
        messages,
        user_data: { ...userData, diagnostic_index: diagnosticIndex },
        category: categoryTitle,
        current_risk_level: currentRiskLevel.level,
        detected_keywords: detectedKeywords
      };

      const encrypted = await encryptData(draft);
      if (encrypted) {
        try {
          localStorage.setItem(`kancahate_draft_${sessionId}`, encrypted);
          localStorage.setItem('kancahate_draft_backup', encrypted);
        } catch (_) {}
      }

      saveChatDraft(sessionId, draft).catch(console.error);
    };

    saveDraft();
    autoSaveTimerRef.current = setInterval(saveDraft, 30000);
    return () => clearInterval(autoSaveTimerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, messages, userData, diagnosticIndex, currentRiskLevel, detectedKeywords]);

  const clearSession = async () => {
    localStorage.removeItem('kancahate_session_id');
    localStorage.removeItem(`kancahate_draft_${sessionId}`);
    localStorage.removeItem('kancahate_draft_backup');
    try { await deleteChatDraft(sessionId); } catch (_) {}
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('kancahate_session_id', newId);
    window.location.reload();
  };

  return { clearSession };
}
