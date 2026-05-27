import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema.js';
import { articles as staticArticles } from '../src/data/articles.js';

// Load env vars
config({ path: '.env' });
config({ path: '.env.local', override: true });

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('Seeding articles...');
  let count = 0;
  try {
    for (const article of staticArticles) {
      // Check if exists
      const existing = await db.select().from(schema.articles).where(eq(schema.articles.slug, article.slug));
      
      if (existing.length === 0) {
        const mappedData = {
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || '',
          content: article.content || '',
          category: article.category || 'Umum',
          coverImage: article.image || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
          status: 'published',
          authorName: article.author || 'Tim Kancah Ate',
          viewCount: Math.floor(Math.random() * 500) + 100,
          publishedAt: new Date(article.date || Date.now()),
        };
        
        await db.insert(schema.articles).values(mappedData);
        count++;
        console.log(`Inserted: ${article.title}`);
      } else {
        console.log(`Skipped: ${article.title} (already exists)`);
      }
    }
    console.log(`Successfully seeded ${count} articles!`);
  } catch (error) {
    console.error('Error seeding:', error);
  }
}

seed();
