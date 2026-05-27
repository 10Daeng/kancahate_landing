'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { getAllArticlesAdmin, deleteArticle } from '@/services/articleService';
import { getCategories } from '@/services/categoryService';
import { checkIsAdmin } from '@/app/admin/actions';
import {
  Plus, Edit, Trash2, Eye, Search, Filter, LogOut,
  Loader2, FileText, Calendar, Clock, AlertCircle, BarChart3
} from 'lucide-react';

export default function AdminArticlesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: sessionData, status } = useSession();

  // Check auth and fetch data
  useEffect(() => {
    if (status === 'loading') return;
    checkAuth();
  }, [sessionData, status]);

  const checkAuth = async () => {
    try {
      if (!sessionData) {
        router.push('/login?redirect=/admin/articles');
        return;
      }

      const { isAdmin, user: adminUser } = await checkIsAdmin();
      if (!isAdmin) {
        router.push('/login?redirect=/admin/articles');
        return;
      }

      setUser(adminUser);
      await fetchArticles();
      await fetchCategories();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login?redirect=/admin/articles');
    } finally {
      setLoading(false);
    }
  };

  const [errorMsg, setErrorMsg] = useState('');

  const fetchArticles = async () => {
    try {
      const result = await getAllArticlesAdmin();
      if (!result.success) throw new Error(result.error);
      
      setArticles(result.data || []);
      setErrorMsg('');
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
      setErrorMsg(error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      if (!result.success) throw new Error(result.error);
      
      setCategories(result.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteArticle(id);
      if (!result.success) throw new Error(result.error);

      // Refresh list
      await fetchArticles();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Gagal menghapus artikel: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || article.categoryId === parseInt(filterCategory);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-green-100 text-green-700 border-green-200',
      draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    const labels = {
      published: 'Terbit',
      draft: 'Draft',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
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
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Publikasi & Artikel</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/categories"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Kelola Kategori</span>
            </Link>
            <Link
              href="/admin/articles/new"
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Artikel Baru</span>
            </Link>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <div>
              <p className="font-bold text-sm">Gagal Mengambil Data Database</p>
              <p className="text-xs">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Artikel</p>
                <p className="text-2xl font-black text-slate-800">{articles.length}</p>
              </div>
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                <FileText size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Terbit</p>
                <p className="text-2xl font-black text-green-600">
                  {articles.filter(a => a.status === 'published').length}
                </p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Eye size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Draft</p>
                <p className="text-2xl font-black text-yellow-600">
                  {articles.filter(a => a.status === 'draft').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <Clock size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Kategori</p>
                <p className="text-2xl font-black text-slate-800">
                  {categories.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Filter size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">Semua Status</option>
              <option value="published">Terbit</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <Link
              href="/admin/categories"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
            >
              <Filter size={16} />
              Kelola Kategori
            </Link>
          </div>
        </div>

        {/* Articles List */}
        {filteredArticles.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Judul Artikel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {article.featured_image_url && (
                            <img
                              src={article.featured_image_url}
                              alt=""
                              className="w-16 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">
                              {article.title}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {article.excerpt?.substring(0, 80)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {article.category ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                            style={{
                              backgroundColor: article.category.color + '20',
                              color: article.category.color,
                            }}
                          >
                            {article.category.icon && <span>{article.category.icon}</span>}
                            {article.category.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/ruang-baca/${article.slug}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            title="Lihat"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/admin/articles/edit/${article.id}`}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(article.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Tidak ada artikel yang cocok'
                : 'Belum ada artikel'}
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Mulai dengan membuat artikel pertama Anda'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
              <Link
                href="/admin/articles/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors"
              >
                <Plus size={18} />
                Buat Artikel Pertama
              </Link>
            )}
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
              <h3 className="text-lg font-bold text-slate-800">Hapus Artikel?</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Artikel yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin menghapus artikel ini?
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
