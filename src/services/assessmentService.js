// --- ASSESSMENT RESULT SERVICE ---
// Handles saving and retrieving assessment results using Neon.tech database

import { sql, getUserByToken } from '@/lib/db';

/**
 * Check auth token from cookie
 */
function getAuthToken() {
  // Client-side: read from localStorage (disimpan setelah login)
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    return token;
  }
  return null;
}

/**
 * Check if user is logged in
 * @returns {Promise<{isLoggedIn: boolean, user?: any, error?: any}>}
 */
export async function checkAuthStatus() {
  try {
    const token = getAuthToken();

    if (!token) {
      return { isLoggedIn: false, requiresLogin: true };
    }

    const user = await getUserByToken(token);

    if (!user) {
      return { isLoggedIn: false, requiresLogin: true };
    }

    return {
      isLoggedIn: true,
      user
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { isLoggedIn: false, error };
  }
}

/**
 * Save assessment result to database (REQUIRES LOGIN)
 * Falls back to localStorage if database fails or user not logged in
 * @param {string} testType - Type of test ('RIASEC', 'MBTI', 'PSS10', 'GAD7', etc)
 * @param {object} result - Test result data
 * @returns {Promise<{success: boolean, data?: any, error?: string, requiresLogin?: boolean, savedLocally?: boolean}>}
 */
export async function saveAssessmentResult(testType, result) {
  try {
    const token = getAuthToken();

    if (!token) {
      // Not logged in, but we now SAVE TO DB as Anonymous!
      console.log('No auth token, saving as anonymous to DB');
    }

    let user = null;
    if (token) {
      user = await getUserByToken(token);
    }

    // Prepare data for database
    const assessmentData = {
      user_id: user ? user.id : null,
      anon_user_id: result.anonUserId || null,
      email: user ? user.email : 'anonymous@kancahate.my.id',
      scores: result.scores || result.totalScore || null,
      test_type: testType,
      completed_at: new Date().toISOString()
    };

    // Save to database
    const dbResult = await saveAssessmentResultDB(assessmentData.user_id, testType, result, assessmentData);

    return { success: true, data: dbResult, savedLocally: false };

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
 * Save assessment result directly to database
 */
async function saveAssessmentResultDB(userId, testType, result, assessmentData) {
  const dbResult = await sql`
    INSERT INTO assessment_results (user_id, anon_user_id, email, assessment_type, scores, result_data, created_at)
    VALUES (${userId}, ${assessmentData.anon_user_id}, ${assessmentData.email}, ${testType}, ${JSON.stringify(assessmentData.scores)}, ${JSON.stringify(result)}, NOW())
    RETURNING id, created_at as completed_at
  `;

  return dbResult[0];
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
 * Retry saving a locally stored result to database
 * @param {string} localId - ID of local result to sync
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function retrySaveToDatabase(localId) {
  try {
    const token = getAuthToken();

    if (!token) {
      return { success: false, requiresLogin: true, message: 'Login diperlukan untuk menyimpan ke server' };
    }

    const user = await getUserByToken(token);

    if (!user) {
      return { success: false, requiresLogin: true, message: 'Sesi habis. Silakan login lagi.' };
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
      email: user.email,
      scores: resultToSync.result.scores || resultToSync.result.totalScore || null,
      test_type: resultToSync.test_type,
      completed_at: resultToSync.test_date || new Date().toISOString()
    };

    // Try to save to database
    await saveAssessmentResultDB(user.id, resultToSync.test_type, resultToSync.result, assessmentData);

    // Remove from local storage on success
    const updatedResults = localResults.filter(r => r.id !== localId);
    localStorage.setItem('kancahate_assessment_results', JSON.stringify(updatedResults));

    return { success: true, message: 'Berhasil disimpan ke server!' };
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
    const token = getAuthToken();

    if (!token) {
      return { synced: 0, failed: 0, requiresLogin: true };
    }

    const user = await getUserByToken(token);

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
    const token = getAuthToken();

    if (!token) {
      // Return local storage results for anonymous users
      const localResults = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
      return localResults;
    }

    const user = await getUserByToken(token);

    if (!user) {
      // Return local storage results for invalid token
      return JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
    }

    // Get results from database (Single Table)
    const allResults = [];
    try {
      const result = await sql`
        SELECT id, email, assessment_type as test_type, scores, result_data as result, created_at as completed_at
        FROM assessment_results
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
      `;

      if (result) {
        allResults.push(...result);
      }
    } catch (e) {
      console.error('Error fetching from assessment_results:', e);
    }

    // Combine with local results
    const localResults = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');

    return [...allResults, ...localResults].sort((a, b) =>
      new Date(b.completed_at || b.test_date) - new Date(a.completed_at || a.test_date)
    );

  } catch (error) {
    console.error('Error fetching assessment results:', error);
    // Return local results on error
    return JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
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
    const token = getAuthToken();

    if (!token && resultId.startsWith('local_')) {
      // Delete from localStorage
      const existing = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
      const filtered = existing.filter(r => r.id !== resultId);
      localStorage.setItem('kancahate_assessment_results', JSON.stringify(filtered));
      return { success: true };
    }

    if (!token) {
      return { success: false, error: 'Login diperlukan' };
    }

    const user = await getUserByToken(token);

    if (!user) {
      return { success: false, error: 'Sesi habis' };
    }

    // Delete from single table
    let deleted = false;
    try {
      const result = await sql`
        DELETE FROM assessment_results
        WHERE id = ${sql.safe(resultId)}
        AND user_id = ${user.id}
      `;
      if (result) deleted = true;
    } catch (e) {
      console.error('Error deleting from assessment_results:', e);
    }

    if (deleted) {
      return { success: true };
    } else {
      // Might be local result
      const existing = JSON.parse(localStorage.getItem('kancahate_assessment_results') || '[]');
      const filtered = existing.filter(r => r.id !== resultId);
      localStorage.setItem('kancahate_assessment_results', JSON.stringify(filtered));
      return { success: true };
    }

  } catch (error) {
    console.error('Error deleting result:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Legacy Profile Creation (MOCK)
 */
export async function createUserProfile(data) {
  console.warn('createUserProfile is deprecated. Profile handling should be migrated to Neon/NextAuth.');
  return { success: true, data: { id: 'legacy_mock', ...data } };
}

export default {
  checkAuthStatus,
  saveAssessmentResult,
  getAssessmentResults,
  getResultsByType,
  deleteAssessmentResult,
  retrySaveToDatabase,
  syncPendingResults,
  getPendingSyncCount,
  createUserProfile
};

