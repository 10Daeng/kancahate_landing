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
 * Falls back to localStorage if database fails
 * @param {string} testType - Type of test ('bigfive', 'mbti', 'pss10', 'gad7')
 * @param {object} result - Test result data
 * @returns {Promise<{success: boolean, data?: any, error?: string, requiresLogin?: boolean, savedLocally?: boolean}>}
 */
export async function saveAssessmentResult(testType, result) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      // Fallback to localStorage when auth fails
      const localSave = saveAssessmentResultToLocal(testType, result, true);
      return { 
        ...localSave, 
        requiresLogin: true,
        savedLocally: true,
        message: 'Hasil disimpan sementara di perangkat. Login untuk menyimpan ke akun.'
      };
    }

    if (!user) {
      // Login is required, but save to local first
      console.log('No user logged in, saving to localStorage');
      const localSave = saveAssessmentResultToLocal(testType, result, true);
      return {
        ...localSave,
        requiresLogin: true,
        savedLocally: true,
        message: 'Hasil disimpan sementara di perangkat. Login untuk menyimpan permanen ke akun.'
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

    // Try to save to database
    const { data, error } = await supabase
      .from('assessment_results')
      .insert([assessmentData])
      .select();

    if (error) {
      console.error('Database save error:', error);
      // Fallback to localStorage on any database error
      const localSave = saveAssessmentResultToLocal(testType, result, true);
      return { 
        ...localSave, 
        savedLocally: true,
        dbError: error.message,
        message: 'Gagal menyimpan ke server. Hasil disimpan sementara di perangkat.'
      };
    }

    return { success: true, data: data[0], savedLocally: false };
  } catch (error) {
    console.error('Error saving assessment result:', error);
    // Always fallback to localStorage on error
    const localSave = saveAssessmentResultToLocal(testType, result, true);
    return { 
      ...localSave, 
      savedLocally: true,
      dbError: error.message,
      message: 'Terjadi kesalahan. Hasil disimpan sementara di perangkat.'
    };
  }
}

/**
 * Save assessment result to localStorage (fallback)
 * @param {string} testType - Type of test
 * @param {object} result - Test result data
 * @param {boolean} pendingSync - Whether this result should be synced later
 */
function saveAssessmentResultToLocal(testType, result, pendingSync = false) {
  try {
    const existing = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
    const newResult = {
      id: `local_${Date.now()}`,
      test_type: testType,
      test_date: new Date().toISOString(),
      result,
      pendingSync // Mark for future sync if saved due to error
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
 * Retry saving a locally stored result to the database
 * @param {string} localId - ID of the local result to sync
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function retrySaveToDatabase(localId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, requiresLogin: true, message: 'Login diperlukan untuk menyimpan ke server' };
    }

    // Get local results
    const localResults = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
    const resultToSync = localResults.find(r => r.id === localId);
    
    if (!resultToSync) {
      return { success: false, message: 'Data tidak ditemukan di perangkat' };
    }

    // Prepare data for database
    const assessmentData = {
      user_id: user.id,
      test_type: resultToSync.test_type,
      test_date: resultToSync.test_date,
      scores: resultToSync.result.scores || resultToSync.result.totalScore || null,
      category: resultToSync.result.category || resultToSync.result.type || null,
      description: resultToSync.result.description || null,
      raw_result: resultToSync.result
    };

    // Try to save to database
    const { data, error } = await supabase
      .from('assessment_results')
      .insert([assessmentData])
      .select();

    if (error) {
      console.error('Retry sync error:', error);
      return { success: false, message: 'Gagal menyimpan ke server. Coba lagi nanti.' };
    }

    // Remove from local storage on success
    const updatedResults = localResults.filter(r => r.id !== localId);
    localStorage.setItem('kancahate_assessment_results', JSON.stringify(updatedResults));

    return { success: true, data: data[0], message: 'Berhasil disimpan ke server!' };
  } catch (error) {
    console.error('Error in retry sync:', error);
    return { success: false, message: 'Terjadi kesalahan. Coba lagi nanti.' };
  }
}

/**
 * Sync all pending local results to database
 * Call this after user logs in
 * @returns {Promise<{synced: number, failed: number}>}
 */
export async function syncPendingResults() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { synced: 0, failed: 0, requiresLogin: true };
    }

    const localResults = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
    const pendingResults = localResults.filter(r => r.pendingSync);
    
    let synced = 0;
    let failed = 0;

    for (const result of pendingResults) {
      const syncResult = await retrySaveToDatabase(result.id);
      if (syncResult.success) {
        synced++;
      } else {
        failed++;
      }
    }

    return { synced, failed };
  } catch (error) {
    console.error('Error syncing pending results:', error);
    return { synced: 0, failed: 0, error: error.message };
  }
}

/**
 * Get count of pending sync results
 * @returns {number}
 */
export function getPendingSyncCount() {
  try {
    const localResults = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
    return localResults.filter(r => r.pendingSync).length;
  } catch {
    return 0;
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
