import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, uuid, varchar, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env.local') });

const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  try {
    const res = await db.select().from(articles);
    console.log("Found", res.length, "articles.");
  } catch (err) {
    console.error("DB Error:", err);
  }
}
run();
