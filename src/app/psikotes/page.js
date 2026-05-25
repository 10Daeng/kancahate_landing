'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Brain,
  Briefcase,
  Wind,
  Sparkles,
  Users,
  Clock,
  CheckCircle,
  ChevronRight,
  Award,
  Eye,
  Lightbulb,
  HeartHandshake,
  Star,
  Zap,
} from 'lucide-react';
import { Header, Footer } from '@/components/shared';

const testsData = [
  {
    id: 'phq9',
    name: 'PHQ-9',
    title: 'Cek Depresi',
    description: 'Ukur tingkat gejala depresi kamu dalam 2 minggu terakhir.',
    duration: '3-5 menit',
    questions: 9,
    gradient: 'linear-gradient(135deg, #F43F5E, #EC4899)',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    emoji: '🫂',
    icon: Brain,
  },
  {
    id: 'gad7',
    name: 'GAD-7',
    title: 'Cek Kecemasan',
    description: 'Ukur tingkat kecemasan umummu dengan skala yang sudah tervalidasi.',
    duration: '2-4 menit',
    questions: 7,
    gradient: 'linear-gradient(135deg, #06B6D4, #10B981)',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    emoji: '🌬️',
    icon: Wind,
  },
  {
    id: 'rosenberg',
    name: 'Rosenberg',
    title: 'Cek Harga Diri',
    description: 'Ukur tingkat kepercayaan diri dan bagaimana kamu memandang dirimu sendiri.',
    duration: '3-5 menit',
    questions: 10,
    gradient: 'linear-gradient(135deg, #F59E0B, #F97316)',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    emoji: '⭐',
    icon: Award,
  },
  {
    id: 'riasec',
    name: 'RIASEC',
    title: 'Tes Minat Karir',
    description: 'Temukan bidang karir yang paling cocok sama kepribadian dan minatmu.',
    duration: '3 menit',
    questions: 10,
    gradient: 'linear-gradient(135deg, #7C3AED, #A855F7)',
    glowColor: 'rgba(124, 58, 237, 0.25)',
    emoji: '🚀',
    icon: Briefcase,
    featured: true,
  },
  {
    id: 'bigfive',
    name: 'Big Five',
    title: '5 Dimensi Kepribadian',
    description: 'Kenali 5 dimensi utama kepribadianmu menurut psikologi modern.',
    duration: '5 menit',
    questions: 30,
    gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    emoji: '🧩',
    icon: Sparkles,
  },
  {
    id: 'mbti',
    name: 'MBTI',
    title: '16 Tipe Karakter',
    description: 'Temukan 1 dari 16 tipe kepribadianmu — kamu tipe apa?',
    duration: '4 menit',
    questions: 20,
    gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    emoji: '🎭',
    icon: Users,
  },
  {
    id: 'love_languages',
    name: 'Love Language',
    title: 'Bahasa Cinta',
    description: 'Cara terbaik kamu merasa dicintai dan mengekspresikan kasih sayang.',
    duration: '2 menit',
    questions: 10,
    gradient: 'linear-gradient(135deg, #EC4899, #F97316)',
    glowColor: 'rgba(236, 72, 153, 0.25)',
    emoji: '💕',
    icon: HeartHandshake,
    featured: true,
  },
  {
    id: 'vark',
    name: 'VARK',
    title: 'Gaya Belajar',
    description: 'Visual, Auditory, R/W, atau Kinesthetic? Maksimalkan cara belajarmu.',
    duration: '3 menit',
    questions: 16,
    gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    emoji: '📚',
    icon: Eye,
  },
  {
    id: 'multiple_intelligence',
    name: 'Multiple Intelligence',
    title: '8 Tipe Kecerdasan',
    description: 'Semua orang jenius. Temukan superpower unikmu menurut Howard Gardner.',
    duration: '5 menit',
    questions: 24,
    gradient: 'linear-gradient(135deg, #6366F1, #7C3AED)',
    glowColor: 'rgba(99, 102, 241, 0.25)',
    emoji: '💡',
    icon: Lightbulb,
  },
];

