// =============================================
-- NEON TECH DATABASE CLIENT
-- Pengganti Supabase Client untuk koneksi langsung ke PostgreSQL
-- =============================================

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { uuid } from 'drizzle-orm';

// Schema definition
export * from './schema';

// Neon database connection
if (!process.env.NEXT_PUBLIC_NEON_DATABASE_URL) {
  throw new Error('NEXT_PUBLIC_NEON_DATABASE_URL is not set');
}

const sql = neon(process.env.NEXT_PUBLIC_NEON_DATABASE_URL, {
  fetch: (url, options) => {
    // Add timeout dan retry logic
    return fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
  }
});

export { sql };

// Drizzle ORM client (optional - bisa digunakan untuk query yang lebih kompleks)
export const db = drizzle(sql, { schema });

// =============================================
-- AUTH HELPER FUNCTIONS (Pengganti Supabase Auth)
-- =============================================

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key-change-this';

/**
 * Hash password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  const result = await sql`
    SELECT
      u.id,
      u.email,
      u.password_hash,
      u.name,
      u.role,
      u.is_active,
      u.email_verified,
      up.gender,
      up.age,
      up.location,
      up.avatar_url
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.email = ${email}
    AND u.is_active = true
    LIMIT 1
  `;

  if (!result || result.length === 0) {
    return { success: false, error: 'Email atau password salah' };
  }

  const user = result[0];

  // Verify password
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return { success: false, error: 'Email atau password salah' };
  }

  // Generate token
  const token = generateToken(user);

  // Remove password hash from response
  delete user.password_hash;

  return {
    success: true,
    token,
    user
  };
}

/**
 * Register user
 */
export async function registerUser(email, password, name) {
  // Check if email exists
  const existing = await sql`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `;

  if (existing && existing.length > 0) {
    return { success: false, error: 'Email sudah terdaftar' };
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const result = await sql`
    INSERT INTO users (email, password_hash, name, role, is_active, email_verified)
    VALUES (${email}, ${passwordHash}, ${name}, 'user', true, false)
    RETURNING id, email, name, role, is_active, email_verified, created_at
  `;

  if (!result || result.length === 0) {
    return { success: false, error: 'Gagal mendaftar' };
  }

  const user = result[0];

  // Generate token
  const token = generateToken(user);

  return {
    success: true,
    token,
    user
  };
}

/**
 * Get user by token
 */
export async function getUserByToken(token) {
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

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
        SELECT id, test_date, test_type, result, scores, completed_at, created_at
        FROM ${table}
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
    INSERT INTO ${table} (user_id, result, scores, completed_at)
    VALUES (${userId}, ${result}, ${scores}, NOW())
    RETURNING id, completed_at
  `;

  return result2[0];
}

/**
 * Get chat sessions for a user
 */
export async function getUserChatSessions(userId) {
  const result = await sql`
    SELECT id, category, risk_level, summary, status, chat_history, created_at
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
export async function saveChatSession(userId, category, riskLevel, summary, chatHistory) {
  const result = await sql`
    INSERT INTO counseling_sessions (user_id, category, risk_level, summary, chat_history)
    VALUES (${userId}, ${category}, ${riskLevel}, ${summary}, ${chatHistory})
    RETURNING id, created_at
  `;

  return result[0];
}

// Default export for compatibility
export default {
  sql,
  db,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  loginUser,
  registerUser,
  getUserByToken,
  isAdminUser,
  getUserAssessments,
  saveAssessmentResult,
  getUserChatSessions,
  saveChatSession
};
