'use client';

import { Facebook, Twitter, Linkedin, Share2, Link as LinkIcon, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ArticleShareButtons({ title, slug }) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const share = (platform) => {
    let shareUrl = '';
    const text = `Baca artikel menarik ini: "${title}" di Kancah Ate!`;
    const url = currentUrl || `https://kancahate.my.id/ruang-baca/${slug}`; // Fallback code
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-100">
      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Share2 size={18} /> Bagikan artikel ini:
      </h4>
      <div className="flex gap-3">
         <button onClick={() => share('facebook')} aria-label="Share on Facebook" className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
           <Facebook size={18} />
         </button>
         <button onClick={() => share('twitter')} aria-label="Share on Twitter" className="w-10 h-10 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all">
           <Twitter size={18} />
         </button>
         <button onClick={() => share('linkedin')} aria-label="Share on LinkedIn" className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
           <Linkedin size={18} />
         </button>
         <button onClick={copyLink} aria-label="Copy Link" className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-600 hover:text-white transition-all relative">
           {copied ? <Check size={18} className="text-green-500" /> : <LinkIcon size={18} />}
           {copied && (
             <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap">
               Tersalin!
             </span>
           )}
         </button>
      </div>
    </div>
  );
}
