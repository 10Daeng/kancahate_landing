// --- ASSESSMENT ANALYTICS SERVICE ---
// Menyimpan data tes anonim (tanpa login) untuk analytics & marketing

import { supabase } from '../lib/supabaseClient';

/**
 * Hash IP address untuk privacy (tidak menyimpan raw IP)
 * @param {string} ip - IP address
 * @returns {string} Hashed IP
 */
async function hashIP(ip) {
  // Simple hash using Web Crypto API (client-side)
  // For server-side, we'll use a simple string hash
  let hash = 0;
  const str = ip + 'kancahate_salt_2024';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'hash_' + Math.abs(hash).toString(36);
}

/**
 * Get device type from user agent
 * @param {string} userAgent - Browser user agent
 * @returns {string} Device type
 */
function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  if (/tablet|ipad|kindle|silk/i.test(ua)) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Get client IP address from request headers
 * @param {Request} request - Next.js request object
 * @returns {string} IP address
 */
function getClientIP(request) {
  // Try various headers for IP
  const headers = request.headers || {};

  return (
    headers['x-forwarded-for']?.split(',')[0] ||
    headers['x-real-ip'] ||
    headers['cf-connecting-ip'] ||
    headers['x-vercel-forwarded-for'] ||
    'unknown'
  );
}

/**
 * Save assessment analytics (anonymous - no login required)
 * @param {Object} data - Assessment data
 * @param {Request} request - Next.js request for IP extraction
 * @returns {Promise<Object>} Result
 */
export async function saveAssessmentAnalytics(data, request) {
  try {
    const ip = getClientIP(request);
    const hashedIP = await hashIP(ip);
    const userAgent = request.headers.get('user-agent') || '';
    const deviceType = getDeviceType(userAgent);

    const analyticsData = {
      test_type: data.testType,
      result_summary: data.resultSummary || {},
      raw_result: data.rawResult || {},
      ip_hash: hashedIP,
      device_type: deviceType,
      user_agent: userAgent.substring(0, 500), // Truncate if too long
      test_date: new Date().toISOString(),
      referrer: data.referrer || null,
      utm_source: data.utmSource || null,
      utm_medium: data.utmMedium || null,
      utm_campaign: data.utmCampaign || null
    };

    // Save to assessment_analytics table
    const { data: result, error } = await supabase
      .from('assessment_analytics')
      .insert([analyticsData])
      .select()
      .single();

    if (error) {
      // Table might not exist yet - log but don't fail the request
      console.warn('Assessment analytics table note:', error.message);
      // Return success anyway - email is more important than analytics
      return {
        success: true,
        data: analyticsData,
        analyticsSkipped: true
      };
    }

    return {
      success: true,
      data: result || analyticsData
    };
  } catch (error) {
    console.error('Error saving analytics:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get assessment analytics (for admin only)
 * @returns {Promise<Array>} Analytics data
 */
export async function getAssessmentAnalytics() {
  try {
    // Check if user is admin (this should be protected by middleware)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin (you might need an admin table)
    // For now, just return empty if not admin
    const isAdmin = user.email?.includes('admin@') || user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      return [];
    }

    const { data, error } = await supabase
      .from('assessment_analytics')
      .select('*')
      .order('test_date', { ascending: false })
      .limit(1000);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return [];
  }
}

export default {
  saveAssessmentAnalytics,
  getAssessmentAnalytics
};
