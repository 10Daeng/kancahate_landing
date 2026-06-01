'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  ChevronLeft, RefreshCw, Loader2, Shield, Eye, CheckCircle,
  AlertTriangle, Clock, X, FileText, ChevronRight, User,
  MapPin, Calendar, Phone, Mail, ClipboardList, Camera, Mic,
  Heart, BookOpen
} from 'lucide-react';

const INCIDENT_TYPE_LABELS = {
  kekerasan_fisik: 'Kekerasan Fisik',
  kekerasan_verbal: 'Kekerasan Verbal',
  bullying_fisik: 'Bullying Fisik',
  bullying_verbal: 'Bullying Verbal',
  bullying_psikologis: 'Bullying Psikologis/Sosial',
  bullying_siber: 'Bullying Siber (Cyberbullying)',
  intoleransi: 'Tindakan Intoleran',
};

const BULLYING_TYPE_LABELS = {
  fisik: 'Fisik',
  verbal: 'Verbal',
  psikologis: 'Psikologis/Sosial',
  siber: 'Siber',
};

const EVIDENCE_LABELS = {
  foto: 'Foto',
  video: 'Video',
  screenshot: 'Tangkapan Layar (Screenshot)',
  rekaman_suara: 'Rekaman Suara',
  visum: 'Surat Keterangan Medis/Visum',
  barang_rusak: 'Barang Pribadi yang Dirusak',
};

