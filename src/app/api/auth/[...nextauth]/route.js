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
        password: { label: "Password", type: "password" }
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
            throw new Error(`Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${minutesLeft} menit.`);
          }

          // Validasi Password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            // Catat kegagalan
            const newAttempts = (user.failedLoginAttempts || 0) + 1;
            const updateData = { failedLoginAttempts: newAttempts };
            
            // Kunci akun jika sudah 5x gagal
            if (newAttempts >= 5) {
              updateData.lockedUntil = new Date(Date.now() + 15 * 60000); // 15 menit dari sekarang
            }
            
            await db.update(schema.users)
              .set(updateData)
              .where(eq(schema.users.id, user.id));

            if (newAttempts >= 5) {
               throw new Error("Terlalu banyak percobaan gagal. Akun dikunci selama 15 menit.");
            }
            throw new Error("Email atau password salah.");
          }

          // Jika berhasil login, reset counter
          if (user.failedLoginAttempts > 0 || user.lockedUntil) {
            await db.update(schema.users)
              .set({ failedLoginAttempts: 0, lockedUntil: null })
              .where(eq(schema.users.id, user.id));
          }

          return user;

        } catch (e) {
          console.error("Login failed:", e);
          if (e.message.includes("Akun terkunci") || e.message.includes("salah")) {
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
