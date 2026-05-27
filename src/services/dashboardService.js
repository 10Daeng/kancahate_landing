'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { sql, desc, gte, lt, eq } from 'drizzle-orm';

export async function getDashboardStats() {
  try {
    const userStats = await fetchUserStats();
    const articleStats = await fetchArticleStats();
    const testStats = await fetchTestStats();
    const dailyActivity = await fetchDailyActivity();
    const topContent = await fetchTopContent(testStats);

    return {
      success: true,
      data: {
        ...userStats,
        ...articleStats,
        ...testStats,
        ...dailyActivity,
        ...topContent,
      }
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return { success: false, error: error.message };
  }
}

async function fetchUserStats() {
  try {
    const allUsers = await db.select({
      id: schema.users.id,
      status: schema.users.isActive,
      createdAt: schema.users.createdAt,
    }).from(schema.users);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.status === true).length,
      bannedUsers: allUsers.filter(u => u.status === false).length,
      newUsersToday: allUsers.filter(u => new Date(u.createdAt) >= todayStart).length,
      newUsersThisMonth: allUsers.filter(u => new Date(u.createdAt) >= monthStart).length,
    };
  } catch (error) {
    console.error('Error in fetchUserStats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      bannedUsers: 0,
      newUsersToday: 0,
      newUsersThisMonth: 0,
    };
  }
}

async function fetchArticleStats() {
  try {
    const articles = await db.select({
      id: schema.articles.id,
      status: schema.articles.status,
      viewCount: schema.articles.viewCount,
    }).from(schema.articles);

    return {
      totalArticles: articles.length,
      publishedArticles: articles.filter(a => a.status === 'published').length,
      draftArticles: articles.filter(a => a.status === 'draft').length,
      totalArticleViews: articles.reduce((sum, a) => sum + (a.viewCount || 0), 0),
    };
  } catch (error) {
    console.error('Error in fetchArticleStats:', error);
    return {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      totalArticleViews: 0,
    };
  }
}

async function fetchTestStats() {
  try {
    const results = await db.select({
      id: schema.assessmentResults.id,
      userId: schema.assessmentResults.userId,
      assessmentType: schema.assessmentResults.assessmentType,
      createdAt: schema.assessmentResults.createdAt,
    }).from(schema.assessmentResults);

    const testCounts = {
      riasecTests: 0,
      mbtiTests: 0,
      bigFiveTests: 0,
      varkTests: 0,
      loveLanguageTests: 0,
      miTests: 0,
      rimbTests: 0,
    };

    let totalTests = results.length;
    const uniqueUsers = new Set();
    let testsThisMonth = 0;
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    results.forEach(r => {
      if (r.userId) uniqueUsers.add(r.userId);
      if (new Date(r.createdAt) >= monthStart) testsThisMonth++;
      
      const type = r.assessmentType?.toLowerCase() || '';
      if (type.includes('riasec')) testCounts.riasecTests++;
      else if (type.includes('mbti')) testCounts.mbtiTests++;
      else if (type.includes('bigfive')) testCounts.bigFiveTests++;
      else if (type.includes('vark')) testCounts.varkTests++;
      else if (type.includes('love')) testCounts.loveLanguageTests++;
      else if (type.includes('mi')) testCounts.miTests++;
      else if (type.includes('rimb')) testCounts.rimbTests++;
    });

    return {
      ...testCounts,
      totalTestsTaken: totalTests,
      uniqueTestTakers: uniqueUsers.size,
      avgTestsPerUser: uniqueUsers.size > 0 ? (totalTests / uniqueUsers.size).toFixed(1) : 0,
      testsThisMonth,
    };
  } catch (error) {
    console.error('Error in fetchTestStats:', error);
    return {
      totalTestsTaken: 0,
      uniqueTestTakers: 0,
      avgTestsPerUser: 0,
      testsThisMonth: 0,
      riasecTests: 0,
      mbtiTests: 0,
      bigFiveTests: 0,
      varkTests: 0,
      loveLanguageTests: 0,
      miTests: 0,
      rimbTests: 0,
    };
  }
}

async function fetchDailyActivity() {
  try {
    const days = [];
    const dailyViews = [];
    const dailyTests = [];
    const dailyUsers = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      days.push(date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));

      // Placeholder for views
      dailyViews.push(Math.floor(Math.random() * 100) + 20);

      const testsDay = await db.select({ id: schema.assessmentResults.id })
        .from(schema.assessmentResults)
        .where(
          sql`${schema.assessmentResults.createdAt} >= ${dayStart.toISOString()} AND ${schema.assessmentResults.createdAt} < ${dayEnd.toISOString()}`
        );
      dailyTests.push(testsDay.length);

      const usersDay = await db.select({ id: schema.users.id })
        .from(schema.users)
        .where(
          sql`${schema.users.createdAt} >= ${dayStart.toISOString()} AND ${schema.users.createdAt} < ${dayEnd.toISOString()}`
        );
      dailyUsers.push(usersDay.length);
    }

    return {
      dailyViews,
      dailyTests,
      dailyUsers,
      activityDays: days,
    };
  } catch (error) {
    console.error('Error in fetchDailyActivity:', error);
    return {
      dailyViews: [0, 0, 0, 0, 0, 0, 0],
      dailyTests: [0, 0, 0, 0, 0, 0, 0],
      dailyUsers: [0, 0, 0, 0, 0, 0, 0],
      activityDays: [],
    };
  }
}

async function fetchTopContent(testStats) {
  try {
    const topArticles = await db.select({
      id: schema.articles.id,
      title: schema.articles.title,
      viewCount: schema.articles.viewCount,
      slug: schema.articles.slug,
    })
    .from(schema.articles)
    .orderBy(desc(schema.articles.viewCount))
    .limit(5);

    const testStatsArray = [
      { name: 'RIASEC', icon: '🎯', count: testStats.riasecTests || 0 },
      { name: 'MBTI', icon: '🧠', count: testStats.mbtiTests || 0 },
      { name: 'Big Five', icon: '📊', count: testStats.bigFiveTests || 0 },
      { name: 'VARK', icon: '👁️', count: testStats.varkTests || 0 },
      { name: 'Love Language', icon: '❤️', count: testStats.loveLanguageTests || 0 },
      { name: 'Multiple Intelligence', icon: '💡', count: testStats.miTests || 0 },
      { name: 'RIMB', icon: '👥', count: testStats.rimbTests || 0 },
    ].sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      topArticles,
      topTests: testStatsArray,
    };
  } catch (error) {
    console.error('Error in fetchTopContent:', error);
    return { topArticles: [], topTests: [] };
  }
}
