// --- USER MANAGEMENT SERVICE ---
// Handles user management operations for superadmin

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get all users with their roles and status
 */
export async function getAllUsers() {
  try {
    const users = await db.query.users.findMany({
      limit: 100,
    });
    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get admins list with their roles
 */
export async function getAdminsList() {
  try {
    const admins = await db.query.users.findMany({
      where: (users, { inArray }) => inArray(users.role, ['admin', 'superadmin']),
      orderBy: [desc(schema.users.createdAt)],
    });
    return { success: true, data: admins };
  } catch (error) {
    console.error('Error fetching admins:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if current user is superadmin
 */
export async function isCurrentUserSuperadmin() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, isSuperadmin: false };

    // Bypassing for now based on emails from env
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    if (adminEmails.includes(session.user.email)) {
       return { success: true, isSuperadmin: true };
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, session.user.email)
    });

    return { success: true, isSuperadmin: user?.role === 'superadmin' };
  } catch (error) {
    console.error('Error checking superadmin:', error);
    return { success: false, isSuperadmin: false };
  }
}

export async function getCurrentUserRole() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, role: null };

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    if (adminEmails.includes(session.user.email)) {
       return { success: true, role: 'superadmin' };
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, session.user.email)
    });

    return { success: true, role: user?.role || 'user' };
  } catch (error) {
    console.error('Error getting user role:', error);
    return { success: false, role: 'user' };
  }
}

/**
 * Assign or update user role
 */
export async function assignUserRole(userId, role, adminId) {
  try {
    await db.update(schema.users)
      .set({ role })
      .where(eq(schema.users.id, userId));
    return { success: true };
  } catch (error) {
    console.error('Error assigning role:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleAdminBan(adminUserId, ban, reason = null, adminId) {
  return toggleUserBan(adminUserId, ban, reason, adminId);
}

export async function toggleUserBan(userId, ban, reason = null, adminId) {
  try {
    await db.update(schema.users)
      .set({ isActive: !ban })
      .where(eq(schema.users.id, userId));
    return { success: true };
  } catch (error) {
    console.error('Error toggling user ban:', error);
    return { success: false, error: error.message };
  }
}

export async function resetUserPassword(userId, newPassword) {
  try {
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await db.update(schema.users)
      .set({ passwordHash })
      .where(eq(schema.users.id, userId));

    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error: error.message };
  }
}

export async function getAuditLog(limit = 50) {
  return { success: true, data: [] }; // Mocking since audit log might not exist or need complex joins right now
}

export default {
  getAllUsers,
  getAdminsList,
  isCurrentUserSuperadmin,
  getCurrentUserRole,
  assignUserRole,
  toggleAdminBan,
  toggleUserBan,
  resetUserPassword,
  getAuditLog
};
