'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getDashboardStats } from '@/services/dashboardService';
import { checkIsAdmin } from '@/app/admin/actions';
import {
  ChevronLeft, RefreshCw, Loader2, Users, UserCheck, UserX,
  FileText, Eye, TrendingUp, Calendar, Brain, Heart,
  Award, Target, Activity, Download, BarChart3
} from 'lucide-react';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, change, changeType, color }) => {
  const colorStyles = {
    violet: 'bg-violet-100 text-violet-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    pink: 'bg-pink-100 text-pink-600',
    teal: 'bg-teal-100 text-teal-600',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${
              changeType === 'up' ? 'text-green-600' : changeType === 'down' ? 'text-red-600' : 'text-slate-500'
            }`}>
              <TrendingUp size={14} />
              {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color] || colorStyles.violet}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

// Mini Chart Component (Simple bar representation)
const MiniChart = ({ data, max, color }) => {
  const bars = data?.slice(-7) || [];

  return (
    <div className="flex items-end gap-1 h-16">
      {bars.map((value, index) => {
        const height = max > 0 ? (value / max) * 100 : 0;
        return (
          <div
            key={index}
            className="flex-1 rounded-t transition-all hover:opacity-80"
            style={{
              height: `${Math.max(height, 4)}%`,
              backgroundColor: color
            }}
            title={`${value} views`}
          />
        );
      })}
    </div>
  );
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: sessionData, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    // User Stats
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    newUsersToday: 0,
    bannedUsers: 0,

    // Article Stats
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalArticleViews: 0,

    // Test Stats
    totalTestsTaken: 0,
    uniqueTestTakers: 0,
    avgTestsPerUser: 0,
    testsThisMonth: 0,

    // Test Breakdown
    riasecTests: 0,
    mbtiTests: 0,
    bigFiveTests: 0,
    varkTests: 0,
    loveLanguageTests: 0,
    miTests: 0,
    rimbTests: 0,

    // Daily Activity (last 7 days)
    dailyViews: [],
    dailyTests: [],
    dailyUsers: [],

    // Top Articles
    topArticles: [],

    // Top Tests
    topTests: [],
  });

  // Time period filter
  const [period, setPeriod] = useState('week'); // week, month, all

  useEffect(() => {
    if (status === 'loading') return;
    checkAuth();
  }, [sessionData, status]);

  const checkAuth = async () => {
    try {
      if (!sessionData) {
        router.push('/login?redirect=/admin/dashboard');
        return;
      }
      
      const { isAdmin, user: adminUser } = await checkIsAdmin();
      if (!isAdmin) {
        router.push('/login?redirect=/admin/dashboard');
        return;
      }
      
      setUser(adminUser);
      await fetchStats();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const result = await getDashboardStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getTestIcon = (testName) => {
    const icons = {
      'RIASEC': '🎯',
      'MBTI': '🧠',
      'Big Five': '📊',
      'VARK': '👁️',
      'Love Language': '❤️',
      'Multiple Intelligence': '💡',
      'RIMB': '👥',
    };
    return icons[testName] || '📝';
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Statistik</h1>
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
            change={`+${stats.newUsersThisMonth} bulan ini`}
            changeType="up"
            color="violet"
          />
          <StatCard
            icon={UserCheck}
            label="Users Aktif"
            value={stats.activeUsers}
            change={`${Math.round((stats.activeUsers / stats.totalUsers) * 100) || 0}% dari total`}
            changeType="neutral"
            color="green"
          />
          <StatCard
            icon={Brain}
            label="Tes Diambil"
            value={stats.totalTestsTaken}
            change={`+${stats.testsThisMonth} bulan ini`}
            changeType="up"
            color="blue"
          />
          <StatCard
            icon={FileText}
            label="Artikel Tayang"
            value={stats.publishedArticles}
            change={`${stats.totalArticles} total`}
            changeType="neutral"
            color="amber"
          />
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* User Stats */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Statistik User</h2>
              <Users className="text-violet-500" size={20} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">User Terdaftar</span>
                <span className="font-bold text-slate-800">{stats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-green-700">User Aktif</span>
                <span className="font-bold text-green-700">{stats.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <span className="text-sm text-red-700">User Dibanned</span>
                <span className="font-bold text-red-700">{stats.bannedUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <span className="text-sm text-blue-700">User Baru (Hari Ini)</span>
                <span className="font-bold text-blue-700">{stats.newUsersToday}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <span className="text-sm text-purple-700">User Baru (Bulan Ini)</span>
                <span className="font-bold text-purple-700">{stats.newUsersThisMonth}</span>
              </div>
            </div>
          </div>

          {/* Article Stats */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Statistik Artikel</h2>
              <FileText className="text-amber-500" size={20} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Total Artikel</span>
                <span className="font-bold text-slate-800">{stats.totalArticles}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-green-700">Artikel Terbit</span>
                <span className="font-bold text-green-700">{stats.publishedArticles}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <span className="text-sm text-amber-700">Draft</span>
                <span className="font-bold text-amber-700">{stats.draftArticles}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
                <span className="text-sm text-violet-700">Total Views</span>
                <span className="font-bold text-violet-700">{stats.totalArticleViews}</span>
              </div>
              {stats.totalArticles > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <span className="text-sm text-blue-700">Avg. Views/Artikel</span>
                  <span className="font-bold text-blue-700">
                    {stats.publishedArticles > 0 ? Math.round(stats.totalArticleViews / stats.publishedArticles) : 0}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Test Stats */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Statistik Tes</h2>
              <Brain className="text-blue-500" size={20} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Total Tes Diambil</span>
                <span className="font-bold text-slate-800">{stats.totalTestsTaken}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
                <span className="text-sm text-violet-700">User Pernah Tes</span>
                <span className="font-bold text-violet-700">{stats.uniqueTestTakers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <span className="text-sm text-blue-700">Rata-rata Tes/User</span>
                <span className="font-bold text-blue-700">{stats.avgTestsPerUser}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-green-700">Tes Bulan Ini</span>
                <span className="font-bold text-green-700">{stats.testsThisMonth}</span>
              </div>
              {stats.totalUsers > 0 && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <span className="text-sm text-purple-700">Conversion Rate</span>
                  <span className="font-bold text-purple-700">
                    {Math.round((stats.uniqueTestTakers / stats.totalUsers) * 100) || 0}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Tes Paling Populer</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { name: 'RIASEC', icon: '🎯', count: stats.riasecTests, color: 'bg-violet-100 text-violet-700' },
              { name: 'MBTI', icon: '🧠', count: stats.mbtiTests, color: 'bg-blue-100 text-blue-700' },
              { name: 'Big Five', icon: '📊', count: stats.bigFiveTests, color: 'bg-green-100 text-green-700' },
              { name: 'VARK', icon: '👁️', count: stats.varkTests, color: 'bg-amber-100 text-amber-700' },
              { name: 'Love Language', icon: '❤️', count: stats.loveLanguageTests, color: 'bg-pink-100 text-pink-700' },
              { name: 'Multiple Intelligence', icon: '💡', count: stats.miTests, color: 'bg-teal-100 text-teal-700' },
              { name: 'RIMB', icon: '👥', count: stats.rimbTests, color: 'bg-purple-100 text-purple-700' },
            ].map((test) => (
              <div key={test.name} className={`p-4 rounded-xl text-center ${test.color}`}>
                <div className="text-3xl mb-2">{test.icon}</div>
                <p className="text-xs font-bold mb-1">{test.name}</p>
                <p className="text-2xl font-bold">{test.count}</p>
                <p className="text-xs opacity-75">
                  {stats.totalTestsTaken > 0 ? Math.round((test.count / stats.totalTestsTaken) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Tests */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Aktivitas Tes (7 Hari)</h2>
              <Activity className="text-blue-500" size={20} />
            </div>
            <div className="flex gap-2 mb-2">
              {stats.activityDays?.map((day, i) => (
                <div key={i} className="flex-1 text-center">
                  <p className="text-xs text-slate-500">{day}</p>
                </div>
              ))}
            </div>
            <MiniChart data={stats.dailyTests} max={Math.max(...stats.dailyTests, 1)} color="#8B5CF6" />
            <div className="flex gap-2 mt-2">
              {stats.dailyTests?.map((val, i) => (
                <div key={i} className="flex-1 text-center">
                  <p className="text-xs font-bold text-slate-700">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily New Users */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">User Baru (7 Hari)</h2>
              <UserCheck className="text-green-500" size={20} />
            </div>
            <div className="flex gap-2 mb-2">
              {stats.activityDays?.map((day, i) => (
                <div key={i} className="flex-1 text-center">
                  <p className="text-xs text-slate-500">{day}</p>
                </div>
              ))}
            </div>
            <MiniChart data={stats.dailyUsers} max={Math.max(...stats.dailyUsers, 1)} color="#22C55E" />
            <div className="flex gap-2 mt-2">
              {stats.dailyUsers?.map((val, i) => (
                <div key={i} className="flex-1 text-center">
                  <p className="text-xs font-bold text-slate-700">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Articles */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Artikel Terpopuler</h2>
              <TrendingUp className="text-amber-500" size={20} />
            </div>
            {stats.topArticles?.length > 0 ? (
              <div className="space-y-3">
                {stats.topArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/ruang-baca/${article.slug}`}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-amber-100 text-amber-600' :
                      index === 1 ? 'bg-slate-200 text-slate-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{article.title}</p>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Eye size={14} />
                      <span className="text-sm font-medium">{article.view_count || 0}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">Belum ada artikel</p>
            )}
          </div>

          {/* Top Tests */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Tes Terpopuler</h2>
              <Target className="text-blue-500" size={20} />
            </div>
            <div className="space-y-3">
              {stats.topTests?.map((test, index) => (
                <div
                  key={test.name}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                    index === 0 ? 'bg-amber-100' :
                    index === 1 ? 'bg-slate-200' :
                    index === 2 ? 'bg-orange-100' :
                    'bg-slate-100'
                  }`}>
                    {test.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{test.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-800">{test.count}</span>
                    <span className="text-xs text-slate-500">
                      {stats.totalTestsTaken > 0 ? Math.round((test.count / stats.totalTestsTaken) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
