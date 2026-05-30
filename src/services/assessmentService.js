// --- ASSESSMENT RESULT SERVICE ---
// Handles saving and retrieving assessment results using Neon.tech database

// Removed db.js import since this file runs on the client.

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

    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return { isLoggedIn: false, requiresLogin: true };
    }

    const data = await response.json();
    return {
      isLoggedIn: true,
      user: data.user
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
      console.log('No auth token, saving as anonymous to DB');
    }

    // Save to database via API
    const dbResult = await saveAssessmentResultDB(testType, result);

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
async function saveAssessmentResultDB(testType, result) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/assessments', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      testType,
      result,
      anonUserId: result.anonUserId || null
    })
  });

  if (!response.ok) {
    throw new Error('Failed to save assessment to database');
  }

  return response.json();
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

    // Try to save to database
    await saveAssessmentResultDB(resultToSync.test_type, resultToSync.result);

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

    // Get results from database API
    const allResults = [];
    try {
      const response = await fetch('/api/assessments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
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

    // Delete from API
    let deleted = false;
    try {
      const response = await fetch(`/api/assessments?id=${encodeURIComponent(resultId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) deleted = true;
    } catch (e) {
      console.error('Error deleting from assessment_results API:', e);
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

