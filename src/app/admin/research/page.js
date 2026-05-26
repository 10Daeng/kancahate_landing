'use client';

import { useState, useEffect } from 'react';
import { Search, FlaskConical, Download, Users, BarChart3, TrendingUp, Filter } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

export default function AdminResearchPage() {
  const [activeTab, setActiveTab] = useState('assessments');
  const [loading, setLoading] = useState(true);

  // Dummy data representing research analytics
  const demographicData = [
    { name: '13-15 Tahun (SMP)', value: 400 },
    { name: '16-18 Tahun (SMA)', value: 650 },
    { name: '19-22 Tahun (Kuliah)', value: 150 },
    { name: 'Lainnya', value: 45 },
  ];
  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  const assessmentCompletion = [
    { name: 'RIASEC', completed: 850, pending: 200 },
    { name: 'MBTI', completed: 1100, pending: 150 },
    { name: 'Multiple Intelligences', completed: 600, pending: 400 },
    { name: 'VARK', completed: 750, pending: 300 },
    { name: 'Love Languages', completed: 950, pending: 120 },
  ];

  const riasecRadarData = [
    { subject: 'Realistic', A: 120, fullMark: 150 },
    { subject: 'Investigative', A: 98, fullMark: 150 },
    { subject: 'Artistic', A: 86, fullMark: 150 },
    { subject: 'Social', A: 140, fullMark: 150 },
    { subject: 'Enterprising', A: 110, fullMark: 150 },
    { subject: 'Conventional', A: 90, fullMark: 150 },
  ];

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FlaskConical size={24} className="text-violet-500" /> Data Riset & Analitik
            </h1>
            <p className="text-sm text-slate-500 mt-1">Pusat data hasil asesmen psikologis untuk keperluan riset pendidikan</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors shadow-sm">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Responden</p>
                <p className="text-3xl font-black text-slate-800 mt-1">1,245</p>
              </div>
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                <Users size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Asesmen Selesai</p>
                <p className="text-3xl font-black text-slate-800 mt-1">4,250</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <BarChart3 size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tren Bulan Ini</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">+15%</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'assessments'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Statistik Asesmen
          </button>
          <button
            onClick={() => setActiveTab('demographics')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'demographics'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Profil Demografi
          </button>
        </div>

        {/* Dynamic Content based on Tab */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : activeTab === 'assessments' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Tingkat Penyelesaian Asesmen</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assessmentCompletion} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="completed" name="Selesai" stackId="a" fill="#8b5cf6" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="pending" name="Belum Selesai" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Agregasi Profil RIASEC</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riasecRadarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar name="Skor Rata-rata" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-bold text-slate-800 mb-4 w-full">Distribusi Rentang Usia</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {demographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Tabulasi Silang (Cross-tabulation)</h3>
              <p className="text-violet-100 text-sm max-w-sm mb-6">
                Ingin melihat korelasi antara profil kepribadian MBTI dengan minat karir RIASEC berdasarkan rentang usia?
              </p>
              <button className="px-6 py-2.5 bg-white text-violet-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Buat Laporan Khusus
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
