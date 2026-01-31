'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import {
  Save, Eye, X, Loader2, ChevronLeft, Image as ImageIcon,
  Bold, Italic, List, Link as LinkIcon, Heading, BarChart3
} from 'lucide-react';

// Simple toolbar for text formatting
const Toolbar = ({ onAction }) => (
  <div className="flex flex-wrap gap-1 p-2 bg-slate-100 border-b border-slate-200 rounded-t-xl">
    <button
      type="button"
      onClick={() => onAction('bold')}
      className="p-2 hover:bg-slate-200 rounded transition-colors"
      title="Bold"
    >
      <Bold size={16} />
    </button>
    <button
      type="button"
      onClick={() => onAction('italic')}
      className="p-2 hover:bg-slate-200 rounded transition-colors"
      title="Italic"
    >
      <Italic size={16} />
    </button>
    <button
      type="button"
      onClick={() => onAction('heading')}
      className="p-2 hover:bg-slate-200 rounded transition-colors"
      title="Heading"
    >
      <Heading size={16} />
    </button>
    <div className="w-px bg-slate-300 mx-1" />
    <button
      type="button"
      onClick={() => onAction('ul')}
      className="p-2 hover:bg-slate-200 rounded transition-colors"
      title="Bullet List"
    >
      <List size={16} />
    </button>
    <button
      type="button"
      onClick={() => onAction('link')}
      className="p-2 hover:bg-slate-200 rounded transition-colors"
      title="Link"
    >
      <LinkIcon size={16} />
    </button>
  </div>
);

