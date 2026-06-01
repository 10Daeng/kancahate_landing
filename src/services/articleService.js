'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';


export async function getCategories() {
  try {
    const data = await db.selectDistinct({ category: schema.articles.category }).from(schema.articles);
    
    const uniqueCats = data
      .filter(item => item.category)
      .map(item => ({
        id: item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: item.category,
        slug: item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }));

    return { success: true, data: uniqueCats };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: error.message };
  }
}

export async function getPublishedArticles({ categorySlug, limit = 10, offset = 0 } = {}) {
  try {
    let baseQuery = db.select().from(schema.articles).where(eq(schema.articles.status, 'published'));

    const data = await baseQuery.orderBy(desc(schema.articles.publishedAt)).limit(limit).offset(offset);

    // Map the results so frontend doesn't break
    const mappedData = data.map(article => ({
      ...article,
      featuredImageUrl: article.coverImage,
      category: article.category // now a string
    }));

    return { success: true, data: mappedData };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { success: false, error: error.message };
  }
}

export async function getArticleBySlug(slug) {
  try {
    const data = await db.select()
      .from(schema.articles)
      .where(eq(schema.articles.slug, slug))
      .limit(1);

    const article = data[0];

    if (article) {
      // Fire and forget increment view count
      db.update(schema.articles)
        .set({ viewCount: sql`${schema.articles.viewCount} + 1` })
        .where(eq(schema.articles.id, article.id))
        .execute();
      
      article.featuredImageUrl = article.coverImage;
    }

    return { success: true, data: article || null };
  } catch (error) {
    console.error('Error fetching article:', error);
    return { success: false, error: error.message };
  }
}

export async function getArticleById(id) {
  try {
    const data = await db.select()
      .from(schema.articles)
      .where(eq(schema.articles.id, id))
      .limit(1);
      
    if (data[0]) {
      data[0].featuredImageUrl = data[0].coverImage;
    }

    return { success: true, data: data[0] || null };
  } catch (error) {
    console.error('Error fetching article by id:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllArticlesAdmin() {
  try {
    const data = await db.select()
      .from(schema.articles)
      .orderBy(desc(schema.articles.createdAt));

    const mappedData = data.map(article => ({
      ...article,
      featuredImageUrl: article.coverImage,
    }));

    return { success: true, data: mappedData };
  } catch (error) {
    console.error('Error fetching articles (admin):', error);
    return { success: false, error: error.message };
  }
}

export async function createArticle(articleData) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    const mappedData = {
      title: articleData.title,
      slug: generateSlug(articleData.title),
      excerpt: articleData.excerpt,
      content: articleData.content,
      category: articleData.category || 'Umum',
      coverImage: articleData.featured_image_url || articleData.featuredImageUrl || articleData.coverImage,
      status: articleData.status || 'draft',
      authorId: user?.id || null,
      authorName: user?.name || null,
      publishedAt: articleData.status === 'published' ? new Date() : null
    };

    const newArticle = await db.insert(schema.articles)
      .values(mappedData)
      .returning();

    return { success: true, data: newArticle[0] };
  } catch (error) {
    console.error('Error creating article:', error);
    return { success: false, error: error.message };
  }
}

export async function updateArticle(id, updates) {
  try {
    const mappedUpdates = {};
    if (updates.title) {
        mappedUpdates.title = updates.title;
        mappedUpdates.slug = generateSlug(updates.title);
    }
    if (updates.excerpt !== undefined) mappedUpdates.excerpt = updates.excerpt;
    if (updates.content) mappedUpdates.content = updates.content;
    if (updates.category !== undefined) mappedUpdates.category = updates.category;
    if (updates.featured_image_url !== undefined || updates.coverImage !== undefined) {
      mappedUpdates.coverImage = updates.featured_image_url || updates.coverImage;
    }
    
    if (updates.status) {
      mappedUpdates.status = updates.status;
      if (updates.status === 'published' && !updates.publishedAt) {
        mappedUpdates.publishedAt = new Date();
      }
    }

    mappedUpdates.updatedAt = new Date();

    const data = await db.update(schema.articles)
      .set(mappedUpdates)
      .where(eq(schema.articles.id, id))
      .returning();

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error updating article:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteArticle(id) {
  try {
    await db.delete(schema.articles).where(eq(schema.articles.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting article:', error);
    return { success: false, error: error.message };
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    + '-' + Date.now().toString(36);
}
