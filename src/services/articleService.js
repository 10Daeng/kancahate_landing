'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getCategories() {
  try {
    const data = await db.select().from(schema.articleCategories).orderBy(schema.articleCategories.name);
    return { success: true, data };
  } catch (error) {
    if (!error.message?.includes('does not exist')) {
      console.error('Error fetching categories:', error);
    }
    return { success: false, error: error.message };
  }
}

export async function getPublishedArticles({ categorySlug, limit = 10, offset = 0 } = {}) {
  try {
    let baseQuery = db.select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      content: schema.articles.content,
      categoryId: schema.articles.categoryId,
      featuredImageUrl: schema.articles.featuredImageUrl,
      status: schema.articles.status,
      authorId: schema.articles.authorId,
      authorName: schema.articles.authorName,
      viewCount: schema.articles.viewCount,
      publishedAt: schema.articles.publishedAt,
      createdAt: schema.articles.createdAt,
      updatedAt: schema.articles.updatedAt,
      category: {
        id: schema.articleCategories.id,
        name: schema.articleCategories.name,
        slug: schema.articleCategories.slug,
        icon: schema.articleCategories.icon
      }
    })
    .from(schema.articles)
    .leftJoin(schema.articleCategories, eq(schema.articles.categoryId, schema.articleCategories.id))
    .where(eq(schema.articles.status, 'published'));

    if (categorySlug) {
      const category = await db.query.articleCategories.findFirst({
        where: eq(schema.articleCategories.slug, categorySlug)
      });
      if (category) {
        baseQuery = db.select({
            id: schema.articles.id,
            title: schema.articles.title,
            slug: schema.articles.slug,
            excerpt: schema.articles.excerpt,
            content: schema.articles.content,
            categoryId: schema.articles.categoryId,
            featuredImageUrl: schema.articles.featuredImageUrl,
            status: schema.articles.status,
            authorId: schema.articles.authorId,
            authorName: schema.articles.authorName,
            viewCount: schema.articles.viewCount,
            publishedAt: schema.articles.publishedAt,
            createdAt: schema.articles.createdAt,
            updatedAt: schema.articles.updatedAt,
            category: {
              id: schema.articleCategories.id,
              name: schema.articleCategories.name,
              slug: schema.articleCategories.slug,
              icon: schema.articleCategories.icon
            }
        })
        .from(schema.articles)
        .leftJoin(schema.articleCategories, eq(schema.articles.categoryId, schema.articleCategories.id))
        .where(sql`${schema.articles.status} = 'published' AND ${schema.articles.categoryId} = ${category.id}`);
      }
    }

    const data = await baseQuery.orderBy(desc(schema.articles.publishedAt)).limit(limit).offset(offset);

    // Map `category` to object instead of nested structure from join if needed
    return { success: true, data };
  } catch (error) {
    if (!error.message?.includes('does not exist') && !error.code?.includes('PGRST116')) {
      console.error('Error fetching articles:', error);
    }
    return { success: false, error: error.message };
  }
}

export async function getArticleBySlug(slug) {
  try {
    const data = await db.select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      content: schema.articles.content,
      categoryId: schema.articles.categoryId,
      featuredImageUrl: schema.articles.featuredImageUrl,
      status: schema.articles.status,
      authorId: schema.articles.authorId,
      authorName: schema.articles.authorName,
      viewCount: schema.articles.viewCount,
      publishedAt: schema.articles.publishedAt,
      createdAt: schema.articles.createdAt,
      updatedAt: schema.articles.updatedAt,
      category: {
        id: schema.articleCategories.id,
        name: schema.articleCategories.name,
        slug: schema.articleCategories.slug,
        icon: schema.articleCategories.icon
      }
    })
    .from(schema.articles)
    .leftJoin(schema.articleCategories, eq(schema.articles.categoryId, schema.articleCategories.id))
    .where(eq(schema.articles.slug, slug))
    .limit(1);

    const article = data[0];

    if (article) {
      // Fire and forget increment view count
      db.update(schema.articles)
        .set({ viewCount: sql`${schema.articles.viewCount} + 1` })
        .where(eq(schema.articles.id, article.id))
        .execute();
    }

    return { success: true, data: article || null };
  } catch (error) {
    console.error('Error fetching article:', error);
    return { success: false, error: error.message };
  }
}

export async function getArticleById(id) {
  try {
    const data = await db.select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      content: schema.articles.content,
      categoryId: schema.articles.categoryId,
      featuredImageUrl: schema.articles.featuredImageUrl,
      status: schema.articles.status,
      authorId: schema.articles.authorId,
      authorName: schema.articles.authorName,
      viewCount: schema.articles.viewCount,
      publishedAt: schema.articles.publishedAt,
      createdAt: schema.articles.createdAt,
      updatedAt: schema.articles.updatedAt,
      category: {
        id: schema.articleCategories.id,
        name: schema.articleCategories.name,
        slug: schema.articleCategories.slug,
        icon: schema.articleCategories.icon
      }
    })
    .from(schema.articles)
    .leftJoin(schema.articleCategories, eq(schema.articles.categoryId, schema.articleCategories.id))
    .where(eq(schema.articles.id, id))
    .limit(1);

    return { success: true, data: data[0] || null };
  } catch (error) {
    console.error('Error fetching article by id:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllArticlesAdmin() {
  try {
    const data = await db.select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      content: schema.articles.content,
      categoryId: schema.articles.categoryId,
      featuredImageUrl: schema.articles.featuredImageUrl,
      status: schema.articles.status,
      authorId: schema.articles.authorId,
      authorName: schema.articles.authorName,
      viewCount: schema.articles.viewCount,
      publishedAt: schema.articles.publishedAt,
      createdAt: schema.articles.createdAt,
      updatedAt: schema.articles.updatedAt,
      category: {
        id: schema.articleCategories.id,
        name: schema.articleCategories.name,
        slug: schema.articleCategories.slug,
        icon: schema.articleCategories.icon
      }
    })
    .from(schema.articles)
    .leftJoin(schema.articleCategories, eq(schema.articles.categoryId, schema.articleCategories.id))
    .orderBy(desc(schema.articles.createdAt));

    return { success: true, data };
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
      categoryId: articleData.category_id || articleData.categoryId,
      featuredImageUrl: articleData.featured_image_url || articleData.featuredImageUrl,
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
    if (updates.category_id !== undefined) mappedUpdates.categoryId = updates.category_id;
    if (updates.featured_image_url !== undefined) mappedUpdates.featuredImageUrl = updates.featured_image_url;
    
    if (updates.status) {
      mappedUpdates.status = updates.status;
      if (updates.status === 'published' && !updates.published_at) {
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


