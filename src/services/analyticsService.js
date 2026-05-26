'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getSocialProof() {
  try {
    // Basic implementation since we don't have the exact RPC logic
    const totalUsers = await db.select({ count: sql`count(*)` }).from(schema.users);
    const totalSessions = await db.select({ count: sql`count(*)` }).from(schema.counselingSessions);
    const totalAssessments = await db.select({ count: sql`count(*)` }).from(schema.assessmentResults);

    return {
      totalUsers: Number(totalUsers[0].count) || 0,
      totalSessions: Number(totalSessions[0].count) || 0,
      activeUsers7d: 0, // Placeholder
      activeUsers30d: 0, // Placeholder
      totalAssessments: Number(totalAssessments[0].count) || 0,
      mostPopularCategory: 'Psikologi', // Placeholder
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Analytics] Error fetching social proof:', error);
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

export async function getCategoryPopularity(limit = 5) {
  try {
    const data = await db.select({
      category: schema.counselingSessions.category,
      session_count: sql`count(*)`,
    })
    .from(schema.counselingSessions)
    .groupBy(schema.counselingSessions.category)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

    return data || [];
  } catch (error) {
    console.error('[Analytics] Error fetching category popularity:', error);
    return [];
  }
}

export async function getRiskDistribution() {
  try {
    const data = await db.select({
      risk_level: schema.counselingSessions.riskLevel,
      session_count: sql`count(*)`,
    })
    .from(schema.counselingSessions)
    .groupBy(schema.counselingSessions.riskLevel);

    return data || [];
  } catch (error) {
    console.error('[Analytics] Error fetching risk distribution:', error);
    return [];
  }
}

export async function createOrUpdateUser(userData) {
  try {
    let userId = null;
    let isNewUser = false;

    const session = await getServerSession(authOptions);
    const authId = session?.user?.id || null;
    const userEmail = session?.user?.email || userData.email || null;

    const ageAtSignup = userData.dob
      ? new Date().getFullYear() - new Date(userData.dob).getFullYear()
      : null;

    if (authId) {
      const existingProfile = await db.query.userProfiles.findFirst({
        where: eq(schema.userProfiles.userId, authId)
      });

      if (existingProfile) {
        userId = existingProfile.userId;
        await db.update(schema.userProfiles)
          .set({ updatedAt: new Date() })
          .where(eq(schema.userProfiles.userId, userId));
      } else {
        const newProfile = await db.insert(schema.userProfiles)
          .values({
            userId: authId,
            email: userEmail,
            name: userData.name || 'Anonymous',
            gender: userData.gender,
            dob: userData.dob ? new Date(userData.dob) : null,
            age: ageAtSignup,
            educationStatus: userData.education_status,
            institutionType: userData.institution_type,
            occupation: userData.occupation,
            location: userData.location,
            locationCustom: userData.location_custom
          })
          .returning({ userId: schema.userProfiles.userId });

        if (newProfile && newProfile.length > 0) {
          userId = newProfile[0].userId;
          isNewUser = true;
        }
      }
    } else {
      return { userId: null, isNewUser: false };
    }

    return { userId, isNewUser };
  } catch (error) {
    console.error('[Analytics] Error creating/updating user:', error);
    return { userId: null, isNewUser: false };
  }
}

export async function createSession(sessionData) {
  try {
    const newSession = await db.insert(schema.counselingSessions)
      .values({
        userId: sessionData.userId,
        anonUserId: sessionData.anonUserId,
        category: sessionData.category,
        subtopic: sessionData.subtopic,
        subtopicCustom: sessionData.subtopic_custom || false,
        personaId: sessionData.persona_id,
        riskLevel: sessionData.risk_level,
        riskPriority: sessionData.risk_priority || 1,
        chatHistory: sessionData.chat_history || [],
        messageCount: sessionData.message_count || 0,
        userMessageCount: sessionData.user_message_count || 0,
        summary: sessionData.summary || null,
        detectedKeywords: sessionData.detected_keywords || null,
        startedAt: sessionData.started_at ? new Date(sessionData.started_at) : new Date(),
        status: sessionData.status || 'In Progress',
        metadata: sessionData.metadata || {}
      })
      .returning();

    return newSession[0];
  } catch (error) {
    console.error('[Analytics] Error creating session:', error);
    return null;
  }
}

export async function updateSession(sessionId, updates) {
  try {
    // Map snake_case to camelCase
    const mappedUpdates = {};
    if (updates.status) mappedUpdates.status = updates.status;
    if (updates.summary) mappedUpdates.summary = updates.summary;
    if (updates.chat_history) mappedUpdates.chatHistory = updates.chat_history;
    if (updates.message_count !== undefined) mappedUpdates.messageCount = updates.message_count;
    if (updates.user_message_count !== undefined) mappedUpdates.userMessageCount = updates.user_message_count;
    if (updates.detected_keywords) mappedUpdates.detectedKeywords = updates.detected_keywords;
    mappedUpdates.updatedAt = new Date();

    const result = await db.update(schema.counselingSessions)
      .set(mappedUpdates)
      .where(eq(schema.counselingSessions.id, sessionId))
      .returning();

    return result[0];
  } catch (error) {
    console.error('[Analytics] Error updating session:', error);
    return null;
  }
}

export async function saveAssessmentResult(userId, testData) {
  try {
    const newAssessment = await db.insert(schema.assessmentResults)
      .values({
        userId: userId,
        assessmentType: testData.assessment_type,
        assessmentName: testData.assessment_name,
        score: testData.score,
        maxScore: testData.max_score,
        severity: testData.severity,
        resultData: testData.result_data || {}
      })
      .returning();

    return newAssessment[0];
  } catch (error) {
    console.error('[Analytics] Error saving assessment:', error);
    return null;
  }
}

export async function getChatDraft(sessionId) {
  try {
    const draft = await db.query.counselingSessionsDrafts.findFirst({
      where: eq(schema.counselingSessionsDrafts.sessionId, sessionId)
    });
    return { success: true, data: draft?.sessionData || null };
  } catch (error) {
    console.error('Error fetching chat draft:', error);
    return { success: false, error: error.message };
  }
}

export async function saveChatDraft(sessionId, sessionData) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    
    // UPSERT logic: check if exists
    const existing = await db.query.counselingSessionsDrafts.findFirst({
      where: eq(schema.counselingSessionsDrafts.sessionId, sessionId)
    });

    if (existing) {
      await db.update(schema.counselingSessionsDrafts)
        .set({ sessionData, lastSavedAt: new Date() })
        .where(eq(schema.counselingSessionsDrafts.sessionId, sessionId));
    } else {
      await db.insert(schema.counselingSessionsDrafts)
        .values({
          sessionId,
          userId,
          anonUserId: sessionData.anonUserId,
          sessionData,
          lastSavedAt: new Date()
        });
    }
    return { success: true };
  } catch (error) {
    console.error('Error saving chat draft:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteChatDraft(sessionId) {
  try {
    await db.delete(schema.counselingSessionsDrafts)
      .where(eq(schema.counselingSessionsDrafts.sessionId, sessionId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting chat draft:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserProfile() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, data: null };
    
    const profile = await db.query.userProfiles.findFirst({
      where: eq(schema.userProfiles.userId, session.user.id)
    });
    
    return { success: true, data: profile };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, error: error.message };
  }
}
