import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { articles as staticArticles } from '@/data/articles';

export async function GET(request) {
  try {
    const inserted = [];
    
    // Process each static article
    for (const article of staticArticles) {
      // Check if it exists
      const existing = await db.query.articles.findFirst({
        where: (articles, { eq }) => eq(articles.slug, article.slug)
      });
      
      if (!existing) {
        // Map the fields
        const mappedData = {
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || '',
          content: article.content || '',
          category: article.category || 'Umum',
          coverImage: article.image || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
          status: 'published',
          authorName: article.author || 'Tim Kancah Ate',
          viewCount: Math.floor(Math.random() * 500) + 100, // Random initial views
          publishedAt: new Date(article.date || Date.now()),
        };
        
        const newArticle = await db.insert(schema.articles)
          .values(mappedData)
          .returning();
          
        inserted.push(newArticle[0]);
      }
    }

    return NextResponse.json({ success: true, message: `Inserted ${inserted.length} articles`, data: inserted });
  } catch (error) {
    console.error('Error seeding articles:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
