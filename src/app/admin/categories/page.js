'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';
import {
  Plus, Edit, Trash2, LogOut, Loader2, FolderOpen, ChevronLeft,
  AlertCircle, X, Save, BarChart3
} from 'lucide-react';

const PREDEFINED_COLORS = [
  { name: 'Violet', bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  { name: 'Blue', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { name: 'Green', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  { name: 'Red', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  { name: 'Amber', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  { name: 'Pink', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { name: 'Orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  { name: 'Teal', bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  { name: 'Slate', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
];

const PREDEFINED_ICONS = ['📚', '💡', '❤️', '🧠', '💪', '🎨', '💼', '🌱', '⭐', '🔥', '💬', '🎯', '📖'];

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '📚',
    color: PREDEFINED_COLORS[0].name.toLowerCase(),
  });

  const { data: sessionData, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    checkAuth();
  }, [sessionData, status]);

  const checkAuth = async () => {
    try {
      if (!sessionData) {
        router.push('/login?redirect=/admin/categories');
        return;
      }
      setUser(sessionData.user);
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

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || '';
  };

  const getColorClass = (colorName) => {
    const color = PREDEFINED_COLORS.find(c => c.name.toLowerCase() === colorName.toLowerCase());
    return color || PREDEFINED_COLORS[0];
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!formData.name.trim()) {
      alert('Nama kategori wajib diisi');
      return;
    }

    setSaving(true);
    try {
      const slug = formData.slug || generateSlug(formData.name);
      const colorData = getColorClass(formData.color);

      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from('article_categories')
          .update({
            name: formData.name,
            slug,
            icon: formData.icon,
            color: colorData.name.toLowerCase(),
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('article_categories')
          .insert({
            name: formData.name,
            slug,
            icon: formData.icon,
            color: colorData.name.toLowerCase(),
          });

        if (error) throw error;
      }

      // Reset form and refresh
      setFormData({
        name: '',
        slug: '',
        icon: '📚',
        color: PREDEFINED_COLORS[0].name.toLowerCase(),
      });
      setEditingCategory(null);
      setShowForm(false);
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Gagal menyimpan kategori: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '📚',
      color: category.color || 'violet',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      // Check if category is used by articles
      const { data: articles } = await supabase
        .from('articles')
        .select('id')
        .eq('category_id', id);

      if (articles && articles.length > 0) {
        alert('Kategori ini sedang digunakan oleh artikel. Hapus atau ubah kategori artikel terlebih dahulu.');
        return;
      }

      const { error } = await supabase
        .from('article_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Gagal menghapus kategori');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon: '📚',
      color: PREDEFINED_COLORS[0].name.toLowerCase(),
    });
    setEditingCategory(null);
    setShowForm(false);
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
              <h1 className="text-lg font-bold text-slate-800">Kelola Kategori</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"
              >
                <BarChart3 size={16} />
                Dashboard
              </Link>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  <Plus size={16} />
                  Kategori Baru
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                {editingCategory ? 'Edit Kategori' : 'Kategori Baru'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Kesehatan Mental"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">/kategori/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="kesehatan-mental"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                        formData.icon === icon
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Warna
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.name.toLowerCase() })}
                      className={`px-3 py-2 text-sm font-bold rounded-lg border-2 transition-all ${
                        formData.color === color.name.toLowerCase()
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingCategory ? 'Simpan Perubahan' : 'Buat Kategori'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        {categories.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <p className="text-sm text-slate-600">
                {categories.length} kategori tersedia
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {categories.map((category) => {
                const colorClass = getColorClass(category.color);
                return (
                  <div
                    key={category.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon Preview */}
                      <div className={`w-12 h-12 ${colorClass.bg} ${colorClass.border} rounded-xl flex items-center justify-center text-2xl`}>
                        {category.icon || '📁'}
                      </div>

                      {/* Category Info */}
                      <div>
                        <h3 className="font-bold text-slate-800">{category.name}</h3>
                        <p className="text-xs text-slate-500">/{category.slug}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(category.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Kategori</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              Buat kategori untuk mengelompokkan artikel-artikel Anda
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors"
            >
              <Plus size={18} />
              Buat Kategori Pertama
            </button>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Hapus Kategori?</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Kategori yang dihapus tidak dapat dikembalikan. Pastikan tidak ada artikel yang menggunakan kategori ini.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
