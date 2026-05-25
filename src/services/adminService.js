'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function getAllSessions() {
  try {
    const sessions = await db.select().from(schema.counselingSessions).orderBy(desc(schema.counselingSessions.createdAt));
    
    // Map camelCase to snake_case to avoid breaking AdminDashboard
    const mappedSessions = sessions.map(s => ({
      ...s,
      user_id: s.userId,
      user_email: s.userEmail,
      user_name: s.userName,
      risk_level: s.riskLevel,
      risk_priority: s.riskPriority,
      chat_history: s.chatHistory,
      message_count: s.messageCount,
      user_message_count: s.userMessageCount,
      detected_keywords: s.detectedKeywords,
      started_at: s.startedAt,
      created_at: s.createdAt,
      updated_at: s.updatedAt,
      subtopic_custom: s.subtopicCustom,
      persona_id: s.personaId
    }));

    return { success: true, data: mappedSessions };
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllUsers() {
  try {
    const profiles = await db.select().from(schema.userProfiles).orderBy(desc(schema.userProfiles.createdAt));
    
    // Map camelCase to snake_case
    const mappedProfiles = profiles.map(p => ({
      ...p,
      user_id: p.userId,
      education_status: p.educationStatus,
      institution_type: p.institutionType,
      location_custom: p.locationCustom,
      avatar_url: p.avatarUrl,
      created_at: p.createdAt,
      updated_at: p.updatedAt
    }));

    return { success: true, data: mappedProfiles };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllAssessments() {
  try {
    const assessments = await db.select().from(schema.assessmentResults).orderBy(desc(schema.assessmentResults.createdAt));
    
    // Map camelCase to snake_case
    const mappedAssessments = assessments.map(a => ({
      ...a,
      user_id: a.userId,
      assessment_type: a.assessmentType,
      assessment_name: a.assessmentName,
      max_score: a.maxScore,
      result_data: a.resultData,
      created_at: a.createdAt
    }));

    return { success: true, data: mappedAssessments };
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return { success: false, error: error.message };
  }
}
