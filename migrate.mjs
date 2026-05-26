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

async function migrate() {
  const { articles, categories } = await import('./src/data/articles.js');
  
  console.log(`Migrating ${articles.length} articles into Single Table...`);

  // Map slugs to names for static articles
  const catMap = {};
  for (const c of categories) {
    if (c.slug !== 'all') {
      catMap[c.slug] = c.name;
    }
  }

  // Articles
  let inserted = 0;
  for (const art of articles) {
    try {
      const exist = await sql`SELECT id FROM articles WHERE slug = ${art.slug}`;
      if (exist.length === 0) {
        const catName = catMap[art.categorySlug] || 'Umum';
        
        await sql`
          INSERT INTO articles (title, slug, content, excerpt, category, cover_image, status, tags) 
          VALUES (${art.title}, ${art.slug}, ${art.content}, ${art.excerpt}, ${catName}, ${art.image}, 'published', '[]')
        `;
        console.log(`Inserted article: ${art.title}`);
        inserted++;
      } else {
        console.log(`Skipped existing: ${art.title}`);
      }
    } catch (e) {
      console.error(`Error article ${art.title}:`, e.message);
    }
  }
  
  console.log(`Migration complete! Inserted ${inserted} articles.`);
}

migrate().catch(console.error);
