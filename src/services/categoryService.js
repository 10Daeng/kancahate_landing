'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  try {
    const categories = await db.query.articleCategories.findMany({
      orderBy: [desc(schema.articleCategories.name)],
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error('Error in getCategories:', error);
    return { success: false, error: error.message };
  }
}

export async function createCategory(data) {
  try {
    const [category] = await db.insert(schema.articleCategories)
      .values({
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        color: data.color,
      })
      .returning();

    revalidatePath('/admin/categories');
    return { success: true, data: category };
  } catch (error) {
    console.error('Error in createCategory:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCategory(id, data) {
  try {
    const [category] = await db.update(schema.articleCategories)
      .set({
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        color: data.color,
      })
      .where(eq(schema.articleCategories.id, id))
      .returning();

    revalidatePath('/admin/categories');
    return { success: true, data: category };
  } catch (error) {
    console.error('Error in updateCategory:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id) {
  try {
    // Check if category is used by articles
    const articles = await db.query.articles.findMany({
      where: eq(schema.articles.categoryId, id),
    });

    if (articles.length > 0) {
      return { success: false, error: 'Kategori ini sedang digunakan oleh artikel.' };
    }

    await db.delete(schema.articleCategories).where(eq(schema.articleCategories.id, id));
    
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    return { success: false, error: error.message };
  }
}
