import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    // Add Google Provider if credentials exist
    ...(process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // EMERGENCY ADMIN LOGIN
        if (
          process.env.ADMIN_EMAIL &&
          process.env.ADMIN_PASSWORD &&
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "admin-emergency", email: credentials.email, role: 'admin', name: 'Superadmin' };
        }

        try {
          const user = await db.query.users.findFirst({
            where: eq(schema.users.email, credentials.email)
          });

          if (!user) {
            throw new Error("Email atau password salah.");
          }

          // Cek apakah akun sedang terkunci
          if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
            const minutesLeft = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
            throw new Error(`Akun terkunci. Coba lagi dalam ${minutesLeft} menit.`);
          }

          // Cek email verified
          if (!user.emailVerified) {
             throw new Error("Akun belum diverifikasi. Silakan cek email Anda.");
          }

          // Validasi Password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isPasswordValid) {
            // Logic pengurangan percobaan dipindahkan ke request-otp API, 
            // tapi kita tangkap jika langsung hit ke NextAuth salah password.
            throw new Error("Email atau password salah.");
          }

          // Cek OTP
          if (!credentials.otp) {
            throw new Error("Kode OTP diperlukan.");
          }

          if (user.otpCode !== credentials.otp) {
            throw new Error("Kode OTP salah.");
          }

          if (user.otpExpires && new Date() > new Date(user.otpExpires)) {
            throw new Error("Kode OTP sudah kedaluwarsa.");
          }

          // Jika berhasil login, reset counter dan hapus OTP
          await db.update(schema.users)
            .set({ failedLoginAttempts: 0, lockedUntil: null, otpCode: null, otpExpires: null })
            .where(eq(schema.users.id, user.id));

          return user;

        } catch (e) {
          console.error("Login failed:", e);
          if (e.message.includes("terkunci") || e.message.includes("salah") || e.message.includes("OTP") || e.message.includes("diverifikasi")) {
             throw e;
          }
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