function TestCard({ test, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const IconComponent = test.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.05 }}
      className="relative group"
    >
      <div
        className="h-full rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)';
          e.currentTarget.style.boxShadow = `0 24px 48px ${test.glowColor}, 0 4px 12px rgba(0,0,0,0.04)`;
          e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
        }}
      >
        {/* Gradient top strip */}
        <div className="h-1.5 w-full" style={{ background: test.gradient }} />

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 group-hover:rotate-3"
              style={{ background: test.gradient, boxShadow: `0 8px 20px ${test.glowColor}` }}
            >
              {test.emoji}
            </div>
            {test.featured && (
              <span
                className="text-xs font-bold text-white px-2.5 py-1 rounded-full"
                style={{ background: 'linear-gradient(135deg, #A855F7, #EC4899)' }}
              >
                🔥 POPULER
              </span>
            )}
          </div>

          {/* Badge */}
          <span
            className="inline-block text-xs font-bold px-2 py-0.5 rounded-lg mb-2"
            style={{
              background: `${test.glowColor}`,
              color: test.gradient.includes('F43F5E') ? '#BE123C' :
                     test.gradient.includes('06B6D4') ? '#0E7490' :
                     test.gradient.includes('F59E0B') ? '#92400E' :
                     test.gradient.includes('7C3AED') ? '#5B21B6' :
                     test.gradient.includes('3B82F6') ? '#1D4ED8' :
                     test.gradient.includes('EC4899') ? '#9D174D' : '#065F46',
            }}
          >
            {test.name}
          </span>

          <h3 className="text-xl font-extrabold text-slate-900 mb-2">{test.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">{test.description}</p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-slate-400 mb-5 font-medium">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {test.duration}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle size={11} />
              {test.questions} pertanyaan
            </span>
          </div>

          {/* CTA */}
          <Link
            href={`/?test=${test.id}`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5"
            style={{
              background: test.gradient,
              boxShadow: `0 4px 16px ${test.glowColor}`,
            }}
          >
            Mulai Tes
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function PsikotesPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{
      background: `
        radial-gradient(ellipse 70% 50% at 15% 10%, rgba(124,58,237,0.1) 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 85% 90%, rgba(236,72,153,0.08) 0%, transparent 60%),
        white
      `
    }}>
      <Header />

      {/* Hero */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-violet-700 mb-5"
            style={{
              background: 'rgba(245,243,255,0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(168,85,247,0.2)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.08)',
            }}
          >
            <Sparkles size={13} className="text-violet-600" />
            100% Gratis & Anonim ✨
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight"
          >
            Kenali Dirimu
            <br />
            <span style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Lebih Dalam 🧠
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.2 }}
            className="text-slate-500 max-w-xl mx-auto text-lg font-medium"
          >
            9 tes psikologi tervalidasi secara ilmiah. Gratis, instan, dan nggak perlu akun.
          </motion.p>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-400 font-semibold"
          >
            {[
              { icon: '🧪', text: '9 Tes Tersedia' },
              { icon: '⚡', text: 'Hasil Instan' },
              { icon: '🔒', text: 'Privasi Terjaga' },
            ].map(item => (
              <span key={item.text} className="flex items-center gap-1.5">
                <span>{item.icon}</span> {item.text}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tests Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testsData.map((test, index) => (
              <TestCard key={test.id} test={test} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Kenapa Percaya Tes Kami? 🤝</h2>
            <p className="text-slate-500">Bukan tes asal-asalan — semuanya berbasis riset ilmiah.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { emoji: '✅', title: 'Tervalidasi Ilmiah', desc: 'Instrumen yang diakui komunitas psikologi internasional', gradient: 'linear-gradient(135deg, #10B981, #06B6D4)' },
              { emoji: '👤', title: '100% Anonim', desc: 'Tidak perlu login, data tidak disimpan tanpa izinmu', gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)' },
              { emoji: '⚡', title: 'Hasil Instan', desc: 'Dapatkan interpretasi lengkap langsung setelah selesai', gradient: 'linear-gradient(135deg, #A855F7, #EC4899)' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.08 }}
                className="text-center p-6 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.7)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: item.gradient }}
                >
                  {item.emoji}
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="text-center p-5 rounded-2xl text-sm"
            style={{
              background: 'rgba(254,243,199,0.8)',
              border: '1px solid rgba(251,191,36,0.3)',
              color: '#92400E',
            }}
          >
            <strong>⚠️ Disclaimer:</strong> Hasil tes ini bersifat <strong>screening awal</strong> dan bukan diagnosis klinis.
            Untuk penanganan lebih lanjut, konsultasikan dengan Psikolog atau Psikiater profesional.
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
