// =============================================
// NEON TECH DATABASE CLIENT (Server-side only!)
// Pengganti Supabase Client untuk koneksi langsung ke PostgreSQL
// =============================================

import { neon } from '@neondatabase/serverless';

// Database connection string (server-side only!)
const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL;

// Neon serverless driver - lazy initialization to be safe on client-side
let _sql = null;
export const sql = (...args) => {
  if (!_sql) {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set. Database operations are only available on the server-side.');
    }
    _sql = neon(databaseUrl, {
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          signal: AbortSignal.timeout(30000),
        });
      }
    });
  }
  return _sql(...args);
};

// =============================================
// UTILITY FUNCTIONS untuk mengganti Supabase Auth
// =============================================

/**
 * Get auth token from cookie
 */
export function getAuthToken(cookies) {
  return cookies?.get('auth_token')?.value || null;
}

/**
 * Get user from token (server-side only)
 */
export async function getUserByToken(token) {
  if (!token) return null;

  const jwt = await import('jsonwebtoken');

  try {
    const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'change-this-in-production-min-32-chars';
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await sql`
      SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u.is_active,
        u.email_verified,
        up.gender,
        up.age,
        up.location,
        up.bio,
        up.avatar_url,
        u.created_at
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ${decoded.id}
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Check if user is admin
 */
export async function isAdminUser(userId) {
  const result = await sql`
    SELECT role, is_active FROM admin_users
    WHERE user_id = ${userId}
    AND is_active = true
    LIMIT 1
  `;

  if (!result || result.length === 0) {
    return false;
  }

  return true;
}

/**
 * Get all assessment results for a user
 */
export async function getUserAssessments(userId) {
  // Get all test results from different tables
  const tables = [
    'riasec_results',
    'mbti_results',
    'bigfive_results',
    'vark_results',
    'love_language_results',
    'mi_results',
    'rimb_results',
    'pss10_results',
    'gad7_results',
    'phq9_results',
    'rosenberg_results'
  ];

  const allResults = [];

  for (const table of tables) {
    try {
      const result = await sql`
        SELECT id, email, scores, result, completed_at, created_at,
          '${table.replace('_results', '')}' as test_type
        FROM ${sql.unsafe(table)}
        WHERE user_id = ${userId}
        ORDER BY completed_at DESC
      `;

      if (result) {
        allResults.push(...result);
      }
    } catch (e) {
      // Table might not exist, ignore
      console.error(`Error fetching from ${table}:`, e);
    }
  }

  return allResults.sort((a, b) =>
    new Date(b.completed_at) - new Date(a.completed_at)
  );
}

/**
 * Save assessment result
 */
export async function saveAssessmentResult(userId, testType, result, scores) {
  const tableMap = {
    'RIASEC': 'riasec_results',
    'MBTI': 'mbti_results',
    'BigFive': 'bigfive_results',
    'VARK': 'vark_results',
    'LoveLanguages': 'love_language_results',
    'MI': 'mi_results',
    'RIMB': 'rimb_results',
    'PSS10': 'pss10_results',
    'GAD7': 'gad7_results',
    'PHQ9': 'phq9_results',
    'ROSENBERG': 'rosenberg_results'
  };

  const table = tableMap[testType];
  if (!table) {
    throw new Error(`Unknown test type: ${testType}`);
  }

  const result2 = await sql`
    INSERT INTO ${table} (user_id, email, scores, result, completed_at)
    VALUES (${userId}, ${result.email || null}, ${JSON.stringify(scores)}, ${JSON.stringify(result)}, NOW())
    RETURNING id, completed_at
  `;

  return result2[0];
}

/**
 * Get chat sessions for a user
 */
export async function getUserChatSessions(userId) {
  const result = await sql`
    SELECT id, email, category, risk_level, summary, status, chat_history, created_at
    FROM counseling_sessions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 10
  `;

  return result || [];
}

/**
 * Save chat session
 */
export async function saveChatSession(userId, email, category, riskLevel, summary, chatHistory) {
  const result = await sql`
    INSERT INTO counseling_sessions (user_id, email, category, risk_level, summary, chat_history)
    VALUES (${userId}, ${email}, ${category}, ${riskLevel}, ${summary}, ${JSON.stringify(chatHistory)})
    RETURNING id, created_at
  `;

  return result[0];
}

export async function saveIncidentReport(data) {
  const {
    reporterId, reporterName, reporterStatus, reporterPhone, reporterEmail,
    isAnonymous, perpetrators, perpName, perpClass, perpDescription,
    victims, victimName, victimClass, victimRelation,
    incidentType, bullyingTypes, location, incidentDate, incidentTime,
    chronology, witnesses, evidence, initialActions, reportedToCounselor,
    valuesViolated, severity,
  } = data;

  const result = await sql`
    INSERT INTO incident_reports (
      reporter_id, reporter_name, reporter_status, reporter_phone, reporter_email,
      is_anonymous, perpetrators, perp_name, perp_class, perp_description,
      victims, victim_name, victim_class, victim_relation,
      incident_type, bullying_types, location, incident_date, incident_time,
      chronology, witnesses, evidence, initial_actions, reported_to_counselor,
      values_violated, severity
    ) VALUES (
      ${reporterId}, ${reporterName || null}, ${reporterStatus || null}, ${reporterPhone || null}, ${reporterEmail || null},
      ${isAnonymous || false}, ${JSON.stringify(perpetrators || [])}, ${perpName || null}, ${perpClass || null}, ${perpDescription || null},
      ${JSON.stringify(victims || [])}, ${victimName || null}, ${victimClass || null}, ${victimRelation || null},
      ${incidentType}, ${JSON.stringify(bullyingTypes || [])}, ${location || null}, ${incidentDate || null}, ${incidentTime || null},
      ${chronology || null}, ${JSON.stringify(witnesses || [])}, ${JSON.stringify(evidence || [])}, ${initialActions || null}, ${reportedToCounselor || false},
      ${JSON.stringify(valuesViolated || [])}, ${severity || 'sedang'}
    )
    RETURNING id, created_at
  `;

  return result[0];
}

export async function getIncidentReports({ status, limit = 50, offset = 0 } = {}) {
  let query;
  if (status) {
    query = sql`
      SELECT ir.*, u.name as reporter_name, u.email as reporter_email
      FROM incident_reports ir
      LEFT JOIN users u ON ir.reporter_id = u.id
      WHERE ir.status = ${status}
      ORDER BY ir.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    query = sql`
      SELECT ir.*, u.name as reporter_name, u.email as reporter_email
      FROM incident_reports ir
      LEFT JOIN users u ON ir.reporter_id = u.id
      ORDER BY ir.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  return query;
}

export async function updateIncidentReportStatus(reportId, status, adminNotes) {
  const result = await sql`
    UPDATE incident_reports
    SET status = ${status}, admin_notes = ${adminNotes || null}, updated_at = NOW()
    WHERE id = ${reportId}
    RETURNING id, status, updated_at
  `;

  return result[0];
}

// Default export
export default {
  sql,
  getAuthToken,
  getUserByToken,
  isAdminUser,
  getUserAssessments,
  saveAssessmentResult,
  getUserChatSessions,
  saveChatSession,
  saveIncidentReport,
  getIncidentReports,
  updateIncidentReportStatus
};
