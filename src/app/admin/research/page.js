'use client';

import { useState } from 'react';
import { Search, FlaskConical, Download, Filter, BarChart3, TrendingUp, Users } from 'lucide-react';

export default function AdminResearchPage() {
  const [activeTab, setActiveTab] = useState('assessments');

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FlaskConical size={24} className="text-blue-500" /> Data Riset & Analitik
            </h1>
            <p className="text-sm text-slate-500 mt-1">Pusat data hasil asesmen psikologis untuk kepentingan riset</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm">
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Responden</p>
                <p className="text-3xl font-black text-slate-800">1,245</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Asesmen Selesai</p>
                <p className="text-3xl font-black text-slate-800">3,892</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <BarChart3 size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tren Bulan Ini</p>
                <p className="text-3xl font-black text-green-600">+15%</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
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
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Data Asesmen
          </button>
          <button
            onClick={() => setActiveTab('demographics')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'demographics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Demografi
          </button>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FlaskConical size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Modul Sedang Dikembangkan</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Fitur analisis mendalam untuk kebutuhan riset (seperti tabulasi silang, agregasi skor RIASEC/MBTI, dan distribusi demografi) akan segera hadir di pembaruan berikutnya.
          </p>
        </div>
      </main>
    </div>
  );
}
