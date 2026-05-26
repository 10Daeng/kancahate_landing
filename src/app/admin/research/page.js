'use client';

import { useState, useEffect } from 'react';
import { Search, FlaskConical, Download, Users, BarChart3, TrendingUp, Filter, MessageSquare, X } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { getResearchStats, getRawResearchData, getCurhatanData } from '@/services/researchService';

export default function AdminResearchPage() {
  const [activeTab, setActiveTab] = useState('assessments');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Modal for Curhatan details
  const [showCurhatanModal, setShowCurhatanModal] = useState(false);
  const [curhatanList, setCurhatanList] = useState([]);
  const [loadingCurhatan, setLoadingCurhatan] = useState(false);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const result = await getResearchStats();
    if (result.success) {
      setStats(result.data);
    }
    setLoading(false);
  };

  const handleExportCSV = async () => {
    const res = await getRawResearchData();
    if (!res.success || !res.data) return alert('Gagal mengambil data export');

    const data = res.data;
    if (data.length === 0) return alert('Data masih kosong');

    // Simple CSV conversion
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => {
      return Object.values(obj).map(val => {
        // Handle JSON or strings with commas
        let cell = val === null || val === undefined ? '' : String(val);
        if (typeof val === 'object') cell = JSON.stringify(val);
        cell = cell.replace(/"/g, '""');
        return `"${cell}"`;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KancahAte_RawData_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenCurhatan = async () => {
    setShowCurhatanModal(true);
    setLoadingCurhatan(true);
    const res = await getCurhatanData();
    if (res.success) {
      setCurhatanList(res.data);
    }
    setLoadingCurhatan(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

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
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm">
              <Download size={16} /> Export Raw Data (CSV)
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Responden</p>
                <p className="text-3xl font-black text-slate-800 mt-1">{stats?.totalRespondents || 0}</p>
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
                <p className="text-3xl font-black text-slate-800 mt-1">{stats?.totalAssessments || 0}</p>
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
                <p className="text-3xl font-black text-emerald-600 mt-1">Real-time</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'assessments'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Statistik Asesmen
          </button>
          <button
            onClick={() => setActiveTab('demographics')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'demographics'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Profil Demografi
          </button>
          <button
            onClick={() => setActiveTab('curhatan')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'curhatan'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Topik Curhatan
          </button>
        </div>

        {/* Dynamic Content based on Tab */}
        {activeTab === 'assessments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Tingkat Penyelesaian Asesmen</h3>
              <div className="h-72">
                {stats?.assessmentCompletion?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.assessmentCompletion} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="completed" name="Selesai" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Belum ada data asesmen</div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Agregasi Profil RIASEC</h3>
              <div className="h-72">
                {stats?.riasecRadarData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.riasecRadarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Skor Rata-rata" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Belum ada data RIASEC</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demographics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-bold text-slate-800 mb-4 w-full">Distribusi Rentang Usia Nyata</h3>
              <div className="h-72 w-full">
                {stats?.demographicData?.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.demographicData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.demographicData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Belum ada data demografi</div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Tabulasi Silang (Cross-tabulation)</h3>
              <p className="text-violet-100 text-sm max-w-sm mb-6">
                Ekspor data dalam bentuk CSV untuk melihat korelasi antar variabel menggunakan Excel atau SPSS.
              </p>
              <button onClick={handleExportCSV} className="px-6 py-2.5 bg-white text-violet-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Download Raw Data CSV
              </button>
            </div>
          </div>
        )}

        {activeTab === 'curhatan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-bold text-slate-800 mb-4 w-full">Jenis Topik Curhatan (Konseling)</h3>
              <div className="h-72 w-full">
                {stats?.curhatanSummary?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.curhatanSummary}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.curhatanSummary.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Belum ada sesi konseling</div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Detail Riwayat Curhatan</h3>
              <p className="text-slate-500 text-sm max-w-sm mb-6">
                Lihat ringkasan topik, subtopik, dan level risiko dari percakapan yang masuk secara real-time tanpa harus meninggalkan halaman ini.
              </p>
              <button onClick={handleOpenCurhatan} className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all">
                Buka Pop-up Detail
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Curhatan Modal */}
      {showCurhatanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare size={20} className="text-orange-500" />
                Detail Curhatan (100 Terakhir)
              </h2>
              <button onClick={() => setShowCurhatanModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {loadingCurhatan ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : curhatanList.length > 0 ? (
                <div className="space-y-4">
                  {curhatanList.map((session) => (
                    <div key={session.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded mb-2">
                            {session.category}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs font-bold rounded mb-2 ml-2 ${
                            session.riskLevel === 'Kritis' ? 'bg-red-100 text-red-700' : 
                            session.riskLevel === 'Tinggi' ? 'bg-orange-100 text-orange-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            Risiko {session.riskLevel || 'Rendah'}
                          </span>
                          <h4 className="font-bold text-slate-800">{session.subtopic}</h4>
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(session.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                        {session.summary || 'Belum ada ringkasan dari Kai...'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-10">Belum ada data curhatan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
