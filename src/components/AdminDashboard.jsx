import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MoreHorizontal, 
  Eye, 
  Mail, 
  X,
  User,
  Users,
  MapPin,
  Calendar,
  GraduationCap,
  Loader2,
  AlertTriangle,
  Phone,
  Bell,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState('Memeriksa akses admin...');
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' or 'users'

  const { data: sessionData, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!sessionData) {
      setLoadingMsg('Sesi tidak ditemukan. Silakan login terlebih dahulu di halaman utama.');
      return;
    }

    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'lenterabatin.id@gmail.com')
      .split(',')
      .map(email => email.trim().toLowerCase());
    
    if (!adminEmails.includes(sessionData.user.email.toLowerCase())) {
         router.push('/');
         return;
    }

    setSession(sessionData);
    fetchSessions();
    fetchUsers();
  }, [sessionData, status]);

  const fetchSessions = async () => {
    setLoading(true);
    setLoadingMsg(''); 

    const { getAllSessions } = await import('@/services/adminService');
    const { success, data, error } = await getAllSessions();

    if (!success) {
      console.error("Error fetching sessions:", error);
      alert("Gagal mengambil data: " + error);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { getAllUsers } = await import('@/services/adminService');
    const { success, data: profiles, error } = await getAllUsers();

    if (!success) {
      console.error("Error fetching users:", error);
    } else {
      // Enrich with session count
      const enrichedUsers = (profiles || []).map(user => {
        const userSessions = sessions.filter(s => s.userEmail === user.email);
        return {
          ...user,
          session_count: userSessions.length,
          last_session: userSessions[0]?.createdAt || null
        };
      });
      setUsers(enrichedUsers);
    }
  };

  // Re-fetch users when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      fetchUsers();
    }
  }, [sessions]);
   
  // MODAL REPLY
  const ReplyModal = ({ data, onClose }) => {
    if (!data) return null;

    const mailtoLink = `mailto:${data.user_email}?subject=Balasan dari Kancah Ate - Sesi Konseling&body=Halo ${data.user_name},%0D%0A%0D%0ATerima kasih sudah berbagi cerita dengan Kancah Ate.%0D%0A%0D%0AKami telah membaca keluhanmu mengenai ${data.category}...`;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header Modal */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Review Sesi: {data.user_name}</h3>
              <p className="text-sm text-slate-500">ID: #{data.id} • {new Date(data.created_at).toLocaleDateString('id-ID')}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        
        {/* Crisis Alert Banner */}
        {(data.risk_level === 'Kritis' || data.risk_level === 'Tinggi') && (
          <div className={`p-4 flex items-center gap-3 ${data.risk_level === 'Kritis' ? 'bg-red-500' : 'bg-orange-500'} text-white`}>
            <AlertTriangle size={24} />
            <div>
              <span className="font-bold block">⚠️ PERHATIAN: Sesi Berisiko {data.risk_level}</span>
              {data.detected_keywords && (
                <span className="text-sm opacity-90">Kata kunci terdeteksi: {data.detected_keywords}</span>
              )}
            </div>
            <a href="tel:119" className="ml-auto flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold text-sm">
              <Phone size={16} /> Hubungi 119 ext 8
            </a>
          </div>
        )}

          <div className="flex-1 flex overflow-hidden">
            {/* Kolom Kiri: Detail User */}
            <div className="w-1/3 border-r border-gray-100 p-6 bg-white overflow-y-auto">
              <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4">Profil User</h4>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <User className="text-orange-500 mt-1" size={16} />
                  <div>
                    <span className="block font-medium text-slate-700">Identitas</span>
                    <span className="text-slate-500">{data.gender || '-'}, {data.age || '-'} Tahun</span>
                    {data.dob && <span className="text-xs text-slate-400 block">Lahir: {new Date(data.dob).toLocaleDateString('id-ID')}</span>}
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin size={10}/> {data.location}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="text-orange-500 mt-1" size={16} />
                  <div>
                    <span className="block font-medium text-slate-700">Pendidikan</span>
                    <span className="text-slate-500">{data.education_status} {data.institution_type ? `(${data.institution_type})` : ''}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-orange-500 mt-1" size={16} />
                  <div>
                    <span className="block font-medium text-slate-700">Email</span>
                    <span className="text-slate-500 break-all">{data.user_email}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-orange-50 rounded-xl">
                  <span className="text-xs font-bold text-orange-600 uppercase">Ringkasan Masalah</span>
                  <p className="mt-2 text-slate-700 leading-relaxed text-xs">{data.summary}</p>
                </div>

                <div className="mt-4">
                   <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                     data.risk_level === 'Tinggi' ? 'bg-red-100 text-red-600' :
                     data.risk_level === 'Sedang' ? 'bg-yellow-100 text-yellow-600' :
                     'bg-green-100 text-green-600'
                   }`}>
                     Resiko: {data.risk_level}
                   </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Log Chat & Action */}
            <div className="w-2/3 flex flex-col bg-slate-50/50">
               <div className="flex-1 p-6 overflow-y-auto space-y-4">
                 {data.chat_history && Array.isArray(data.chat_history) ? (
                   data.chat_history.map((chat, i) => (
                     <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                          chat.role === 'user' 
                          ? 'bg-white border border-gray-200 text-slate-700 rounded-br-none' 
                          : 'bg-orange-100 text-orange-800 rounded-bl-none'
                        }`}>
                          <span className="text-[10px] font-bold block mb-1 opacity-50 uppercase">{chat.role === 'model' ? 'Kai' : 'User'}</span>
                          {chat.parts[0].text}
                        </div>
                     </div>
                   ))
                 ) : (
                   <p className="text-center text-slate-400 italic">Riwayat chat tidak tersedia.</p>
                 )}
               </div>

               <div className="p-6 bg-white border-t border-gray-100">
                 <a 
                   href={mailtoLink}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-100 active:scale-95"
                 >
                   <Mail size={18} />
                   Balas via Email (Outlook/Gmail)
                 </a>
                 <p className="text-center text-xs text-slate-400 mt-3">Mengklik tombol ini akan membuka aplikasi email default Anda.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-6 px-4">
         <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="animate-spin text-slate-500" />
         </div>
         <p className="text-slate-500 font-medium text-center max-w-sm leading-relaxed">{loadingMsg}</p>
         
         <a href="/" className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Kembali ke Beranda
         </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Dashboard */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Konselor</h1>
            <p className="text-slate-500">Selamat datang, {session.user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/kancah-private-auth/articles" className="text-sm font-bold text-violet-600 hover:text-violet-700 bg-violet-50 px-4 py-2 rounded-lg">📝 CMS Artikel</a>
            <a href="/" className="text-sm font-bold text-slate-500 hover:text-orange-500">Ke Landing Page →</a>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Sessions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                <MessageCircle size={24} />
              </div>
              <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">
                Total
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{sessions.length}</h3>
            <p className="text-sm text-slate-500">Sesi Curhat</p>
          </div>

          {/* High Risk Sessions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                <AlertCircle size={24} />
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                Perlu Perhatian
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">
              {sessions.filter(s => s.risk_level === 'Kritis' || s.risk_level === 'Tinggi').length}
            </h3>
            <p className="text-sm text-slate-500">Risiko Tinggi/Kritis</p>
          </div>

          {/* Today's Sessions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <Calendar size={24} />
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                Hari Ini
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">
              {sessions.filter(s => {
                const today = new Date().toDateString();
                return new Date(s.created_at).toDateString() === today;
              }).length}
            </h3>
            <p className="text-sm text-slate-500">Sesi Baru</p>
          </div>

          {/* Unique Users */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <Users size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                Unique
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">
              {new Set(sessions.map(s => s.user_email)).size}
            </h3>
            <p className="text-sm text-slate-500">User Unik</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'sessions'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MessageCircle size={18} />
            Sesi Curhat
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'sessions' ? 'bg-white/20' : 'bg-slate-100'
            }`}>
              {sessions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users size={18} />
            User Management
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'users' ? 'bg-white/20' : 'bg-slate-100'
            }`}>
              {users.length}
            </span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={activeTab === 'sessions' ? "Cari nama, email, atau masalah..." : "Cari nama atau email user..."}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={18} /> Filter
          </button>
        </div>

        {/* Sessions Tab Content */}
        {activeTab === 'sessions' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="p-6">Tanggal</th>
                <th className="p-6">User</th>
                <th className="p-6">Pendidikan</th>
                <th className="p-6">Kategori</th>
                <th className="p-6">Resiko</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
                    Memuat data...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-16">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <MessageCircle size={48} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Sesi Curhat</h3>
                      <p className="text-slate-500 max-w-md mx-auto mb-6">
                        Sesi konseling dari user akan muncul di sini setelah mereka menggunakan fitur chat dengan Kai.
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <a 
                          href="/" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors"
                        >
                          <ExternalLink size={16} />
                          Buka Landing Page
                        </a>
                        <button 
                          onClick={() => window.location.reload()}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-colors"
                        >
                          <Loader2 size={16} />
                          Refresh
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sessions.filter(item => (item.user_name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="p-6">
                      <div className="font-bold text-slate-800">{item.user_name}</div>
                      <div className="text-xs text-slate-400">{item.gender || '-'}, {item.age || '-'}th</div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                        {item.education_status}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`font-bold ${
                        item.category === 'Keluarga' ? 'text-amber-600' :
                        item.category === 'Karir' ? 'text-blue-600' : 'text-purple-600'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="p-6">
                       <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${
                         item.risk_level === 'Tinggi' ? 'bg-red-50 text-red-600' :
                         item.risk_level === 'Sedang' ? 'bg-yellow-50 text-yellow-600' :
                         'bg-green-50 text-green-600'
                       }`}>
                         {item.risk_level}
                       </span>
                    </td>
                    <td className="p-6">
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.status === 'Selesai' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => setSelectedCase(item)}
                        className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Users Tab Content */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-6">User</th>
                  <th className="p-6">Email</th>
                  <th className="p-6">Pendidikan</th>
                  <th className="p-6">Lokasi</th>
                  <th className="p-6">Sesi</th>
                  <th className="p-6">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center">
                      <Loader2 className="animate-spin mx-auto text-slate-400" size={24} />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-16">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <Users size={48} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada User Terdaftar</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                          User yang telah melengkapi profil akan muncul di sini.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users
                    .filter(user => 
                      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {user.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{user.name || 'Tanpa Nama'}</span>
                              <span className="text-xs text-slate-400">{user.gender || '-'} • {user.age || '-'} tahun</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-slate-600">{user.email}</span>
                        </td>
                        <td className="p-6">
                          <span className="text-slate-600">{user.education_status || '-'}</span>
                          {user.institution_type && (
                            <span className="text-xs text-slate-400 block">{user.institution_type}</span>
                          )}
                        </td>
                        <td className="p-6">
                          <span className="text-slate-600">{user.location || '-'}</span>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.session_count > 0 
                              ? 'bg-violet-100 text-violet-600' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {user.session_count || 0} sesi
                          </span>
                        </td>
                        <td className="p-6">
                          <span className="text-slate-500 text-sm">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {selectedCase && (
        <ReplyModal data={selectedCase} onClose={() => setSelectedCase(null)} />
      )}
    </div>
  );
}