const STATUS_CONFIG = {
  baru: { label: 'Baru', color: 'bg-blue-100 text-blue-700', icon: Clock },
  ditinjau: { label: 'Ditinjau', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
  ditindaklanjuti: { label: 'Ditindaklanjuti', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  selesai: { label: 'Selesai', color: 'bg-slate-100 text-slate-600', icon: CheckCircle },
};

const SEVERITY_CONFIG = {
  rendah: { label: 'Rendah', color: 'bg-green-100 text-green-700' },
  sedang: { label: 'Sedang', color: 'bg-yellow-100 text-yellow-700' },
  tinggi: { label: 'Tinggi', color: 'bg-red-100 text-red-700' },
};

const REPORTER_STATUS_LABELS = {
  siswa: 'Siswa',
  orang_tua: 'Orang Tua',
  guru: 'Guru',
  saksi: 'Saksi',
  lainnya: 'Lainnya',
};

const PERSON_STATUS_LABELS = {
  siswa_internal: 'Siswa Satu Sekolah',
  siswa_luar: 'Siswa Sekolah Lain',
  guru_staf: 'Guru / Staf',
  masyarakat: 'Masyarakat Umum',
  keluarga: 'Orang Tua / Keluarga',
  lainnya: 'Lainnya'
};

export default function IncidentReportsAdmin() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const { data: sessionData, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    checkAuth();
  }, [sessionData, status]);

  useEffect(() => { if (filterStatus !== undefined) fetchReports(); }, [filterStatus]);

  const checkAuth = async () => {
    try {
      if (!sessionData) { router.push('/kancah-private-auth'); return; }
    } catch { router.push('/kancah-private-auth'); }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      const response = await fetch(`/api/incident-reports?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) setReports(data.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/incident-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id: reportId, status: newStatus, adminNotes }),
      });
      const data = await response.json();
      if (data.success) {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus, admin_notes: adminNotes || r.admin_notes } : r));
        setSelectedReport(prev => prev && prev.id === reportId ? { ...prev, status: newStatus, admin_notes: adminNotes || prev.admin_notes } : prev);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error updating report:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filterReports = filterStatus ? reports.filter(r => r.status === filterStatus) : reports;

  const DetailRow = ({ label, value, icon: Icon }) => (
    value ? (
      <div>
        <h4 className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-1.5">
          {Icon && <Icon size={14} />}{label}
        </h4>
        <p className="text-slate-800 text-sm">{value}</p>
      </div>
    ) : null
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 lg:px-10 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Shield size={24} className="text-rose-500" /> Laporan Kejadian
            </h1>
            <p className="text-sm text-slate-500 mt-1">Kelola laporan insiden kekerasan, bullying & intoleransi</p>
          </div>
          <button 
            onClick={fetchReports} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            <RefreshCw size={18} />
            Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const count = reports.filter(r => r.status === key).length;
            const IconComp = config.icon;
            return (
              <button key={key} onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${filterStatus === key ? 'border-violet-400 bg-violet-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-2"><IconComp size={16} /><span className="text-xs font-bold text-slate-500">{config.label}</span></div>
                <p className="text-2xl font-black text-slate-800">{count}</p>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-violet-600 animate-spin" /></div>
        ) : filterReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><FileText size={32} /></div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Laporan</h3>
            <p className="text-slate-400 text-sm">{filterStatus ? 'Tidak ada laporan dengan status ini' : 'Belum ada laporan kejadian yang masuk'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filterReports.map((report) => {
              const typeLabel = INCIDENT_TYPE_LABELS[report.incident_type] || report.incident_type;
              const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.baru;
              const severityConfig = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.sedang;
              const StatusIcon = statusConfig.icon;
              return (
                <button key={report.id} onClick={() => { setSelectedReport(report); setAdminNotes(report.admin_notes || ''); }}
                  className="w-full text-left bg-white rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-md transition-all p-5 group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600">{typeLabel}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${severityConfig.color}`}>{severityConfig.label}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${statusConfig.color}`}><StatusIcon size={12} />{statusConfig.label}</span>
                        {report.is_anonymous && <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-50 text-violet-600">Anonim</span>}
                      </div>
                      <p className="text-slate-800 font-bold text-sm mb-1 line-clamp-1">{report.chronology?.substring(0, 100) || report.description || '-'}{((report.chronology || report.description || '').length > 100) ? '...' : ''}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        {report.location && <span className="flex items-center gap-1"><MapPin size={12} />{report.location}</span>}
                        <span>{formatDate(report.created_at)}</span>
                        {report.is_anonymous ? <span className="text-violet-500 font-bold">Anonim</span> : <span>{report.reporter_name || report.reporter_email || 'Pengguna'}</span>}
                        {report.victims && report.victims.length > 0 && report.victims[0].name && <span className="text-blue-500">Korban: {report.victims[0].name}</span>}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-violet-400 transition-colors shrink-0 mt-2" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Shield size={20} className="text-rose-500" />Detail Laporan</h3>
                  <p className="text-sm text-slate-500 mt-1">{formatDate(selectedReport.created_at)}</p>
                </div>
                <button onClick={() => { setSelectedReport(null); setAdminNotes(''); }} className="p-2 hover:bg-white/50 rounded-lg transition-colors"><X size={20} className="text-slate-400" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600">{INCIDENT_TYPE_LABELS[selectedReport.incident_type] || selectedReport.incident_type}</span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${SEVERITY_CONFIG[selectedReport.severity]?.color || 'bg-slate-100 text-slate-600'}`}>{SEVERITY_CONFIG[selectedReport.severity]?.label || selectedReport.severity}</span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${STATUS_CONFIG[selectedReport.status]?.color || 'bg-slate-100 text-slate-600'}`}>{STATUS_CONFIG[selectedReport.status]?.label || selectedReport.status}</span>
                {selectedReport.is_anonymous && <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-50 text-violet-600">Anonim</span>}
              </div>

              {/* Section 1: Pelapor */}
              <div>
                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider"><User size={16} className="text-violet-500" />Identitas Pelapor</h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                  <DetailRow label="Nama" value={selectedReport.is_anonymous ? 'Anonim (identitas tersembunyi)' : (selectedReport.reporter_name || selectedReport.reporter_name || '-')} icon={User} />
                  <DetailRow label="Status" value={REPORTER_STATUS_LABELS[selectedReport.reporter_status] || selectedReport.reporter_status || '-'} />
                  <DetailRow label="Telepon" value={selectedReport.reporter_phone || '-'} icon={Phone} />
                  <DetailRow label="Email" value={selectedReport.reporter_email || '-'} icon={Mail} />
                </div>
              </div>

              {/* Section 2: Pelaku */}
              {selectedReport.perpetrators && selectedReport.perpetrators.length > 0 && selectedReport.perpetrators[0].name && (
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider"><AlertTriangle size={16} className="text-red-500" />Informasi Pelaku</h3>
                  <div className="space-y-3">
                    {selectedReport.perpetrators.map((perp, idx) => (
                      <div key={idx} className="bg-red-50 p-4 rounded-xl">
                        <div className="grid grid-cols-2 gap-4">
                          <DetailRow label="Nama Pelaku" value={perp.name || '-'} />
                          <DetailRow label="Status / Asal" value={PERSON_STATUS_LABELS[perp.status] || perp.status || '-'} />
                          {perp.status !== 'lainnya' && <DetailRow label="Kelas / Instansi" value={perp.kelas || '-'} />}
                          {perp.description && <div className="col-span-2"><h4 className="text-sm font-bold text-slate-500 mb-1">Ciri-ciri Fisik</h4><p className="text-slate-800 text-sm">{perp.description}</p></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Korban */}
              {selectedReport.victims && selectedReport.victims.length > 0 && selectedReport.victims[0].name && (
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider"><Heart size={16} className="text-blue-500" />Informasi Korban</h3>
                  <div className="space-y-3">
                    {selectedReport.victims.map((vic, idx) => (
                      <div key={idx} className="bg-blue-50 p-4 rounded-xl">
                        <div className="grid grid-cols-2 gap-4">
                          <DetailRow label="Nama Korban" value={vic.name || '-'} />
                          <DetailRow label="Status / Asal" value={PERSON_STATUS_LABELS[vic.status] || vic.status || '-'} />
                          {vic.status !== 'lainnya' && <DetailRow label="Kelas / Instansi" value={vic.kelas || '-'} />}
                          <DetailRow label="Hubungan dgn Pelaku" value={vic.relation || '-'} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Detail Kejadian */}
              <div>
                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider"><ClipboardList size={16} className="text-violet-500" />Detail Kejadian</h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                  <DetailRow label="Lokasi" value={selectedReport.location || '-'} icon={MapPin} />
                  <DetailRow label="Tanggal" value={selectedReport.incident_date ? new Date(selectedReport.incident_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} icon={Calendar} />
                  <DetailRow label="Waktu" value={selectedReport.incident_time || '-'} />
                </div>
                {selectedReport.bullying_types && selectedReport.bullying_types.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-bold text-slate-500 mb-2">Bentuk Bullying</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.bullying_types.map(bt => <span key={bt} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg">{BULLYING_TYPE_LABELS[bt] || bt}</span>)}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: Kronologi */}
              {selectedReport.chronology && (
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider"><FileText size={16} className="text-violet-500" />Kronologi Kejadian</h3>
                  <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl text-sm leading-relaxed">{selectedReport.chronology}</p>
                </div>
              )}

              {/* Saksi */}
              {selectedReport.witnesses && selectedReport.witnesses.length > 0 && selectedReport.witnesses.some(w => w.name) && (
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider"><User size={16} className="text-violet-500" />Saksi</h3>
                  <div className="space-y-2">
                    {selectedReport.witnesses.filter(w => w.name).map((w, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl text-sm flex items-center gap-3">
                        <span className="font-bold text-slate-700">{w.name}</span>
                        {w.kelas && <span className="text-slate-400">| Kelas: {w.kelas}</span>}
                        {w.role && <span className="text-slate-400">| Peran: {w.role}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bukti */}
              {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider"><Camera size={16} className="text-violet-500" />Bukti Pendukung</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.evidence.map(e => <span key={e} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{EVIDENCE_LABELS[e] || e}</span>)}
                  </div>
                </div>
              )}

              {/* Tindakan Awal */}
              {(selectedReport.initial_actions || selectedReport.reported_to_counselor) && (
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider"><ClipboardList size={16} className="text-violet-500" />Tindakan Awal</h3>
                  <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                    {selectedReport.reported_to_counselor && <p className="text-sm text-emerald-600 font-bold">Sudah dilaporkan ke Guru BK / Wali Kelas</p>}
                    {selectedReport.initial_actions && <p className="text-sm text-slate-700">{selectedReport.initial_actions}</p>}
                  </div>
                </div>
              )}

              {/* Nilai Dilanggar */}
              {selectedReport.values_violated && selectedReport.values_violated.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider"><BookOpen size={16} className="text-violet-500" />Nilai yang Dilanggar</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.values_violated.map((v, idx) => <span key={idx} className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg">{v}</span>)}
                  </div>
                </div>
              )}

              {/* Admin Notes & Actions */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-700 mb-3">Tindakan Admin</h4>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Tambahkan catatan untuk laporan ini..." rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none" />
                <div className="flex flex-wrap gap-2 mt-3">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const IconComp = config.icon;
                    return (
                      <button key={key} onClick={() => handleStatusUpdate(selectedReport.id, key)} disabled={updating || selectedReport.status === key}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${selectedReport.status === key ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : `${config.color} hover:opacity-80`}`}>
                        <IconComp size={12} />{config.label}
                        {updating && selectedReport.status !== key && <Loader2 size={12} className="animate-spin" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}