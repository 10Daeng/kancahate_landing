// --- USER MANAGEMENT SERVICE ---
// Handles user management operations for superadmin

import { supabase } from '@/lib/supabaseClient';

/**
 * Get all users with their roles and status
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users_list')
      .select('*')
      .limit(100);

    if (error) throw error;
    return { success: true, data };
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
    const { data: adminData, error } = await supabase
      .from('admin_users')
      .select(`
        *,
        user:auth.users!left(email, created_at)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: adminData };
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, isSuperadmin: false };

    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('banned', false)
      .eq('is_active', true)
      .single();

    if (error) return { success: false, isSuperadmin: false };

    return { success: true, isSuperadmin: data?.role === 'superadmin' };
  } catch (error) {
    console.error('Error checking superadmin:', error);
    return { success: false, isSuperadmin: false };
  }
}

/**
 * Get current user role
 */
export async function getCurrentUserRole() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, role: null };

    // Check admin_users first
    const { data: adminData, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('banned', false)
      .eq('is_active', true)
      .single();

    if (!error && adminData) {
      return { success: true, role: adminData.role };
    }

    // Check user_roles
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!roleError && roleData) {
      return { success: true, role: roleData.role };
    }

    return { success: true, role: 'user' };
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
    const { data, error } = await supabase.rpc('add_user_role', {
      target_user_id: userId,
      new_role: role,
      admin_id: adminId
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error assigning role:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ban or unban an admin
 */
export async function toggleAdminBan(adminUserId, ban, reason = null, adminId) {
  try {
    if (ban) {
      const { data, error } = await supabase.rpc('ban_user', {
        target_user_id: adminUserId,
        ban_reason: reason,
        admin_id: adminId
      });
      if (error) throw error;
      return { success: true, data };
    } else {
      const { data, error } = await supabase.rpc('unban_user', {
        target_user_id: adminUserId,
        admin_id: adminId
      });
      if (error) throw error;
      return { success: true, data };
    }
  } catch (error) {
    console.error('Error toggling admin ban:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ban or unban a regular user
 */
export async function toggleUserBan(userId, ban, reason = null, adminId) {
  try {
    // First check if user exists
    const { data: userData } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    if (ban) {
      const { data, error } = await supabase.rpc('ban_regular_user', {
        target_user_id: userId,
        ban_reason: reason,
        admin_id: adminId
      });
      if (error) throw error;
      return { success: true, data };
    } else {
      const { data, error } = await supabase.rpc('unban_regular_user', {
        target_user_id: userId,
        admin_id: adminId
      });
      if (error) throw error;
      return { success: true, data };
    }
  } catch (error) {
    console.error('Error toggling user ban:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reset user password (admin only)
 */
export async function resetUserPassword(userId, newPassword) {
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get audit log
 */
export async function getAuditLog(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select(`
        *,
        admin:auth.users!left(email),
        target:auth.users!left(email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return { success: false, error: error.message };
  }
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
