// --- ANALYTICS SERVICE (Social Proof & User Stats)
// Mengelola data analytics untuk landing page dan dashboard

import { supabase } from '../lib/supabaseClient';

/**
 * Get social proof statistics untuk landing page
 * Digunakan untuk menampilkan kepercayaan publik
 * @returns {Promise<object>} - Social proof stats
 */
export async function getSocialProof() {
  try {
    const { data, error } = await supabase.rpc('get_social_proof');

    if (error) throw error;

    // Format data untuk display
    return {
      totalUsers: data.total_users || 0,
      totalSessions: data.total_sessions || 0,
      activeUsers7d: data.active_users_7d || 0,
      activeUsers30d: data.active_users_30d || 0,
      totalAssessments: data.total_assessments || 0,
      mostPopularCategory: data.most_popular_category || 'Psikologi',
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('[Analytics] Error fetching social proof:', error);
    // Return default values jika error
    return {
      totalUsers: 0,
      totalSessions: 0,
      activeUsers7d: 0,
      activeUsers30d: 0,
      totalAssessments: 0,
      mostPopularCategory: 'Psikologi',
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * Get category popularity untuk display
 * @param {number} limit - Berapa banyak top kategori yang ditampilkan
 * @returns {Promise<Array>} - Array of {category, session_count, percentage}
 */
export async function getCategoryPopularity(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('category_popularity')
      .select('*')
      .order('session_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[Analytics] Error fetching category popularity:', error);
    return [];
  }
}

/**
 * Get risk level distribution
 * @returns {Promise<Array>} - Array of {risk_level, session_count, percentage}
 */
export async function getRiskDistribution() {
  try {
    const { data, error } = await supabase
      .from('risk_distribution')
      .select('*');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[Analytics] Error fetching risk distribution:', error);
    return [];
  }
}

/**
 * Create or update user record
 * Menghandle user identification (baik anonymous atau logged in)
 * @param {object} userData - User data dari intake form
 * @returns {Promise<object>} - { userId, isNewUser }
 */
export async function createOrUpdateUser(userData) {
  try {
    // Check if user exists (by auth_id)
    let userId;
    let isNewUser = false;

    const { data: { session } } = await supabase.auth.getSession();
    const authId = session?.user?.id || null;
    const userEmail = session?.user?.email || userData.email || null;

    // Calculate age
    const ageAtSignup = userData.dob
      ? new Date().getFullYear() - new Date(userData.dob).getFullYear()
      : null;

    if (authId) {
      // User logged in - check by user_id in user_profiles
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id, user_id')
        .eq('user_id', authId)
        .single();

      if (existingProfile) {
        userId = existingProfile.user_id;
        // Update timestamp
        await supabase
          .from('user_profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      } else {
        // Create new profile
        const { data: newProfile, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authId,
            email: userEmail,
            name: userData.name || 'Anonymous',
            gender: userData.gender,
            dob: userData.dob,
            age: ageAtSignup,
            education_status: userData.education_status,
            institution_type: userData.institution_type,
            occupation: userData.occupation,
            location: userData.location,
            location_custom: userData.location_custom
          })
          .select('user_id')
          .single();

        if (!error && newProfile) {
          userId = newProfile.user_id;
          isNewUser = true;
        }
      }
    } else {
      // Anonymous user - just return null (no profile created)
      // Anonymous users don't get profiles
      return { userId: null, isNewUser: false };
    }

    return { userId, isNewUser };
  } catch (error) {
    console.error('[Analytics] Error creating/updating user:', error);
    // Return null jika error (fallback ke old behavior)
    return { userId: null, isNewUser: false };
  }
}

/**
 * Create counseling session dengan user_id
 * @param {object} sessionData - Session data
 * @returns {Promise<object>} - Created session
 */
export async function createSession(sessionData) {
  try {
    const { data, error } = await supabase
      .from('counseling_sessions')
      .insert({
        user_id: sessionData.userId,
        category: sessionData.category,
        subtopic: sessionData.subtopic,
        subtopic_custom: sessionData.subtopic_custom || false,
        persona_id: sessionData.persona_id,
        risk_level: sessionData.risk_level,
        risk_priority: sessionData.risk_priority || 1,
        chat_history: sessionData.chat_history || [],
        message_count: sessionData.message_count || 0,
        user_message_count: sessionData.user_message_count || 0,
        summary: sessionData.summary || null,
        detected_keywords: sessionData.detected_keywords || null,
        started_at: sessionData.started_at || new Date().toISOString(),
        status: sessionData.status || 'In Progress',
        metadata: sessionData.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('[Analytics] Error creating session:', error);
    return null;
  }
}

/**
 * Update session saat selesai
 * @param {number} sessionId - Session ID
 * @param {object} updates - Fields to update
 * @returns {Promise<boolean>} - Success status
 */
export async function updateSession(sessionId, updates) {
  try {
    const { error } = await supabase
      .from('counseling_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('[Analytics] Error updating session:', error);
    return false;
  }
}

/**
 * Save assessment result
 * @param {object} assessmentData - Assessment data
 * @returns {Promise<object>} - Created assessment
 */
export async function saveAssessmentResult(assessmentData) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    const { data, error } = await supabase
      .from('assessment_results')
      .insert({
        user_id: userId,
        assessment_type: assessmentData.type,
        assessment_name: assessmentData.name,
        score: assessmentData.score,
        max_score: assessmentData.maxScore,
        severity: assessmentData.severity,
        result_data: assessmentData.resultData
      })
      .select()
      .single();

    if (error) throw error;

    // Update assessment counter
    await supabase.rpc('increment_metric', {
      metric_name: 'total_assessments_taken'
    });

    return data;
  } catch (error) {
    console.error('[Analytics] Error saving assessment:', error);
    return null;
  }
}

/**
 * Get user history (untuk dashboard)
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - User sessions
 */
export async function getUserHistory(userId) {
  try {
    const { data, error } = await supabase
      .from('user_session_history')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[Analytics] Error fetching user history:', error);
    return [];
  }
}

/**
 * Format social proof numbers untuk display
 * Contoh: 1234 -> "1.2K", 1500 -> "1.5K"
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export function formatSocialProofNumber(num) {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  return (num / 1000000).toFixed(1) + 'M';
}

/**
 * Get real-time social proof widget data
 * Untuk ditampilkan di landing page
 * @returns {Promise<string>} - HTML string atau formatted text
 */
export async function getSocialProofWidget() {
  try {
    const stats = await getSocialProof();

    // Generate random variation untuk social proof
    const variations = [
      `${formatSocialProofNumber(stats.totalUsers)} orang sudah curhat`,
      `${formatSocialProofNumber(stats.totalSessions)} sesi curhat telah dilakukan`,
      `${formatSocialProofNumber(stats.activeUsers7d)} orang aktif minggu ini`,
      `Topik ${stats.mostPopularCategory} paling populer`
    ];

    const randomIndex = Math.floor(Math.random() * variations.length);

    return {
      text: variations[randomIndex],
      stats: stats
    };
  } catch (error) {
    console.error('[Analytics] Error generating social proof widget:', error);
    return {
      text: 'Bergabung dengan ribuan orang lain',
      stats: null
    };
  }
}

/**
 * Track page view (untuk analytics - optional)
 * @param {string} page - Page name
 * @param {object} metadata - Additional metadata
 */
export async function trackPageView(page, metadata = {}) {
  try {
    // Di production, ini bisa disimpan ke tabel page_views
    // Untuk sekarang, kita log ke console
    console.log(`[Analytics] Page view: ${page}`, metadata);
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error);
  }
}

/**
 * Increment metric counter
 * @param {string} metricName - Metric name to increment
 */
export async function incrementMetric(metricName) {
  try {
    await supabase.rpc('increment_metric', {
      metric_name: metricName
    });
  } catch (error) {
    console.error('[Analytics] Error incrementing metric:', error);
  }
}

export default {
  getSocialProof,
  getCategoryPopularity,
  getRiskDistribution,
  createOrUpdateUser,
  createSession,
  updateSession,
  saveAssessmentResult,
  getUserHistory,
  formatSocialProofNumber,
  getSocialProofWidget,
  trackPageView,
  incrementMetric
};
