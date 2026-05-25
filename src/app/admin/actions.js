'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * Assign or update user role
 */
export async function assignUserRole(userId, email, role, adminId) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    await db.update(schema.users)
      .set({ role })
      .where(eq(schema.users.id, userId));

    return { success: true, message: `Role berhasil diubah menjadi ${role}` };
  } catch (error) {
    console.error('Error assigning role:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reset user password (admin only)
 * This server action uses service role to bypass RLS
 */
export async function resetUserPassword(userId, newPassword) {
  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(schema.users)
      .set({ passwordHash })
      .where(eq(schema.users.id, userId));

    return { success: true, message: 'Password berhasil direset' };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ban/unban user via admin
 */
export async function toggleUserBanStatus(userId, isBanned, reason = null) {
  try {
    await db.update(schema.users)
      .set({ isActive: !isBanned })
      .where(eq(schema.users.id, userId));

    return { success: true, message: isBanned ? 'User berhasil dibanned' : 'User berhasil diunban' };
  } catch (error) {
    console.error('Error toggling ban status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all users with auth info
 */
export async function getAllAuthUsers() {
  try {
    const users = await db.query.users.findMany();
    return { success: true, users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message, users: [] };
  }
}

export async function createNewUser(email, password, userData = {}) {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(schema.users).values({
      email,
      passwordHash,
      name: userData.name || '',
      role: userData.role || 'user',
    }).returning();

    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteUser(userId) {
  try {
    await db.delete(schema.users).where(eq(schema.users.id, userId));
    return { success: true, message: 'User berhasil dihapus' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}
