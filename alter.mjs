import fs from 'fs';
import { neon } from '@neondatabase/serverless';

// 1. Read ENV
const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
for (const line of envFile.split('\n')) {
  if (line.trim().startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].replace(/['"]/g, '').trim();
  if (line.trim().startsWith('NEXT_PUBLIC_NEON_DATABASE_URL=')) dbUrl = line.split('=')[1].replace(/['"]/g, '').trim();
}

const sql = neon(dbUrl);

async function alterTables() {
  console.log('Altering counseling_sessions...');
  try {
    await sql`ALTER TABLE "counseling_sessions" ADD COLUMN IF NOT EXISTS "session_id" varchar(255);`;
    await sql`ALTER TABLE "counseling_sessions" ADD COLUMN IF NOT EXISTS "anon_user_id" varchar(255);`;
    await sql`ALTER TABLE "counseling_sessions" ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT 'In Progress';`;
    await sql`ALTER TABLE "counseling_sessions" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;`;
    
    // Add unique constraint for session_id if not exists
    await sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'counseling_sessions_session_id_unique') THEN ALTER TABLE "counseling_sessions" ADD CONSTRAINT "counseling_sessions_session_id_unique" UNIQUE("session_id"); END IF; END $$;`;

    console.log('Creating assessment_results...');
    await sql`
      CREATE TABLE IF NOT EXISTS "assessment_results" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" uuid,
        "anon_user_id" varchar(255),
        "email" varchar(255),
        "assessment_type" varchar(100),
        "assessment_name" varchar(255),
        "score" integer,
        "max_score" integer,
        "severity" varchar(100),
        "result_data" jsonb,
        "created_at" timestamp DEFAULT now()
      );
    `;

    console.log('Database altered successfully!');
  } catch (error) {
    console.error('Error altering database:', error);
  }
}

alterTables();
