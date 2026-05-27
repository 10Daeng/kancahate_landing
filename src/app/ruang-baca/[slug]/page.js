'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Check,
  Bookmark,
  Heart,
  Eye
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

// Client component for interactivity
function ArticleDetailClient({ article, relatedArticles }) {
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const contentRef = useRef(null);
  const headingsRef = useRef([]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setReadingProgress(Math.min(progress, 100));

      // Active heading tracking
      const headings = contentRef.current?.querySelectorAll('h2, h3') || [];
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 150) {
          setActiveHeading(heading.textContent);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extract headings for TOC
  useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll('h2, h3');
    headingsRef.current = Array.from(headings).map((h, index) => ({
      id: `heading-${index}`,
      text: h.textContent,
      level: h.tagName.toLowerCase(),
      element: h
    }));

    // Add IDs to headings
    headings.forEach((h, index) => {
      h.id = `heading-${index}`;
    });
  }, [article]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://kancahate.my.id/ruang-baca/${article.slug}`;

  const share = (platform) => {
    const text = `Baca artikel menarik ini: "${article.title}" di Kancah Ate!`;
    let targetUrl = '';

    switch (platform) {
      case 'facebook':
        targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        targetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        targetUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
        break;
    }

    if (targetUrl) window.open(targetUrl, '_blank', 'width=600,height=400');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700 flex flex-col">
      <Header />

      {/* Custom Article Styles */}
      <style jsx global>{`
        .article-content {
          font-size: 1.125rem;
          line-height: 1.8;
        }
        .article-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f3e8ff;
          line-height: 1.3;
        }
        @media (min-width: 768px) {
          .article-content h2 {
            font-size: 2.25rem;
          }
        }
        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #7c3aed;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        @media (min-width: 768px) {
          .article-content h3 {
            font-size: 1.875rem;
          }
        }
        .article-content p {
          color: #475569;
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }
        .article-content a {
          color: #7c3aed;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 2px solid #ddd6fe;
          transition: all 0.2s;
        }
        .article-content a:hover {
          color: #6d28d9;
          border-bottom-color: #7c3aed;
        }
        .article-content strong,
        .article-content b {
          color: #1e293b;
          font-weight: 600;
        }
        .article-content ul,
        .article-content ol {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }
        .article-content ul {
          list-style-type: disc;
        }
        .article-content ol {
          list-style-type: decimal;
        }
        .article-content li {
          color: #475569;
          margin-bottom: 0.75rem;
          line-height: 1.7;
        }
        .article-content li::marker {
          color: #8b5cf6;
        }
        .article-content blockquote {
          border-left: 4px solid #c4b5fd;
          background: #f5f3ff;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #475569;
          border-radius: 0 0.75rem 0.75rem 0;
        }
        .article-content img {
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          margin: 2rem 0;
          max-width: 100%;
          height: auto;
        }
        .article-content hr {
          border-color: #e2e8f0;
          margin: 3rem 0;
        }
        .article-content code {
          color: #7c3aed;
          background: #f5f3ff;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.875em;
        }
        .article-content pre {
          background: #1e293b;
          color: #f1f5f9;
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .article-content pre code {
          background: transparent;
          padding: 0;
        }
      `}</style>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-orange-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <main className="flex-1">
        {/* Hero Section with Background Image */}
        <div className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60 z-10" />
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-end">
            <div className="max-w-4xl mx-auto px-4 pb-12 w-full">
              <Link
                href="/ruang-baca"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white font-bold text-sm mb-6 transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <ArrowLeft size={16} /> Kembali ke Ruang Baca
              </Link>

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-violet-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                  {article.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg">
                {article.title}
              </h1>

              <p className="text-lg md:text-xl text-white/90 mb-6 line-clamp-2">
                {article.excerpt}
              </p>

              {/* Author & Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/90">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-orange-500 flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{article.author}</div>
                    <div className="text-xs text-white/70">Penulis</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock size={16} /> {article.readTime}
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Calendar size={16} /> {article.date}
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Eye size={16} /> {article.views ? article.views.toLocaleString() : Math.floor((article.id?.toString().charCodeAt(0) || 1) * 314 % 4000 + 1000).toLocaleString()} dibaca
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left: Article Content */}
            <div className="flex-1 min-w-0">
              <article
                ref={contentRef}
                className="article-content max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="flex flex-wrap gap-2">
                  {article.category && (
                    <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                      #{article.category.toLowerCase().replace(/\s+/g, '')}
                    </span>
                  )}
                  <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    #kesehatanmental
                  </span>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    #remaja
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    #selfgrowth
                  </span>
                </div>
              </div>

              {/* Engagement Bar */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                      liked
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-500'
                    }`}
                  >
                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                    <span>{liked ? 'Disukai' : 'Sukai'}</span>
                  </button>
                  <button
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                      bookmarked
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-500'
                    }`}
                  >
                    <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                    <span>{bookmarked ? 'Disimpan' : 'Simpan'}</span>
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-600 to-orange-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
                  >
                    <Share2 size={18} />
                    Bagikan
                  </button>

                  {/* Share Dropdown */}
                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-10">
                      <div className="p-2">
                        <button
                          onClick={() => share('facebook')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <Facebook size={20} className="text-blue-600" />
                          <span className="font-medium text-slate-700">Facebook</span>
                        </button>
                        <button
                          onClick={() => share('twitter')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <Twitter size={20} className="text-sky-500" />
                          <span className="font-medium text-slate-700">Twitter</span>
                        </button>
                        <button
                          onClick={() => share('linkedin')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <Linkedin size={20} className="text-indigo-600" />
                          <span className="font-medium text-slate-700">LinkedIn</span>
                        </button>
                        <button
                          onClick={() => share('whatsapp')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-2xl">💬</span>
                          <span className="font-medium text-slate-700">WhatsApp</span>
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          onClick={copyLink}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          {copied ? (
                            <Check size={20} className="text-green-500" />
                          ) : (
                            <LinkIcon size={20} className="text-slate-500" />
                          )}
                          <span className="font-medium text-slate-700">
                            {copied ? 'Tersalin!' : 'Salin Link'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Author Card */}
              <div className="mt-12 p-8 bg-gradient-to-br from-violet-50 to-orange-50 rounded-3xl border border-violet-100">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User size={36} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{article.author}</h3>
                    <p className="text-slate-600 mb-4">
                      Penulis artikel kesehatan mental dan pengembangan diri di Kancah Ate.
                      Berbagi tips praktis untuk remaja Indonesia agar lebih memahami dirinya.
                    </p>
                    <div className="flex gap-3">
                      <span className="px-3 py-1 bg-white/80 text-violet-700 rounded-full text-xs font-medium">
                        {article.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Sidebar (Desktop) */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-8">
                {/* Table of Contents */}
                {headingsRef.current.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600 font-bold">
                        📑
                      </span>
                      Daftar Isi
                    </h4>
                    <nav className="space-y-2">
                      {headingsRef.current.map((heading) => (
                        <button
                          key={heading.id}
                          onClick={() => scrollToHeading(heading.id)}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            activeHeading === heading.text
                              ? 'bg-violet-100 text-violet-700 font-medium'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                          style={{ paddingLeft: heading.level === 'h3' ? '1.5rem' : '0.75rem' }}
                        >
                          {heading.text}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}

                {/* CTA Card */}
                <div className="bg-gradient-to-br from-violet-600 to-orange-500 rounded-2xl p-6 text-white">
                  <div className="text-4xl mb-4">💬</div>
                  <h4 className="font-bold text-lg mb-2">Butuh Teman Cerita?</h4>
                  <p className="text-white/90 text-sm mb-4">
                    Chat dengan Kai, teman virtual yang siap mendengarkan keluh kesahmu kapan saja.
                  </p>
                  <Link
                    href="/chat"
                    className="inline-block w-full px-4 py-3 bg-white text-violet-600 rounded-xl font-bold text-center hover:bg-slate-100 transition-colors"
                  >
                    Mulai Chat Gratis
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-20 pt-12 border-t border-slate-200">
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <span className="text-3xl">📚</span>
                Artikel Terkait
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/ruang-baca/${related.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-bold text-violet-600 mb-2 block">
                        {related.category}
                      </span>
                      <h4 className="font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-sm text-slate-500 line-clamp-2">{related.excerpt}</p>
                      <div className="flex items-center gap-3 mt-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {related.readTime}
                        </span>
                        <span>{related.date}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Share Bar (Bottom Fixed) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 z-40">
          <div className="flex items-center justify-around">
            <button
              onClick={() => share('whatsapp')}
              className="flex flex-col items-center gap-1 text-green-600"
            >
              <span className="text-2xl">💬</span>
              <span className="text-xs font-medium">WhatsApp</span>
            </button>
            <button
              onClick={() => share('facebook')}
              className="flex flex-col items-center gap-1 text-blue-600"
            >
              <Facebook size={24} />
              <span className="text-xs font-medium">Facebook</span>
            </button>
            <button
              onClick={() => share('twitter')}
              className="flex flex-col items-center gap-1 text-sky-500"
            >
              <Twitter size={24} />
              <span className="text-xs font-medium">Twitter</span>
            </button>
            <button
              onClick={copyLink}
              className="flex flex-col items-center gap-1 text-slate-600"
            >
              {copied ? (
                <Check size={24} className="text-green-500" />
              ) : (
                <LinkIcon size={24} />
              )}
              <span className="text-xs font-medium">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
            <Link
              href="/chat"
              className="flex flex-col items-center gap-1 text-violet-600"
            >
              <span className="text-2xl">💬</span>
              <span className="text-xs font-medium">Chat Kai</span>
            </Link>
          </div>
        </div>

        {/* Spacer for mobile fixed bar */}
        <div className="lg:hidden h-20" />
      </main>

      <Footer />
    </div>
  );
}

import { getArticleBySlug, getPublishedArticles } from '@/services/articleService';

export default async function ArticleDetailPage({ params }) {
  const { slug } = await params;
  
  // Fetch from database
  const result = await getArticleBySlug(slug);
  const dbArticle = result?.data;

  if (!dbArticle) {
    notFound();
  }
  
  // Fetch related articles for the client component
  const allResult = await getPublishedArticles({ limit: 10 });
  const relatedArticlesRaw = allResult.success && allResult.data ? allResult.data : [];

  // Map to the format expected by the client component
  const article = {
    id: dbArticle.id,
    title: dbArticle.title,
    slug: dbArticle.slug,
    excerpt: dbArticle.excerpt || '',
    content: dbArticle.content || '',
    category: dbArticle.category || 'Umum',
    image: dbArticle.featuredImageUrl || dbArticle.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
    author: dbArticle.authorName || 'Tim Kancah Ate',
    date: dbArticle.publishedAt ? new Date(dbArticle.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    readTime: `${Math.ceil((dbArticle.content?.length || 0) / 1500)} menit baca`,
    views: dbArticle.viewCount || 0
  };
  
  const relatedArticles = relatedArticlesRaw
    .filter(a => a.id !== dbArticle.id && a.category === dbArticle.category)
    .map(a => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt || '',
      category: a.category || 'Umum',
      image: a.featuredImageUrl || a.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
      author: a.authorName || 'Tim Kancah Ate',
      date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      readTime: `${Math.ceil((a.content?.length || 0) / 1500)} menit baca`
    }))
    .slice(0, 3);

  return <ArticleDetailClient article={article} relatedArticles={relatedArticles} />;
}
