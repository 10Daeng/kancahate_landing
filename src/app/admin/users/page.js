'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabaseClient';
import {
  Users, Shield, ChevronLeft, Plus, Edit, Ban, Unlock,
  Loader2, AlertCircle, X, KeyRound, Search, RefreshCw,
  Crown, UserCog, User, ChevronLeft as ChevronLeftIcon, ChevronRight, BarChart3
} from 'lucide-react';
import {
  getAllUsers,
  getAdminsList,
  isCurrentUserSuperadmin,
  getAuditLog
} from '@/services/userManagementService';
import {
  resetUserPassword as resetUserPasswordAction,
  assignUserRole as assignUserRoleAction
} from '@/app/admin/actions';

// Card Slider Component
const CardSlider = ({ items, renderItem, itemsPerSlide = 3 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = Math.ceil(items.length / itemsPerSlide);
  const canGoNext = currentIndex < totalSlides - 1;
  const canGoPrev = currentIndex > 0;

  const nextSlide = () => {
    if (canGoNext) setCurrentIndex(currentIndex + 1);
  };

  const prevSlide = () => {
    if (canGoPrev) setCurrentIndex(currentIndex - 1);
  };

  if (items.length === 0) return null;

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevSlide}
          disabled={!canGoPrev}
          className={`p-2 rounded-xl transition-colors ${
            canGoPrev
              ? 'bg-violet-100 text-violet-600 hover:bg-violet-200'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeftIcon size={20} />
        </button>
        <span className="text-sm text-slate-500">
          {currentIndex + 1} / {totalSlides} ({items.length} items)
        </span>
        <button
          onClick={nextSlide}
          disabled={!canGoNext}
          className={`p-2 rounded-xl transition-colors ${
            canGoNext
              ? 'bg-violet-100 text-violet-600 hover:bg-violet-200'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slider Container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div
              key={slideIndex}
              className="min-w-full grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${itemsPerSlide}, 1fr)`,
              }}
            >
              {items
                .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                .map((item, itemIndex) => renderItem(item, slideIndex * itemsPerSlide + itemIndex))}
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-violet-600 w-8'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function UserManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // users | admins | audit

  // Data
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | banned

  // Modals
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showEditRole, setShowEditRole] = useState(null);
  const [showBanConfirm, setShowBanConfirm] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(null);

  // Form states
  const [addAdminForm, setAddAdminForm] = useState({ email: '', role: 'admin' });
  const [editRoleForm, setEditRoleForm] = useState({ role: 'admin' });
  const [banForm, setBanForm] = useState({ reason: '' });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const { data: sessionData, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    checkAuth();
  }, [sessionData, status]);

  const checkAuth = async () => {
    try {
      if (!sessionData) {
        router.push('/login?redirect=/admin/users');
        return;
      }
      setUser(sessionData.user);

      // Bypass superadmin check for now since DB is gone
      // We will handle real roles in Sprint 3
      setIsSuperadmin(true);

      // We won't fetch users right now because DB queries still use Supabase in userManagementService
      // await Promise.all([fetchUsers(), fetchAdmins(), fetchAuditLogs()]);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data, success } = await getAllUsers();
    if (success) {
      setUsers(data || []);
    }
  };

  const fetchAdmins = async () => {
    const { data, success } = await getAdminsList();
    if (success) {
      setAdmins(data || []);
    }
  };

  const fetchAuditLogs = async () => {
    const { data, success } = await getAuditLog(50);
    if (success) {
      setAuditLogs(data || []);
    }
  };

  const handleAddAdmin = async () => {
    if (!addAdminForm.email.trim()) {
      alert('Email wajib diisi');
      return;
    }

    setActionLoading(true);
    try {
      // Find user by email from auth.users
      const { data: { users: foundUsers }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;

      const targetUser = foundUsers?.find(u => u.email === addAdminForm.email);
      if (!targetUser) {
        alert('User dengan email tersebut tidak ditemukan');
        return;
      }

      // Assign role
      const result = await assignUserRole(targetUser.id, addAdminForm.role, user.id);

      if (result.success) {
        alert('Admin berhasil ditambahkan');
        setAddAdminForm({ email: '', role: 'admin' });
        setShowAddAdmin(false);
        await Promise.all([fetchUsers(), fetchAdmins()]);
      } else {
        alert('Gagal menambahkan admin: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Gagal menambahkan admin: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditRole = async (targetUser) => {
    setActionLoading(true);
    try {
      const result = await assignUserRoleAction(
        targetUser.id,
        targetUser.email,
        editRoleForm.role,
        user.id
      );

      if (result.success) {
        alert(result.message || 'Role berhasil diupdate');
        setShowEditRole(null);
        await Promise.all([fetchUsers(), fetchAdmins()]);
      } else {
        alert('Gagal mengupdate role: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Gagal mengupdate role: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBan = async (targetUser, isBanning) => {
    setActionLoading(true);
    try {
      const isAdmin = admins.some(a => a.user_id === targetUser.id);
      const result = isAdmin
        ? await toggleAdminBan(targetUser.id, isBanning, banForm.reason, user.id)
        : await toggleUserBan(targetUser.id, isBanning, banForm.reason, user.id);

      if (result.success) {
        alert(isBanning ? 'User berhasil dibanned' : 'User berhasil diunban');
        setShowBanConfirm(null);
        setBanForm({ reason: '' });
        await Promise.all([fetchUsers(), fetchAdmins()]);
      } else {
        alert('Gagal: ' + result.error);
      }
    } catch (error) {
      console.error('Error toggling ban:', error);
      alert('Gagal: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (targetUser) => {
    if (!passwordForm.password) {
      alert('Password baru wajib diisi');
      return;
    }
    if (passwordForm.password.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      alert('Password tidak cocok');
      return;
    }

    setActionLoading(true);
    try {
      const result = await resetUserPasswordAction(targetUser.id, passwordForm.password);

      if (result.success) {
        alert(result.message || 'Password berhasil direset');
        setShowResetPassword(null);
        setPasswordForm({ password: '', confirmPassword: '' });
      } else {
        alert('Gagal reset password: ' + result.error);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Gagal reset password: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter helpers
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && u.status === 'active') ||
      (statusFilter === 'banned' && u.status === 'banned');
    return matchesSearch && matchesStatus;
  });

  const filteredAdmins = admins.filter(a => {
    const email = a.user?.email || a.email || '';
    return email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get role badge
  const getRoleBadge = (role) => {
    const badges = {
      superadmin: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Crown },
      admin: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Shield },
      moderator: { bg: 'bg-green-100', text: 'text-green-700', icon: UserCog },
      user: { bg: 'bg-slate-100', text: 'text-slate-700', icon: User },
    };
    const badge = badges[role] || badges.user;
    const Icon = badge.icon;
    return { ...badge, Icon };
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get action label for audit log
  const getActionLabel = (action) => {
    const labels = {
      assign_role: 'Assign Role',
      update_role: 'Update Role',
      ban_admin: 'Banned Admin',
      unban_admin: 'Unbanned Admin',
      ban_user: 'Banned User',
      unban_user: 'Unbanned User',
    };
    return labels[action] || action;
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/articles"
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ChevronLeft size={20} />
              </Link>
              <h1 className="text-lg font-bold text-slate-800">User Management</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await Promise.all([fetchUsers(), fetchAdmins(), fetchAuditLogs()]);
                }}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"
              >
                <BarChart3 size={16} />
                Dashboard
              </Link>
              <Link
                href="/admin/articles"
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"
              >
                Articles
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{users.length}</p>
                <p className="text-xs text-slate-500">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 text-violet-600 rounded-xl">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{admins.length}</p>
                <p className="text-xs text-slate-500">Total Admins</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <UserCog size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {admins.filter(a => a.banned).length}
                </p>
                <p className="text-xs text-slate-500">Banned Admins</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <Ban size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {users.filter(u => u.status === 'banned').length}
                </p>
                <p className="text-xs text-slate-500">Banned Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-colors ${
                activeTab === 'users'
                  ? 'bg-violet-50 text-violet-700 border-b-2 border-violet-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users size={18} />
              Users
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-colors ${
                activeTab === 'admins'
                  ? 'bg-violet-50 text-violet-700 border-b-2 border-violet-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Shield size={18} />
              Admins
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-colors ${
                activeTab === 'audit'
                  ? 'bg-violet-50 text-violet-700 border-b-2 border-violet-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <RefreshCw size={18} />
              Audit Log
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari user berdasarkan nama atau email..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>

                {/* Users Slider */}
                {filteredUsers.length > 0 ? (
                  <CardSlider
                    items={filteredUsers}
                    itemsPerSlide={3}
                    renderItem={(u, index) => {
                      const roleBadge = getRoleBadge(u.role || u.admin_role);
                      const isCurrentUser = u.id === user?.id;

                      return (
                        <div
                          key={u.id || index}
                          className={`p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
                            u.status === 'banned'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-white border-slate-200 hover:border-violet-300'
                          }`}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                u.status === 'banned' ? 'bg-red-200 text-red-700' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                              }`}>
                                {(u.name || u.email || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{u.name || u.email?.split('@')[0] || '-'}</p>
                                <p className="text-xs text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Role</span>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${roleBadge.bg} ${roleBadge.text}`}>
                                <roleBadge.Icon size={12} />
                                {u.role || u.admin_role || 'user'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Status</span>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                u.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {u.status === 'banned' ? <Ban size={12} /> : <User size={12} />}
                                {u.status || 'active'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Joined</span>
                              <span className="text-xs text-slate-600">{formatDate(u.joined_at || u.created_at)}</span>
                            </div>
                            {u.ban_reason && (
                              <div className="pt-2 border-t border-slate-200">
                                <p className="text-xs text-red-500">{u.ban_reason}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                            <button
                              onClick={() => {
                                setShowEditRole(u);
                                setEditRoleForm({ role: u.role || u.admin_role || 'user' });
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors"
                            >
                              <Edit size={14} />
                              Role
                            </button>
                            <button
                              onClick={() => {
                                setShowResetPassword(u);
                                setPasswordForm({ password: '', confirmPassword: '' });
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-bold transition-colors"
                            >
                              <KeyRound size={14} />
                              Password
                            </button>
                            {u.status === 'banned' ? (
                              <button
                                onClick={() => {
                                  setShowBanConfirm(u);
                                  setBanForm({ reason: '' });
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg text-xs font-bold transition-colors"
                              >
                                <Unlock size={14} />
                                Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setShowBanConfirm(u);
                                  setBanForm({ reason: '' });
                                }}
                                disabled={isCurrentUser}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Ban size={14} />
                                Ban
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Tidak Ada User</h3>
                    <p className="text-slate-500">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Tidak ada user yang cocok dengan filter'
                        : 'Belum ada user terdaftar'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Admins Tab */}
            {activeTab === 'admins' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari admin..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddAdmin(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors"
                  >
                    <Plus size={16} />
                    Tambah Admin
                  </button>
                </div>

                {filteredAdmins.length > 0 ? (
                  <CardSlider
                    items={filteredAdmins}
                    itemsPerSlide={3}
                    renderItem={(admin, index) => {
                      const roleBadge = getRoleBadge(admin.role);
                      const isBanned = admin.banned;
                      const isCurrentUser = admin.user_id === user?.id;

                      return (
                        <div
                          key={admin.id || index}
                          className={`p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
                            isBanned
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200'
                          }`}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                isBanned ? 'bg-red-200 text-red-700' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                              }`}>
                                {(admin.user?.email || admin.email || 'A')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-800 text-sm">
                                    {admin.user?.email || admin.email}
                                  </p>
                                </div>
                                <p className="text-xs text-slate-500">
                                  Joined: {formatDate(admin.user?.created_at || admin.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Role</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${roleBadge.bg} ${roleBadge.text}`}>
                                <roleBadge.Icon size={10} />
                                {admin.role}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Status</span>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {isBanned ? <Ban size={12} /> : <Shield size={12} />}
                                {isBanned ? 'Banned' : 'Active'}
                              </span>
                            </div>
                            {admin.banned_at && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Banned</span>
                                <span className="text-xs text-red-500">{formatDate(admin.banned_at)}</span>
                              </div>
                            )}
                            {admin.ban_reason && (
                              <div className="pt-2 border-t border-slate-200">
                                <p className="text-xs text-red-500">{admin.ban_reason}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                            <button
                              onClick={() => {
                                setShowEditRole({ id: admin.user_id, role: admin.role, email: admin.user?.email || admin.email });
                                setEditRoleForm({ role: admin.role });
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors"
                            >
                              <Edit size={14} />
                              Role
                            </button>
                            <button
                              onClick={() => {
                                setShowResetPassword({ id: admin.user_id, email: admin.user?.email || admin.email });
                                setPasswordForm({ password: '', confirmPassword: '' });
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-bold transition-colors"
                            >
                              <KeyRound size={14} />
                              Password
                            </button>
                            {isBanned ? (
                              <button
                                onClick={() => {
                                  setShowBanConfirm({ id: admin.user_id, email: admin.user?.email || admin.email, is_admin: true });
                                  setBanForm({ reason: '' });
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg text-xs font-bold transition-colors"
                              >
                                <Unlock size={14} />
                                Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setShowBanConfirm({ id: admin.user_id, email: admin.user?.email || admin.email, is_admin: true });
                                  setBanForm({ reason: '' });
                                }}
                                disabled={isCurrentUser}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Ban size={14} />
                                Ban
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Shield size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Tidak Ada Admin</h3>
                    <p className="text-slate-500 mb-4">
                      {searchQuery ? 'Tidak ada admin yang cocok dengan pencarian' : 'Belum ada admin terdaftar'}
                    </p>
                    <button
                      onClick={() => setShowAddAdmin(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors"
                    >
                      <Plus size={18} />
                      Tambah Admin Pertama
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Audit Log Tab */}
            {activeTab === 'audit' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-800">Audit Log</h2>
                  <button
                    onClick={fetchAuditLogs}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>

                {auditLogs.length > 0 ? (
                  <CardSlider
                    items={auditLogs}
                    itemsPerSlide={3}
                    renderItem={(log, index) => (
                      <div
                        key={log.id || index}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-violet-100 text-violet-600 rounded-lg shrink-0">
                            <RefreshCw size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">
                              {getActionLabel(log.action)}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {log.admin?.email || 'Admin'}
                            </p>
                          </div>
                        </div>
                        {log.target?.email && (
                          <div className="mb-2">
                            <p className="text-xs text-slate-500">Target:</p>
                            <p className="text-xs font-medium text-slate-700 truncate">{log.target.email}</p>
                          </div>
                        )}
                        {log.details && (
                          <div className="mb-2">
                            <p className="text-xs text-slate-500">Details:</p>
                            <p className="text-xs text-slate-600 truncate">
                              {JSON.stringify(log.details)}
                            </p>
                          </div>
                        )}
                        <div className="pt-2 border-t border-slate-200">
                          <p className="text-xs text-slate-400">{formatDate(log.created_at)}</p>
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="text-center py-12">
                    <RefreshCw size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Aktivitas</h3>
                    <p className="text-slate-500">Audit log akan muncul di sini</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Tambah Admin Baru</h3>
              <button
                onClick={() => setShowAddAdmin(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email User <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={addAdminForm.email}
                  onChange={(e) => setAddAdminForm({ ...addAdminForm, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan email user yang sudah terdaftar
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={addAdminForm.role}
                  onChange={(e) => setAddAdminForm({ ...addAdminForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddAdmin(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddAdmin}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Tambah Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRole && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Edit Role</h3>
              <button
                onClick={() => setShowEditRole(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Mengubah role untuk: <span className="font-bold">{showEditRole.email}</span>
              </p>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Role Baru <span className="text-red-500">*</span>
                </label>
                <select
                  value={editRoleForm.role}
                  onChange={(e) => setEditRoleForm({ ...editRoleForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditRole(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleEditRole(showEditRole.id)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban/Unban Confirmation Modal */}
      {showBanConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Konfirmasi {showBanConfirm.is_admin ? 'Banned' : 'Banned/Unban'} User
                </h3>
                <p className="text-sm text-slate-500">{showBanConfirm.email}</p>
              </div>
            </div>

            {showBanConfirm.status !== 'banned' && (
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Alasan (Opsional)
                </label>
                <textarea
                  value={banForm.reason}
                  onChange={(e) => setBanForm({ reason: e.target.value })}
                  placeholder="Jelaskan alasan banned..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBanConfirm(null);
                  setBanForm({ reason: '' });
                }}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                Batal
              </button>
              {showBanConfirm.status !== 'banned' ? (
                <button
                  onClick={() => handleToggleBan(showBanConfirm, true)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Ya, Ban User'}
                </button>
              ) : (
                <button
                  onClick={() => handleToggleBan(showBanConfirm, false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Ya, Unban User'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
              <button
                onClick={() => setShowResetPassword(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Reset password untuk: <span className="font-bold">{showResetPassword.email}</span>
              </p>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Ulangi password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowResetPassword(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleResetPassword(showResetPassword)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
