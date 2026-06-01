// =============================================
// AUTH OPTIONS — Single Source of Truth
// Dipakai oleh:
//   - src/pages/api/auth/[...nextauth].js
//   - src/app/api/auth/[...nextauth]/route.js
//   - Semua getServerSession() calls
// =============================================

import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const authOptions = {
  // TIDAK menggunakan DrizzleAdapter karena kita pakai custom users table
  // dan JWT strategy (bukan database session)
  providers: [
    // Google OAuth — hanya aktif jika credentials tersedia
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Emergency admin login (env-based, tanpa DB)
        if (
          process.env.ADMIN_EMAIL &&
          process.env.ADMIN_PASSWORD &&
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: 'admin-emergency', email: credentials.email, role: 'admin', name: 'Superadmin' };
        }

        try {
          const user = await db.query.users.findFirst({
            where: eq(schema.users.email, credentials.email),
          });

          if (!user) throw new Error('Email atau password salah.');

          // Cek akun terkunci
          if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
            const minutesLeft = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
            throw new Error(`Akun terkunci. Coba lagi dalam ${minutesLeft} menit.`);
          }

          // Cek email verified
          if (!user.emailVerified) {
            throw new Error('Akun belum diverifikasi. Silakan cek email Anda.');
          }

          // Validasi password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isPasswordValid) throw new Error('Email atau password salah.');

          // Cek OTP
          if (!credentials.otp) throw new Error('Kode OTP diperlukan.');
          if (user.otpCode !== credentials.otp) throw new Error('Kode OTP salah.');
          if (user.otpExpires && new Date() > new Date(user.otpExpires)) {
            throw new Error('Kode OTP sudah kedaluwarsa.');
          }

          // Reset counter setelah login berhasil
          await db
            .update(schema.users)
            .set({ failedLoginAttempts: 0, lockedUntil: null, otpCode: null, otpExpires: null })
            .where(eq(schema.users.id, user.id));

          return user;
        } catch (e) {
          console.error('Login failed:', e.message);
          if (
            e.message.includes('terkunci') ||
            e.message.includes('salah') ||
            e.message.includes('OTP') ||
            e.message.includes('diverifikasi')
          ) {
            throw e;
          }
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
  },

  callbacks: {
    // Saat Google OAuth: simpan/update user ke tabel users kita
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existingUser = await db.query.users.findFirst({
            where: eq(schema.users.email, user.email),
          });

          if (!existingUser) {
            // Buat user baru dari Google
            const [newUser] = await db
              .insert(schema.users)
              .values({
                email: user.email,
                name: user.name || user.email.split('@')[0],
                emailVerified: new Date(), // Google sudah verifikasi email
                role: 'user',
                isActive: true,
                // passwordHash NULL — user Google tidak punya password
              })
              .returning({ id: schema.users.id, role: schema.users.role });

            user.id = newUser.id;
            user.role = newUser.role;
          } else {
            user.id = existingUser.id;
            user.role = existingUser.role;
          }
        } catch (error) {
          console.error('[Auth] Error handling Google signIn:', error);
          return false; // Tolak login jika gagal
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
