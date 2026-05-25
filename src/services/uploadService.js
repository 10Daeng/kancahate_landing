'use server';

import { put } from '@vercel/blob';

export async function uploadImage(formData) {
  try {
    const file = formData.get('file');
    if (!file) {
      throw new Error('No file provided');
    }

    // You can customize the blob options here, e.g., access: 'public'
    const blob = await put(file.name, file, {
      access: 'public',
    });

    return { success: true, url: blob.url };
  } catch (error) {
    console.error('Error uploading image to Vercel Blob:', error);
    return { success: false, error: error.message };
  }
}
