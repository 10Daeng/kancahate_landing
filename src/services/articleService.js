// --- ARTICLE CMS SERVICE ---
// Handles CRUD operations for articles

import { supabase } from '../lib/supabaseClient';

/**
 * Get all categories
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('article_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    // Don't log error if table doesn't exist yet (expected during initial setup)
    if (!error.message?.includes('does not exist')) {
      console.error('Error fetching categories:', error);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Get published articles (for public pages)
 * @param {object} options - Filter options
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export async function getPublishedArticles({ categorySlug, limit = 10, offset = 0 } = {}) {
  try {
    let query = supabase
      .from('articles')
      .select(`
        *,
        category:article_categories(id, name, slug, color, icon)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by category if provided
    if (categorySlug) {
      const { data: category } = await supabase
        .from('article_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    // Don't log error if table doesn't exist yet (expected during initial setup)
    if (!error.message?.includes('does not exist') && !error.code?.includes('PGRST116')) {
      console.error('Error fetching articles:', error);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Get single article by slug
 * @param {string} slug - Article slug
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getArticleBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:article_categories(id, name, slug, color, icon)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;

    // Increment view count (fire and forget)
    if (data) {
      supabase.rpc('increment_article_views', { article_id: data.id });
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching article:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all articles for admin (including drafts)
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export async function getAllArticlesAdmin() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:article_categories(id, name, slug, color, icon)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching articles (admin):', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create new article
 * @param {object} articleData - Article data
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function createArticle(articleData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const article = {
      ...articleData,
      author_id: user?.id,
      slug: generateSlug(articleData.title),
      published_at: articleData.status === 'published' ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from('articles')
      .insert([article])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating article:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update article
 * @param {string} id - Article ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function updateArticle(id, updates) {
  try {
    // If publishing for the first time, set published_at
    if (updates.status === 'published' && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }

    // If title changed, update slug
    if (updates.title) {
      updates.slug = generateSlug(updates.title);
    }

    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating article:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete article
 * @param {string} id - Article ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteArticle(id) {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting article:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate URL-friendly slug from title
 * @param {string} title - Article title
 * @returns {string} - URL slug
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .trim()
    + '-' + Date.now().toString(36); // Add unique suffix
}

export default {
  getCategories,
  getPublishedArticles,
  getArticleBySlug,
  getAllArticlesAdmin,
  createArticle,
  updateArticle,
  deleteArticle
};
