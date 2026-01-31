'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getAllArticlesAdmin, getCategories, createArticle, updateArticle, deleteArticle } from '@/services/articleService';
import {
  ArrowLeft, Plus, Edit2, Trash2, Eye, Search, 
  Loader2, FileText, Globe, X, Save, Image as ImageIcon,
  Bold, Italic, Heading1, Heading2, List, ListOrdered, Link2, Quote, Code, Upload
} from 'lucide-react';

export default function AdminArticles() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editorTab, setEditorTab] = useState('edit'); // 'edit' or 'preview'
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Editor form state
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    featured_image_url: '',
    status: 'draft',
    author_name: 'Tim Kancah Ate'
  });

  const fetchData = async () => {
    setLoading(true);
    
    const [artResult, catResult] = await Promise.all([
      getAllArticlesAdmin(),
      getCategories()
    ]);

    if (artResult.success) setArticles(artResult.data || []);
    if (catResult.success) setCategories(catResult.data || []);
    
    setLoading(false);
  };

  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'lenterabatin.id@gmail.com')
      .split(',')
      .map(email => email.trim().toLowerCase());
    
    if (!session || !adminEmails.includes(session.user.email.toLowerCase())) {
      router.push('/');
      return;
    }

    await fetchData();
  };

  useEffect(() => {
    checkAdminAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEditor = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setForm({
        title: article.title || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        category_id: article.category_id || '',
        featured_image_url: article.featured_image_url || '',
        status: article.status || 'draft',
        author_name: article.author_name || 'Tim Kancah Ate'
      });
    } else {
      setEditingArticle(null);
      setForm({
        title: '',
        excerpt: '',
        content: '',
        category_id: '',
        featured_image_url: '',
        status: 'draft',
        author_name: 'Tim Kancah Ate'
      });
    }
    setEditorTab('edit');
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('Judul dan konten wajib diisi!');
      return;
    }

    setSaving(true);
    let result;

    if (editingArticle) {
      result = await updateArticle(editingArticle.id, form);
    } else {
      result = await createArticle(form);
    }

    if (result.success) {
      setShowEditor(false);
      fetchData();
    } else {
      alert('Error: ' + result.error);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus artikel ini?')) return;
    
    const result = await deleteArticle(id);
    if (result.success) {
      fetchData();
    } else {
      alert('Error: ' + result.error);
    }
  };

  // === FORMATTING FUNCTIONS ===
  const insertFormat = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.content;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setForm({ ...form, content: newText });
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 10);
  };

  const formatActions = [
    { icon: Bold, label: 'Bold', action: () => insertFormat('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertFormat('*', '*') },
    { icon: Heading1, label: 'Heading 1', action: () => insertFormat('\n## ', '\n') },
    { icon: Heading2, label: 'Heading 2', action: () => insertFormat('\n### ', '\n') },
    { icon: List, label: 'Bullet List', action: () => insertFormat('\n- ') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertFormat('\n1. ') },
    { icon: Quote, label: 'Quote', action: () => insertFormat('\n> ') },
    { icon: Code, label: 'Code', action: () => insertFormat('`', '`') },
    { icon: Link2, label: 'Link', action: () => insertFormat('[', '](url)') },
  ];

  // === IMAGE UPLOAD ===
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB!');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // If bucket doesn't exist, show helpful message
        if (error.message.includes('bucket') || error.statusCode === 404) {
          alert('Bucket "article-images" belum dibuat di Supabase Storage. Silakan buat bucket dulu di Supabase Dashboard → Storage → New Bucket → nama: article-images, public: true');
        } else {
          throw error;
        }
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // Insert markdown image syntax at cursor position
      insertFormat(`\n![${file.name}](${imageUrl})\n`);
      
      alert('Gambar berhasil diupload!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal upload gambar: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan!');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `featured-${Date.now()}.${fileExt}`;
      const filePath = `articles/featured/${fileName}`;

      const { error } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (error) {
        if (error.message.includes('bucket') || error.statusCode === 404) {
          alert('Bucket "article-images" belum dibuat. Buat dulu di Supabase Dashboard → Storage.');
        } else {
          throw error;
        }
        return;
      }

      const { data: urlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      setForm({ ...form, featured_image_url: urlData.publicUrl });
      alert('Featured image berhasil diupload!');
    } catch (error) {
      alert('Gagal upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // === MARKDOWN PREVIEW ===
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    // Simple markdown rendering
    let html = text
      // Escape HTML
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      // Bold & Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 rounded">$1</code>')
      // Images
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-4 max-w-full" />')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-violet-600 underline" target="_blank">$1</a>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-violet-300 pl-4 italic my-2 text-slate-600">$1</blockquote>')
      // Lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="my-3">')
      .replace(/\n/g, '<br />');
    
    return `<p class="my-3">${html}</p>`;
  };

  // Filter articles
  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/kancah-private-auth" className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">CMS Artikel</h1>
              <p className="text-slate-500">Kelola konten Ruang Baca</p>
            </div>
          </div>
          <button
            onClick={() => openEditor()}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all"
          >
            <Plus size={18} />
            Artikel Baru
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-100">
            <FileText className="text-violet-600 mb-2" size={24} />
            <h3 className="text-2xl font-bold text-slate-900">{articles.length}</h3>
            <p className="text-sm text-slate-500">Total Artikel</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-100">
            <Globe className="text-green-600 mb-2" size={24} />
            <h3 className="text-2xl font-bold text-slate-900">{articles.filter(a => a.status === 'published').length}</h3>
            <p className="text-sm text-slate-500">Published</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-100">
            <Edit2 className="text-orange-600 mb-2" size={24} />
            <h3 className="text-2xl font-bold text-slate-900">{articles.filter(a => a.status === 'draft').length}</h3>
            <p className="text-sm text-slate-500">Draft</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-100">
            <Eye className="text-blue-600 mb-2" size={24} />
            <h3 className="text-2xl font-bold text-slate-900">{articles.reduce((sum, a) => sum + (a.view_count || 0), 0)}</h3>
            <p className="text-sm text-slate-500">Total Views</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 flex gap-4 border border-slate-100">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari judul artikel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-violet-100 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-violet-100 text-sm font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-5">Artikel</th>
                <th className="text-left p-5">Kategori</th>
                <th className="text-left p-5">Status</th>
                <th className="text-left p-5">Views</th>
                <th className="text-left p-5">Tanggal</th>
                <th className="text-center p-5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <tr key={article.id} className="hover:bg-slate-50/50">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {article.featured_image_url ? (
                            <img src={article.featured_image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 line-clamp-1">{article.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-1">{article.excerpt || 'Belum ada excerpt'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-sm text-slate-600">{article.category?.name || '-'}</span>
                    </td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        article.status === 'published' ? 'bg-green-100 text-green-600' :
                        article.status === 'draft' ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-sm text-slate-600">{article.view_count || 0}</span>
                    </td>
                    <td className="p-5">
                      <span className="text-sm text-slate-500">
                        {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : '-'}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openEditor(article)}
                          className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <Link 
                          href={`/ruang-baca/${article.slug}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-16 text-center">
                    <FileText size={40} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Artikel</h3>
                    <p className="text-slate-500 mb-4">Mulai buat artikel pertamamu!</p>
                    <button
                      onClick={() => openEditor()}
                      className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-sm"
                    >
                      Buat Artikel
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Article Editor Modal - ENHANCED */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl my-4">
            {/* Editor Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-orange-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editingArticle ? 'Edit Artikel' : 'Artikel Baru'}
                </h3>
                <p className="text-xs text-slate-500">Gunakan format Markdown untuk styling</p>
              </div>
              <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-white/50 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Editor Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Title & Excerpt Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Judul *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    placeholder="Masukkan judul artikel..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Excerpt (Ringkasan)</label>
                  <input
                    type="text"
                    value={form.excerpt}
                    onChange={(e) => setForm({...form, excerpt: e.target.value})}
                    placeholder="Ringkasan singkat untuk card..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Content Editor with Toolbar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-700">Konten *</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditorTab('edit')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        editorTab === 'edit' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setEditorTab('preview')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        editorTab === 'preview' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {editorTab === 'edit' ? (
                  <>
                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-1 p-2 bg-slate-50 rounded-t-xl border border-b-0 border-slate-200">
                      {formatActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={action.action}
                          className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-violet-600"
                          title={action.label}
                        >
                          <action.icon size={18} />
                        </button>
                      ))}
                      <div className="w-px h-6 bg-slate-300 mx-1" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-1 px-3 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        Upload Gambar
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={form.content}
                      onChange={(e) => setForm({...form, content: e.target.value})}
                      placeholder="Tulis konten artikel di sini menggunakan Markdown...

Contoh format:
## Heading
**Bold text**
*Italic text*
- Bullet list
1. Numbered list
> Quote
[Link](url)
![Image](url)"
                      rows={15}
                      className="w-full px-4 py-3 border border-t-0 border-slate-200 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none font-mono text-sm"
                    />
                  </>
                ) : (
                  <div className="border border-slate-200 rounded-xl p-6 min-h-[400px] bg-white prose prose-slate max-w-none">
                    {form.content ? (
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }} />
                    ) : (
                      <p className="text-slate-400 italic">Belum ada konten untuk dipreview...</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({...form, category_id: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Pilih...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Penulis</label>
                  <input
                    type="text"
                    value={form.author_name}
                    onChange={(e) => setForm({...form, author_name: e.target.value})}
                    placeholder="Tim Kancah Ate"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Featured Image</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={form.featured_image_url}
                      onChange={(e) => setForm({...form, featured_image_url: e.target.value})}
                      placeholder="URL gambar..."
                      className="flex-1 px-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                    />
                    <label className="p-3 bg-violet-100 hover:bg-violet-200 text-violet-600 rounded-xl cursor-pointer transition-colors">
                      <Upload size={18} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Featured Image Preview */}
              {form.featured_image_url && (
                <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-2">Preview Featured Image:</p>
                  <img 
                    src={form.featured_image_url} 
                    alt="Featured" 
                    className="h-32 rounded-lg object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>

            {/* Editor Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <button
                onClick={() => setShowEditor(false)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Batal
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {form.content.length} karakter
                </span>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {editingArticle ? 'Update' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
