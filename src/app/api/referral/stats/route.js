import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

// GET /api/referral/stats — hitung jumlah teman yang daftar via referral user ini
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.execute(
      sql`SELECT COUNT(*) as count FROM users WHERE referred_by = ${session.user.id}::uuid`
    );

    const count = parseInt(result.rows?.[0]?.count ?? result[0]?.count ?? 0);

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('[Referral Stats] Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
