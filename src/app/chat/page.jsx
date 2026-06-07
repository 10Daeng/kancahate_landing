'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ChatRoomView = dynamic(() => import('@/components/chat/ChatRoomView'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
    </div>
  )
});

export default function ChatPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <Suspense fallback={<div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>}>
        <ChatRoomView 
          onBack={() => {
            window.location.href = '/';
          }}
        />
      </Suspense>
    </div>
  );
}
