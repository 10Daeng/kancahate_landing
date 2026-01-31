'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Assign or update user role
 */
export async function assignUserRole(userId, email, role, adminId) {
  try {
    // Check if user exists
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // Update or insert user_roles
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingRole) {
      // Update existing role
      const { error } = await supabaseAdmin
        .from('user_roles')
        .update({
          role,
          updated_at: new Date().toISOString(),
          assigned_by: adminId
        })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Insert new role
      const { error } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          email: email || user.user?.email,
          role,
          assigned_by: adminId
        });

      if (error) throw error;
    }

    // Log to audit
    await supabaseAdmin
      .from('admin_audit_log')
      .insert({
        admin_id: adminId,
        action: existingRole ? 'update_role' : 'assign_role',
        target_user_id: userId,
        details: {
          old_role: existingRole?.role,
          new_role: role
        }
      });

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
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) throw error;

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
    if (isBanned) {
      // Ban user - update user metadata
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { banned: true, ban_reason: reason }
      });

      if (error) throw error;
    } else {
      // Unban user
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { banned: false, ban_reason: null }
      });

      if (error) throw error;
    }

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
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) throw error;

    return { success: true, users: data.users || [] };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message, users: [] };
  }
}

/**
 * Create new user
 */
export async function createNewUser(email, password, userData = {}) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userData
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;

    return { success: true, message: 'User berhasil dihapus' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}
