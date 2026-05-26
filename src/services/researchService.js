'use server';

import { db, sql } from '@/db';
import { users, userProfiles, assessmentResults, counselingSessions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getResearchStats() {
  try {
    // 1. Total Responden
    const respondentsResult = await db.execute(sql`SELECT count(*) as count FROM users`);
    const totalRespondents = Number(respondentsResult.rows?.[0]?.count || 0);

    // 2. Asesmen Selesai
    const assessmentsResult = await db.execute(sql`SELECT count(*) as count FROM assessment_results`);
    const totalAssessments = Number(assessmentsResult.rows?.[0]?.count || 0);

    // 3. Demographics (Age groups)
    // We calculate age directly from the database using the dob or age column.
    const ageResult = await db.execute(sql`
      SELECT 
        CASE 
          WHEN age < 12 THEN '<12 Tahun'
          WHEN age BETWEEN 12 AND 15 THEN '12-15 Tahun (SMP)'
          WHEN age BETWEEN 16 AND 18 THEN '16-18 Tahun (SMA)'
          WHEN age BETWEEN 19 AND 22 THEN '19-22 Tahun (Kuliah)'
          WHEN age > 22 THEN '>22 Tahun'
          ELSE 'Belum Mengisi'
        END as age_group,
        COUNT(*) as count
      FROM user_profiles
      WHERE age IS NOT NULL
      GROUP BY age_group
    `);
    
    // Map age data to PieChart format
    const ageMapping = {
      '<12 Tahun': 0,
      '12-15 Tahun (SMP)': 0,
      '16-18 Tahun (SMA)': 0,
      '19-22 Tahun (Kuliah)': 0,
      '>22 Tahun': 0,
    };
    
    ageResult.rows?.forEach(r => {
      if (ageMapping[r.age_group] !== undefined) {
        ageMapping[r.age_group] = Number(r.count);
      }
    });

    const demographicData = Object.keys(ageMapping).map(key => ({
      name: key,
      value: ageMapping[key]
    }));

    // 4. Assessment Completion Breakdown
    const breakdownResult = await db.execute(sql`
      SELECT assessment_type, COUNT(*) as count 
      FROM assessment_results 
      GROUP BY assessment_type
    `);
    
    const assessmentCompletion = breakdownResult.rows?.map(r => ({
      name: r.assessment_type.toUpperCase(),
      completed: Number(r.count),
      pending: 0 // Optional: calculate total users - completed
    })) || [];

    // 5. RIASEC Radar Aggregates
    const riasecResult = await db.execute(sql`
      SELECT result_data
      FROM assessment_results
      WHERE assessment_type = 'riasec'
    `);
    
    const riasecScores = { Realistic: 0, Investigative: 0, Artistic: 0, Social: 0, Enterprising: 0, Conventional: 0 };
    let riasecCount = 0;
    
    riasecResult.rows?.forEach(r => {
      const data = typeof r.result_data === 'string' ? JSON.parse(r.result_data) : r.result_data;
      if (data && data.scores) {
        riasecCount++;
        riasecScores.Realistic += data.scores.R || 0;
        riasecScores.Investigative += data.scores.I || 0;
        riasecScores.Artistic += data.scores.A || 0;
        riasecScores.Social += data.scores.S || 0;
        riasecScores.Enterprising += data.scores.E || 0;
        riasecScores.Conventional += data.scores.C || 0;
      }
    });

    const riasecRadarData = Object.keys(riasecScores).map(subject => ({
      subject,
      A: riasecCount > 0 ? Math.round(riasecScores[subject] / riasecCount) : 0,
      fullMark: 100 // Normalized to percentage or actual max score
    }));

    // 6. Curhatan (Counseling Sessions) summary
    const curhatanResult = await db.execute(sql`
      SELECT category, count(*) as count 
      FROM counseling_sessions 
      GROUP BY category
    `);

    const curhatanSummary = curhatanResult.rows?.map(r => ({
      name: r.category || 'Lainnya',
      value: Number(r.count)
    })) || [];

    return {
      success: true,
      data: {
        totalRespondents,
        totalAssessments,
        demographicData,
        assessmentCompletion,
        riasecRadarData,
        curhatanSummary
      }
    };
  } catch (error) {
    console.error('Research stats error:', error);
    return { success: false, error: error.message };
  }
}

// Function to fetch raw data for CSV export
export async function getRawResearchData() {
  try {
    const rawData = await db.execute(sql`
      SELECT 
        u.id, u.email, u.created_at as registered_at,
        p.age, p.gender, p.education_status,
        a.assessment_type, a.score as assessment_score, a.created_at as assessment_date,
        a.result_data
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN assessment_results a ON u.id = a.user_id
      ORDER BY u.created_at DESC
    `);
    
    return { success: true, data: rawData.rows };
  } catch (error) {
    console.error('Raw data export error:', error);
    return { success: false, error: error.message };
  }
}

export async function getCurhatanData() {
  try {
    const sessions = await db.query.counselingSessions.findMany({
      orderBy: [desc(counselingSessions.createdAt)],
      limit: 100
    });
    return { success: true, data: sessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
