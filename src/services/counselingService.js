'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getUserCounselingSessions(email) {
  try {
    const sessions = await db.query.counselingSessions.findMany({
      where: eq(schema.counselingSessions.userEmail, email),
      orderBy: [desc(schema.counselingSessions.createdAt)],
      limit: 10
    });
    
    return { success: true, data: sessions };
  } catch (error) {
    console.error('Error fetching counseling sessions:', error);
    return { success: false, error: error.message };
  }
}
