import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { sessionId } = body;
    
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
    }
    
    // Update counseling session in DB
    const result = await db.update(schema.counselingSessions)
      .set({ userId: session.user.id, updatedAt: new Date() })
      .where(eq(schema.counselingSessions.sessionId, sessionId))
      .returning();
      
    // Update any chat drafts as well if they exist
    await db.update(schema.chatDrafts)
      .set({ userId: session.user.id })
      .where(eq(schema.chatDrafts.sessionId, sessionId));
      
    if (result.length > 0) {
      return NextResponse.json({ success: true, message: 'Session linked successfully' });
    } else {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('[API] Error linking session:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
