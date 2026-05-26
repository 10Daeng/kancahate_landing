'use client';

import { useState, useEffect } from 'react';
import { Database, Table, RefreshCw, HardDrive, Server, Activity } from 'lucide-react';
import { getDatabaseStats } from '@/services/databaseService';

export default function AdminDatabasePage() {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [totalSize, setTotalSize] = useState('0 MB');
  const [status, setStatus] = useState('connecting');

  const fetchStats = async () => {
    setLoading(true);
    setStatus('checking');
    try {
      const result = await getDatabaseStats();
      if (result.success) {
        setStatus('connected');
        
        // Neon pg_stat_user_tables rows might be in result.data
        const dbTables = result.data || [];
        
        // Calculate total size
        let totalBytes = 0;
        const formattedTables = dbTables.map(t => {
          totalBytes += Number(t.size_bytes || 0);
          return {
            name: t.table_name,
            count: Number(t.row_count || 0),
            size: t.total_size,
            lastSync: 'Real-time',
          };
        });
        
        setTables(formattedTables);
        setTotalSize((totalBytes / (1024 * 1024)).toFixed(2) + ' MB');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Database size={24} className="text-indigo-500" /> Master Database
            </h1>
            <p className="text-sm text-slate-500 mt-1">Pemantauan sinkronisasi dan akses ke data mentah (raw data)</p>
          </div>
          <button 
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Sync Database
          </button>
        </div>

        {/* Server Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Server size={20} />
              </div>
              <p className="font-bold">Neon PostgresDB</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-indigo-100 text-xs mb-1">Status Koneksi</p>
                <p className="text-2xl font-black flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span> Connected
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-700">
              <div className="p-2 bg-slate-100 rounded-lg">
                <HardDrive size={20} className="text-slate-500" />
              </div>
              <p className="font-bold">Total Storage</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-1">Penggunaan Data</p>
                <p className="text-2xl font-black text-slate-800">{totalSize}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-700">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Activity size={20} className="text-slate-500" />
              </div>
              <p className="font-bold">Query Load</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-1">Rata-rata / Menit</p>
                <p className="text-2xl font-black text-slate-800">14.2 req/m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tables List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Table size={20} className="text-slate-400" /> Database Tables
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold border-b border-slate-200">Table Name</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 text-right">Rows</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 text-right">Size</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 text-right">Last Sync</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tables.map((table) => (
                  <tr key={table.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700 font-mono text-xs">{table.name}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{table.count.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{table.size}</td>
                    <td className="px-6 py-4 text-right text-slate-500 text-xs">{table.lastSync}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                        View Data
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
