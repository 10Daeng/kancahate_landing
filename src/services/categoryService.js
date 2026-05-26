'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { sql } from 'drizzle-orm';
import { getCategories as getCategoriesFromArticle } from './articleService';

export async function getCategories() {
  // Use the one from articleService since categories are now just text on articles
  return getCategoriesFromArticle();
}

export async function createCategory(data) {
  return { success: false, error: 'Kategori sekarang dikelola langsung dari form artikel (Single Table Design).' };
}

export async function updateCategory(id, data) {
  return { success: false, error: 'Tidak didukung.' };
}

export async function deleteCategory(id) {
  return { success: false, error: 'Tidak didukung.' };
}
