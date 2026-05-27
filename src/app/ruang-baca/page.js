
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, BookOpen, Clock, ChevronRight, Loader2 } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { getPublishedArticles, getCategories } from '@/services/articleService';


export default function RuangBacaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch categories
    const catResult = await getCategories();
    if (catResult.success && catResult.data?.length > 0) {
      setCategories([{ id: 'all', name: 'Semua', slug: 'all' }, ...catResult.data]);
    }

    // Fetch articles
    const artResult = await getPublishedArticles({ limit: 50 });
    if (artResult.success && artResult.data?.length > 0) {
      // Map database format to UI format
      const mappedArticles = artResult.data.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt || '',
        image: a.featuredImageUrl || a.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
        category: a.category || 'Umum',
        categorySlug: a.category ? a.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'umum',
        author: a.authorName || 'Tim Kancah Ate',
        date: a.publishedAt || a.published_at ? new Date(a.publishedAt || a.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
        readTime: `${Math.ceil((a.content?.length || 0) / 1500)} menit baca`,
        isFromDB: true
      }));
      setArticles(mappedArticles);
    } else {
      setArticles([]);
    }
    
    setLoading(false);
  };

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || selectedCategory === 'all' || 
                           article.category === selectedCategory ||
                           article.categorySlug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700 flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold mb-6"
          >
            <BookOpen size={16} />
            Ruang Baca Kancah Ate
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black mb-6 leading-tight"
          >
            Jelajahi Wawasan Kesehatan Mental
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/80 max-w-2xl mx-auto mb-10"
          >
            Kumpulan artikel, tips praktis, dan insight seputar dunia remaja. 
            Valid, relate, dan mudah dipahami.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto relative"
          >
            <input 
              type="text" 
              placeholder="Cari artikel (misal: overthinking, cemas)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {(categories.length > 0 ? categories : [{ id: 'all', name: 'Semua', slug: 'all' }]).map(cat => (
            <button
              key={cat.id || cat.name}
              onClick={() => setSelectedCategory(cat.slug || cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === (cat.slug || cat.name) || (selectedCategory === 'All' && cat.slug === 'all')
                  ? 'bg-violet-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-violet-50 border border-slate-200'
              }`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-violet-600" size={40} />
          </div>
        ) : (
          /* Articles Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article, index) => (
                <motion.article 
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full"
                >
                  <Link href={`/ruang-baca/${article.slug}`} className="block h-48 overflow-hidden relative">
                     <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                     <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                     />
                     <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-violet-600 shadow-sm">
                       {article.category}
                     </div>
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                      <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>
                    
                    <Link href={`/ruang-baca/${article.slug}`}>
                      <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-violet-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>
                    
                    <p className="text-slate-500 text-sm mb-6 line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">Oleh {article.author}</span>
                      <Link href={`/ruang-baca/${article.slug}`} className="text-violet-600 font-bold text-sm flex items-center gap-1 group/btn">
                        Baca <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Artikel tidak ditemukan</h3>
                <p className="text-slate-500">Coba cari dengan kata kunci lain atau pilih kategori Semua.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
