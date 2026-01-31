// --- ASSESSMENT RESULT SERVICE ---
// Handles saving and retrieving assessment results

import { supabase } from '../lib/supabaseClient';

/**
 * Check if user is logged in
 * @returns {Promise<{isLoggedIn: boolean, user?: any}>}
 */
export async function checkAuthStatus() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return { isLoggedIn: false, error: authError };
    }

    return {
      isLoggedIn: !!user,
      user
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { isLoggedIn: false, error };
  }
}

/**
 * Save assessment result to database (REQUIRES LOGIN)
 * @param {string} testType - Type of test ('bigfive', 'mbti', 'pss10', 'gad7')
 * @param {object} result - Test result data
 * @returns {Promise<{success: boolean, data?: any, error?: string, requiresLogin?: boolean}>}
 */
export async function saveAssessmentResult(testType, result) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return { success: false, error: 'Authentication error', requiresLogin: true };
    }

    if (!user) {
      // Login is now required to save results
      console.log('No user logged in, login required to save');
      return {
        success: false,
        error: 'Login diperlukan untuk menyimpan hasil tes',
        requiresLogin: true
      };
    }

    // Prepare data based on test type
    const assessmentData = {
      user_id: user?.id || null,
      test_type: testType,
      test_date: new Date().toISOString(),
      // Store different result formats
      scores: result.scores || result.totalScore || null,
      category: result.category || result.type || null,
      description: result.description || null,
      raw_result: result
    };

    // Check if table exists, if not we'll use localStorage fallback
    const { data, error } = await supabase
      .from('assessment_results')
      .insert([assessmentData])
      .select();

    if (error) {
      // If table doesn't exist, fall back to localStorage
      if (error.code === '42P01') { // undefined_table
        console.warn('assessment_results table does not exist, using localStorage fallback');
        return saveAssessmentResultToLocal(testType, result);
      }
      throw error;
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error saving assessment result:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save assessment result to localStorage (fallback)
 */
function saveAssessmentResultToLocal(testType, result) {
  try {
    const existing = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
    const newResult = {
      id: `local_${Date.now()}`,
      test_type: testType,
      test_date: new Date().toISOString(),
      result
    };
    existing.push(newResult);
    localStorage.setItem('kancahate_assessment_results', JSON.stringify(existing));
    return { success: true, data: newResult };
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all assessment results for current user
 * @returns {Promise<Array>}
 */
export async function getAssessmentResults() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Return local storage results for anonymous users
      const localResults = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
      return localResults;
    }

    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', user.id)
      .order('test_date', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        return JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
      }
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return [];
  }
}

/**
 * Get assessment results by test type
 * @param {string} testType - Type of test to filter by
 */
export async function getResultsByType(testType) {
  const allResults = await getAssessmentResults();
  return allResults.filter(r => r.test_type === testType);
}

/**
 * Delete an assessment result
 * @param {string} resultId - ID of result to delete
 */
export async function deleteAssessmentResult(resultId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && resultId.startsWith('local_')) {
      // Delete from localStorage
      const existing = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
      const filtered = existing.filter(r => r.id !== resultId);
      localStorage.setItem('kancahate_assessment_results', JSON.stringify(filtered));
      return { success: true };
    }

    const { error } = await supabase
      .from('assessment_results')
      .delete()
      .eq('id', resultId)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting result:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Export all user data (GDPR compliance)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function exportUserData() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Export localStorage data for anonymous users
      const localAssessments = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
      return {
        success: true,
        data: {
          user: null,
          assessments: localAssessments,
          export_date: new Date().toISOString()
        }
      };
    }

    // Get assessment results from database
    const { data: assessments, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', user.id);

    if (error && error.code !== '42P01') throw error;

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        assessments: assessments || [],
        export_date: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Request account deletion (GDPR compliance)
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function requestAccountDeletion() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'No user logged in' };
    }

    // Log deletion request (actual deletion should be done by admin/service role)
    const { error } = await supabase
      .from('deletion_requests')
      .insert([{
        user_id: user.id,
        email: user.email,
        requested_at: new Date().toISOString(),
        status: 'pending'
      }]);

    // If table doesn't exist, that's okay - just log it
    if (error && error.code !== '42P01') {
      console.warn('Could not log deletion request:', error);
    }

    return {
      success: true,
      message: 'Permintaan penghapusan akun telah dicatat. Tim kami akan menghubungi Anda dalam 7 hari kerja.'
    };
  } catch (error) {
    console.error('Error requesting deletion:', error);
    return { success: false, message: 'Gagal memproses permintaan' };
  }
}

/**
 * Get user profile from database
 * @returns {Promise<{success: boolean, profile?: object, error?: string}>}
 */
export async function getUserProfile() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Try to get from cache first
    const cacheKey = `user_profile_${user.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const profile = JSON.parse(cached);
        // Check if cache is less than 5 minutes old
        if (profile._cached_at && Date.now() - profile._cached_at < 5 * 60 * 1000) {
          console.log('[Profile] Loaded from cache');
          return { success: true, profile };
        }
      } catch (e) {
        // Invalid cache, continue to fetch
      }
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return { success: true, profile: null };
      }
      console.error('Error fetching profile:', error);
      return { success: false, error: error.message };
    }

    // Cache the result
    const profileWithCache = { ...data, _cached_at: Date.now() };
    localStorage.setItem(cacheKey, JSON.stringify(profileWithCache));

    return { success: true, profile: data };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create user profile
 * @param {object} profileData - Profile data (name, gender, dob, etc.)
 * @returns {Promise<{success: boolean, profile?: object, error?: string}>}
 */
export async function createUserProfile(profileData) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Calculate age from DOB
    let age = null;
    if (profileData.dob) {
      const today = new Date();
      const birthDate = new Date(profileData.dob);
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    const profile = {
      user_id: user.id,
      email: user.email,
      name: profileData.name,
      gender: profileData.gender,
      dob: profileData.dob,
      age: age,
      education_status: profileData.education_status,
      institution_type: profileData.institution_type,
      occupation: profileData.occupation,
      location: profileData.location,
      location_custom: profileData.location_custom
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return { success: false, error: error.message };
    }

    // Clear cache
    localStorage.removeItem(`user_profile_${user.id}`);

    console.log('[Profile] Created successfully');
    return { success: true, profile: data };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user profile
 * @param {object} profileData - Profile data to update
 * @returns {Promise<{success: boolean, profile?: object, error?: string}>}
 */
export async function updateUserProfile(profileData) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Calculate age from DOB if provided
    if (profileData.dob) {
      const today = new Date();
      const birthDate = new Date(profileData.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      profileData.age = age;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }

    // Clear cache
    localStorage.removeItem(`user_profile_${user.id}`);

    console.log('[Profile] Updated successfully');
    return { success: true, profile: data };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
}

export default {
  checkAuthStatus,
  saveAssessmentResult,
  getAssessmentResults,
  getResultsByType,
  deleteAssessmentResult,
  exportUserData,
  requestAccountDeletion,
  getUserProfile,
  createUserProfile,
  updateUserProfile
};
