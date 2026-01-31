'use client';

import { Suspense } from 'react';
import App from '@/components/App';

function LoadingFallback() {
  return <div className="min-h-screen bg-slate-50" />;
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  );
}
