'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Quote,
  Star
} from 'lucide-react';
import { Header, Footer } from '@/components/shared';

// Data tes psikologi yang tersedia
const testsData = [
  {
    id: 'phq9',
    name: 'PHQ-9',
    title: 'Cek Depresi',
    description: 'Patient Health Questionnaire untuk mengukur tingkat gejala depresi dalam 2 minggu terakhir.',
    duration: '3-5 menit',
    questions: 9,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-600',
    icon: Brain,
  },
  {
    id: 'gad7',
    name: 'GAD-7',
    title: 'Cek Kecemasan',
    description: 'Generalized Anxiety Disorder Scale untuk mengukur tingkat kecemasan umum.',
    duration: '2-4 menit',
    questions: 7,
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-600',
    icon: Wind,
  },
  {
    id: 'rosenberg',
    name: 'Rosenberg',
    title: 'Cek Harga Diri',
    description: 'Rosenberg Self-Esteem Scale untuk mengukur tingkat kepercayaan diri dan harga diri.',
    duration: '3-5 menit',
    questions: 10,
    color: 'from-amber-500 to-yellow-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-600',
    icon: Award,
  },
  {
    id: 'riasec',
    name: 'RIASEC',
    title: 'Tes Minat Karir',
    description: 'Holland Code untuk menemukan bidang karir yang sesuai dengan kepribadian dan minatmu.',
    duration: '3 menit',
    questions: 10,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-600',
    icon: Briefcase,
    featured: true,
  },
  {
    id: 'bigfive',
    name: 'Big Five',
    title: '5 Dimensi Kepribadian',
    description: 'Big Five Personality Test untuk mengetahui 5 dimensi utama kepribadianmu.',
    duration: '5 menit',
    questions: 30,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
    icon: Sparkles,
  },
  {
    id: 'mbti',
    name: 'MBTI',
    title: '16 Tipe Karakter',
    description: 'Myers-Briggs Type Indicator untuk menemukan 1 dari 16 tipe karaktermu.',
    duration: '4 menit',
    questions: 20,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-600',
    icon: Users,
  },
  {
    id: 'love_languages',
    name: 'Love Language',
    title: 'Bahasa Cinta',
    description: 'Temukan cara terbaik kamu merasa dicintai dan mengekspresikan sayang.',
    duration: '2 menit',
    questions: 10,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-600',
    icon: HeartHandshake,
    featured: true,
  },
  {
    id: 'vark',
    name: 'VARK',
    title: 'Gaya Belajar',
    description: 'Visual, Auditory, Read/Write, atau Kinesthetic? Maksimalkan cara belajarmu.',
    duration: '3 menit',
    questions: 16,
    color: 'from-teal-500 to-emerald-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-600',
    icon: Eye,
  },
  {
    id: 'multiple_intelligence',
    name: 'Multiple Intelligence',
    title: '8 Tipe Kecerdasan',
    description: 'Semua orang jenius. Temukan superpower unikmu menurut teori Howard Gardner.',
    duration: '5 menit',
    questions: 24,
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-600',
    icon: Lightbulb,
  },
];



export default function PsikotesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative py-12 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
          >
            <Sparkles size={14} />
            100% Gratis & Anonim
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3"
          >
            Tes Psikologi Mandiri
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-slate-500 max-w-xl mx-auto"
          >
            Kenali dirimu lebih dalam dengan tes psikologi yang sudah tervalidasi secara ilmiah.
          </motion.p>
        </div>
      </section>

      {/* Tests Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {testsData.map((test, index) => {
                const IconComponent = test.icon;
                return (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative bg-white rounded-2xl p-5 border ${test.borderColor} hover:shadow-lg transition-all duration-300 group overflow-hidden`}
                  >
                    {/* Featured Badge */}
                    {test.featured && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        POPULER
                      </div>
                    )}

                    {/* Background gradient on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${test.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />

                    {/* Icon */}
                    <div className={`w-14 h-14 ${test.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent size={28} className={test.textColor} />
                    </div>

                    {/* Content */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold ${test.textColor} bg-white px-2 py-0.5 rounded border ${test.borderColor}`}>
                        {test.name}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{test.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">{test.description}</p>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {test.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} />
                        {test.questions} pertanyaan
                      </span>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/?test=${test.id}`}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r ${test.color} text-white hover:shadow-lg hover:-translate-y-0.5`}
                    >
                      Mulai Tes
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tentang Tes Kami</h2>
          <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
            Semua tes yang tersedia menggunakan instrumen psikologis yang sudah tervalidasi secara ilmiah 
            dan digunakan secara luas oleh para profesional kesehatan mental.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Tervalidasi Ilmiah</h3>
              <p className="text-sm text-slate-500">Menggunakan instrumen yang diakui komunitas psikologi internasional</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">100% Anonim</h3>
              <p className="text-sm text-slate-500">Tidak perlu login, data tidak disimpan tanpa izinmu</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-purple-600" size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Hasil Instan</h3>
              <p className="text-sm text-slate-500">Dapatkan interpretasi hasil langsung setelah selesai</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Apa Kata Mereka?</h2>
            <p className="text-slate-500">Pengalaman pengguna yang sudah mencoba tes psikologi kami</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 - Pelajar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-2xl border border-violet-100 relative"
            >
              <Quote className="text-violet-300 mb-3" size={24} />
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">
                "Tes minat karirnya akurat banget! Ternyata aku cocoknya di bidang kreatif. Sekarang lebih percaya diri buat lanjut ke jurusan Desain. Orang tuaku juga dukung banget!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-200 rounded-full flex items-center justify-center text-violet-700 font-bold text-sm">
                  RA
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Rina Amalia</p>
                  <p className="text-xs text-slate-500">Siswa SMA Kelas 12</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 - Mahasiswa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 relative"
            >
              <Quote className="text-blue-300 mb-3" size={24} />
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">
                "Tes Multiple Intelligence bantu aku nemu kekuatan yang gak aku sadari. Ternyata aku tipe visual learner, jadi sekarang belajar jadi lebih efektif dan IPK naik!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                  DP
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Denny Pratama</p>
                  <p className="text-xs text-slate-500">Mahasiswa Semester 2</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 - Mahasiswa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 relative"
            >
              <Quote className="text-emerald-300 mb-3" size={24} />
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">
                "Dari tes ini aku jadi lebih ngerti gimana cara komunikasi yang baik sama orang tua dan sahabat. Hubungan sama keluarga jadi lebih harmonis!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                  SW
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Siti Wulandari</p>
                  <p className="text-xs text-slate-500">Mahasiswi Semester 4</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 bg-amber-50 border-t border-amber-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-amber-800">
            <strong>Disclaimer:</strong> Hasil tes ini bersifat <strong>screening awal</strong> dan bukan diagnosis klinis. 
            Untuk penanganan lebih lanjut, konsultasikan dengan Psikolog atau Psikiater profesional.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