export default function NewArticlePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    category_id: '',
    status: 'draft', // draft or published
  });

  // Preview mode
  const [showPreview, setShowPreview] = useState(false);

  // Errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/admin/articles/new');
        return;
      }
      setUser(user);
      await fetchCategories();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('article_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || '';
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleContentAction = (action) => {
    const textarea = document.getElementById('content-editor');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selectedText = text.substring(start, end) || 'teks';

    let insertion = '';
    let cursorOffset = 0;

    switch (action) {
      case 'bold':
        insertion = `<strong>${selectedText}</strong>`;
        cursorOffset = selectedText.length ? 0 : -9;
        break;
      case 'italic':
        insertion = `<em>${selectedText}</em>`;
        cursorOffset = selectedText.length ? 0 : -5;
        break;
      case 'heading':
        insertion = `\n<h2>${selectedText}</h2>\n`;
        cursorOffset = selectedText.length ? 0 : -5;
        break;
      case 'ul':
        insertion = `\n<ul>\n  <li>${selectedText}</li>\n</ul>\n`;
        cursorOffset = selectedText.length ? 0 : -11;
        break;
      case 'link':
        const url = prompt('Masukkan URL:', 'https://');
        if (url) {
          insertion = `<a href="${url}">${selectedText || 'link text'}</a>`;
          cursorOffset = selectedText.length ? 0 : -10;
        }
        break;
    }

    if (insertion) {
      const newText = text.substring(0, start) + insertion + text.substring(end);
      setFormData(prev => ({ ...prev, content: newText }));

      // Set cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insertion.length + cursorOffset, start + insertion.length + cursorOffset);
      }, 0);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul artikel wajib diisi';
    }
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Ringkasan artikel wajib diisi';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Konten artikel wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (publish = false) => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Generate slug if not set
      const slug = formData.slug || generateSlug(formData.title);

      // Make slug unique
      const uniqueSlug = slug + '-' + Date.now().toString(36);

      const articleData = {
        title: formData.title,
        slug: uniqueSlug,
        excerpt: formData.excerpt,
        content: formData.content,
        featured_image_url: formData.featured_image_url || null,
        category_id: formData.category_id || null,
        status: publish ? 'published' : 'draft',
        published_at: publish ? new Date().toISOString() : null,
        author_name: user?.email?.split('@')[0] || 'Admin',
      };

      const { data, error } = await supabase
        .from('articles')
        .insert([articleData])
        .select()
        .single();

      if (error) throw error;

      router.push('/admin/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Gagal menyimpan artikel: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/articles"
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ChevronLeft size={20} />
              </Link>
              <h1 className="text-lg font-bold text-slate-800">Artikel Baru</h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"
              >
                <BarChart3 size={16} />
                Dashboard
              </Link>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Terbitkan
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Judul Artikel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Masukkan judul artikel yang menarik..."
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  errors.title ? 'border-red-500' : 'border-slate-200'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}

              {/* Slug */}
              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">/ruang-baca/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-artikel"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Slug akan otomatis dibuat dari judul jika dikosongkan
                </p>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Gambar Utama
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-violet-400 transition-colors">
                <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
                <input
                  type="text"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                  placeholder="Masukkan URL gambar..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-slate-400 text-xs mt-2">
                  Masukkan URL gambar dari Unsplash atau sumber lain
                </p>
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Ringkasan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Tulis ringkasan singkat yang menarik untuk artikel ini..."
                rows={3}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none ${
                  errors.excerpt ? 'border-red-500' : 'border-slate-200'
                }`}
              />
              {errors.excerpt && (
                <p className="text-red-500 text-xs mt-1">{errors.excerpt}</p>
              )}
              <p className="text-slate-400 text-xs mt-1">
                {formData.excerpt.length} karakter (direkomendasikan: 100-150 karakter)
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <Toolbar onAction={handleContentAction} />
              <textarea
                id="content-editor"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tulis konten artikel di sini... Gunakan toolbar untuk format teks

Contoh format:
&lt;h2&gt;Subjudul&lt;/h2&gt;
&lt;p&gt;Paragraf teks...&lt;/p&gt;
&lt;ul&gt;
  &lt;li&gt;Poin pertama&lt;/li&gt;
  &lt;li&gt;Poin kedua&lt;/li&gt;
&lt;/ul&gt;
&lt;a href='https://example.com'&gt;Link text&lt;/a&gt;"
                rows={20}
                className={`w-full px-4 py-3 font-mono text-sm focus:outline-none resize-none ${
                  errors.content ? 'border-red-500' : 'focus:ring-2 focus:ring-violet-500'
                }`}
              />
              {errors.content && (
                <p className="text-red-500 text-xs px-4 py-2">{errors.content}</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Kategori
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Pilih kategori...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon && `${cat.icon} `}{cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-amber-600 text-xs mt-2">
                  Belum ada kategori.{' '}
                  <Link href="/admin/categories" className="underline">
                    Buat kategori
                  </Link>
                </p>
              )}
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Status
              </label>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                  formData.status === 'draft'
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={() => setFormData({ ...formData, status: 'draft' })}
                    className="w-4 h-4 text-yellow-600"
                  />
                  <div>
                    <p className="font-bold text-sm text-slate-700">Draft</p>
                    <p className="text-xs text-slate-500">Belum dipublikasikan</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                  formData.status === 'published'
                    ? 'border-green-300 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={() => setFormData({ ...formData, status: 'published' })}
                    className="w-4 h-4 text-green-600"
                  />
                  <div>
                    <p className="font-bold text-sm text-slate-700">Terbit</p>
                    <p className="text-xs text-slate-500">Tampil di publik</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-violet-50 rounded-2xl p-6 border border-violet-200">
              <h3 className="font-bold text-violet-900 mb-3">Tips Menulis Artikel:</h3>
              <ul className="text-sm text-violet-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-violet-600">•</span>
                  Gunakan judul yang menarik dan relevant dengan target audiens
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600">•</span>
                  Tulis ringkasan yang menarik untuk SEO dan social media
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600">•</span>
                  Gunakan subheading (&lt;h2&gt;, &lt;h3&gt;) untuk memecah konten
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600">•</span>
                  Tambahkan gambar untuk membuat artikel lebih menarik
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 py-8">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl">
              {/* Preview Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Preview Artikel</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Preview Content */}
              <div className="p-8">
                {/* Featured Image */}
                {formData.featured_image_url && (
                  <img
                    src={formData.featured_image_url}
                    alt=""
                    className="w-full h-64 object-cover rounded-2xl mb-6"
                  />
                )}

                {/* Title */}
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  {formData.title || 'Judul Artikel'}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
                  <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>Oleh {user?.email?.split('@')[0] || 'Admin'}</span>
                </div>

                {/* Excerpt */}
                {formData.excerpt && (
                  <div className="bg-violet-50 p-4 rounded-xl mb-6 italic text-slate-700">
                    {formData.excerpt}
                  </div>
                )}

                {/* Content */}
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: formData.content || '<p class="text-slate-400">Konten artikel akan muncul di sini...</p>'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
