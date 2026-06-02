'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { getUserCounselingSessions } from '@/services/counselingService';
import { getAssessmentResults } from '@/services/assessmentService';
import { checkIsAdmin } from '@/app/admin/actions';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Loader2, LogOut, Award, Calendar, ChevronRight, User, Activity, MessageCircle, Heart, X, Clock, Shield, Users, Link2, Share2, Copy, CheckCheck } from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null); // For chat detail modal
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const { data: sessionData, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    checkUserAndFetchData();
  }, [sessionData, status]);

  const checkUserAndFetchData = async () => {
    try {
      if (!sessionData) {
        router.push('/login');
        return;
      }
      setUser(sessionData.user);

      const { isAdmin: adminStatus } = await checkIsAdmin();
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        router.push('/admin/dashboard');
        return;
      }

      // Fetch assessments
      const results = await getAssessmentResults();
      setAssessments(results);

      // Fetch chat sessions
      const { data: sessions, success } = await getUserCounselingSessions(user.email);

      if (success && sessions) {
        setChatSessions(sessions);
      }

      // Fetch referral stats
      try {
        const refRes = await fetch('/api/referral/stats');
        const refData = await refRes.json();
        if (refData.success) setReferralCount(refData.count);
      } catch (_) {}
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header /> {/* Reusing main header, need to update it to support auth state display if needed, or just keep simple */}

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fade-in-up">
           <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                 Halo, {user?.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-slate-500 font-medium text-lg">
                 Selamat datang di dashboard kesehatan mentalmu.
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end text-sm text-slate-500">
                 <span className="font-bold text-slate-700">{user?.email}</span>
                 <span>Member sejak {new Date(user?.created_at).toLocaleDateString('id-ID', {year: 'numeric', month: 'long'})}</span>
              </div>
              {isAdmin ? (
                 <Link href="/admin/dashboard" className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all shadow-sm">
                   <Shield size={18} />
                   <span className="hidden sm:inline">Panel Admin</span>
                 </Link>
              ) : null}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl font-bold transition-all shadow-sm"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
           </div>
        </div>

        {/* Stats Cards (Mockup) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
              <div>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Total Tes</p>
                 <h3 className="text-3xl font-black text-slate-800">{assessments.length}</h3>
              </div>
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                 <Award size={24} />
              </div>
           </div>
           
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
              <div>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Status Keaktifan</p>
                 <h3 className="text-3xl font-black text-green-600">Aktif</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                 <Activity size={24} />
              </div>
           </div>

           <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => router.push('/#assessments')}>
              <div className="relative z-10">
                 <p className="font-bold text-white/80 text-sm mb-1">Tes Terbaru</p>
                 <h3 className="text-2xl font-bold">Coba Tes Baru</h3>
              </div>
              <div className="mt-4 flex items-center gap-2 font-bold text-sm bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                 Lihat Katalog <ChevronRight size={16} />
              </div>
              <div className="absolute -bottom-4 -right-4 text-white/10">
                 <Award size={100} />
              </div>
           </div>
        </div>

        {/* Undang Teman (Referral) */}
        <div className="mb-12 animate-fade-in-up" style={{animationDelay: '0.12s'}}>
          <div
            className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)' }}
          >
            {/* Decorative */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={20} className="text-white" />
                  <span className="text-white/80 font-bold text-sm uppercase tracking-wider">Undang Teman</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-1">
                  Ajak temanmu bergabung! 🎉
                </h3>
                <p className="text-white/75 text-sm mb-4">
                  Bagikan link ini ke temanmu. Saat mereka daftar via linkmu, kamu membantu mereka menemukan ruang aman untuk tumbuh.
                </p>
                {referralCount > 0 && (
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl mb-4">
                    <CheckCheck size={16} className="text-white" />
                    <span className="text-white font-bold text-sm">{referralCount} teman sudah bergabung via linkmu!</span>
                  </div>
                )}

                {/* Referral link */}
                <div className="flex gap-2">
                  <div
                    className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-mono"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <Link2 size={14} className="text-white/70 shrink-0" />
                    <span className="text-white truncate">kancahate.my.id/login?ref={user?.id}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://kancahate.my.id/login?ref=${user?.id}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                    style={{ background: copied ? 'rgba(16,185,129,0.9)' : 'rgba(255,255,255,0.9)', color: copied ? 'white' : '#7C3AED' }}
                  >
                    {copied ? <><CheckCheck size={16} /> Disalin!</> : <><Copy size={16} /> Salin</>}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Hai! Aku pakai Kancah Ate buat jaga kesehatan mental & tes kepribadian. Gratis lho! Coba juga yuk: https://kancahate.my.id/login?ref=${user?.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 text-white"
                    style={{ background: '#25D366' }}
                  >
                    <Share2 size={16} /> WA
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

         {/* Report Incident Banner */}
         <div className="mb-12 animate-fade-in-up" style={{animationDelay: '0.15s'}}>
           <Link href="/laporan-kejadian" className="block rounded-2xl overflow-hidden group">
             <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-6 md:p-8 text-white relative">
               <div className="absolute -bottom-4 -right-4 text-white/10">
                 <Shield size={120} />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                     <Shield size={24} />
                   </div>
                   <div>
                     <h3 className="font-bold text-xl">Lapor Kekerasan & Bullying</h3>
                     <p className="text-white/80 text-sm">Melapor itu berani. Identitasmu dijaga kerahasiaannya.</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 text-sm font-bold mt-4 bg-white/20 w-fit px-4 py-2 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                   Buat Laporan <ChevronRight size={16} />
                 </div>
               </div>
             </div>
           </Link>
         </div>

         {/* Recent Chat Sessions */}
        <div className="mb-12 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MessageCircle className="text-orange-500" size={20} />
              Riwayat Curhat
            </h2>
            <Link href="/#chat" className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1">
              Curhat Lagi <ChevronRight size={16} />
            </Link>
          </div>

          {chatSessions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {chatSessions.slice(0, 4).map((session) => (
                <div 
                  key={session.id} 
                  onClick={() => setSelectedSession(session)}
                  className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md hover:border-violet-200 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        session.category === 'Keluarga' ? 'bg-amber-100 text-amber-600' :
                        session.category === 'Karir' ? 'bg-blue-100 text-blue-600' :
                        session.category === 'Percintaan' ? 'bg-pink-100 text-pink-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <Heart size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{session.category || 'Curhat'}</h3>
                        <p className="text-xs text-slate-400">
                          {new Date(session.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      session.risk_level === 'Tinggi' ? 'bg-red-100 text-red-600' :
                      session.risk_level === 'Sedang' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {session.risk_level || 'Aman'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {session.summary || 'Sesi konseling dengan Kai'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} />
                      {session.chat_history?.length || 0} pesan
                    </span>
                    <span className="text-violet-600 font-bold group-hover:underline">
                      Lihat Detail →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                <MessageCircle size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Riwayat Curhat</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-4">
                Mulai berbagi cerita dengan Kai, teman cerita AI yang siap mendengarkan kapan saja.
              </p>
              <p className="text-sm text-slate-400">
                Klik tombol <span className="font-bold text-violet-600">"Mulai Curhat"</span> di header untuk memulai sesi baru.
              </p>
            </div>
          )}
        </div>

        {/* Recent Assessments Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up" style={{animationDelay: '0.2s'}}>
           <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <Calendar className="text-orange-500" size={20} />
                 Riwayat Tes Psikologi
              </h2>
           </div>

           <div className="overflow-x-auto">
              {assessments.length > 0 ? (
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                       <tr>
                          <th className="px-8 py-5">Tanggal</th>
                          <th className="px-8 py-5">Jenis Tes</th>
                          <th className="px-8 py-5">Hasil</th>
                          <th className="px-8 py-5">Kategori</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                       {assessments.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 py-5 text-slate-500 font-medium">
                                {new Date(item.test_date).toLocaleDateString('id-ID', {
                                   weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                })}
                             </td>
                             <td className="px-8 py-5 font-bold text-slate-800">
                                {formatTestType(item.test_type)}
                             </td>
                             <td className="px-8 py-5">
                                <span className="inline-block px-3 py-1 rounded-lg bg-violet-50 text-violet-700 font-bold">
                                   {formatScore(item)}
                                </span>
                             </td>
                             <td className="px-8 py-5 text-slate-600">
                                {item.category || item.result?.title || '-'}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              ) : (
                 <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                       <Award size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Belum ada riwayat tes</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                       Mulai perjalanan kesehatan mentalmu dengan mencoba salah satu tes psikologi kami.
                    </p>
                    <Link href="/psikotes" className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all">
                       Mulai Tes Sekarang
                    </Link>
                 </div>
              )}
           </div>
        </div>

      </main>

      {/* Chat Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-violet-50 to-orange-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedSession.category || 'Curhat'}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Clock size={14} />
                  {new Date(selectedSession.created_at).toLocaleDateString('id-ID', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSession(null)} 
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {selectedSession.chat_history && selectedSession.chat_history.length > 0 ? (
                selectedSession.chat_history.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-violet-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
                    }`}>
                      {msg.role !== 'user' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            K
                          </div>
                          <span className="text-xs font-bold text-violet-600">Kai</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.parts?.[0]?.text || msg.content || msg.text || 'Pesan tidak tersedia'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <MessageCircle size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">Riwayat chat tidak tersedia</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {selectedSession.chat_history?.length || 0} pesan • {selectedSession.status || 'Selesai'}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedSession(null)}
                    className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                  >
                    Tutup
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.setItem('kancahate_resume_session', JSON.stringify(selectedSession));
                      router.push('/');
                    }}
                    className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors"
                  >
                    Lanjutkan Sesi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Helper functions
function formatTestType(type) {
   const map = {
      'bigfive': 'Big Five Personality',
      'mbti': 'MBTI',
      'pss10': 'Tingkat Stres (PSS-10)',
      'gad7': 'Kecemasan (GAD-7)',
      'phq9': 'Depresi (PHQ-9)',
      'rosenberg': 'Harga Diri (Rosenberg)',
      'vark': 'Gaya Belajar (VARK)',
      'mi': 'Multiple Intelligence',
      'lovelanguages': 'Bahasa Cinta',
      'riasec': 'Minat Karir (RIASEC)'
   };
   return map[type] || type?.toUpperCase();
}

function formatScore(item) {
   if (item.scores && typeof item.scores === 'object') return 'Lihat Detail'; // Complex score
   return item.scores || item.result?.type || 'Selesai';
}
