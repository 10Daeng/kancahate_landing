// Script sementara untuk menjalankan migration SQL ke Neon
// Jalankan: node scripts/run-migration.mjs

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL tidak di-set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const migrationSQL = `
-- Migration 0001: Tambah kolom yang hilang & tabel NextAuth

-- Tabel untuk NextAuth (jika di-enable Google OAuth via adapter)
CREATE TABLE IF NOT EXISTS "accounts" (
  "userId" uuid NOT NULL,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "providerAccountId" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "sessionToken" text PRIMARY KEY NOT NULL,
  "userId" uuid NOT NULL,
  "expires" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "verificationTokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp NOT NULL,
  CONSTRAINT "verificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);

-- Foreign keys untuk tabel NextAuth
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
  NOT DEFERRABLE ON CONFLICT DO NOTHING;

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
  NOT DEFERRABLE ON CONFLICT DO NOTHING;

-- Kolom OTP & verification token di tabel users (untuk login flow)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_token" varchar(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "otp_code" varchar(10);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "otp_expires" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_token" varchar(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_expires" timestamp;

-- Kolom tambahan di admin_users
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "name" varchar(255);
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "banned" boolean DEFAULT false;
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "ban_reason" text;
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "banned_at" timestamp;
ALTER TABLE "admin_users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
`;

try {
  console.log('🚀 Menjalankan migration ke Neon...');
  
  // Jalankan setiap statement secara terpisah
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt + ';');
      console.log('✅', stmt.substring(0, 60) + '...');
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('duplicate')) {
        console.log('⏭️  (sudah ada)', stmt.substring(0, 60));
      } else {
        console.warn('⚠️  Peringatan:', e.message, '\n   Statement:', stmt.substring(0, 80));
      }
    }
  }

  console.log('\n✅ Migration selesai!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
