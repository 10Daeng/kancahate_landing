require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { pgTable, uuid, varchar, text, integer, jsonb, timestamp } = require('drizzle-orm/pg-core');

const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
});

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    const result = await db.select().from(articles);
    console.log("Articles count:", result.length);
    if (result.length > 0) console.log("First article:", result[0].title);
  } catch (e) {
    console.error("DB Error:", e);
  }
}
main();
