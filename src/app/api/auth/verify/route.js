import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json({ success: false, error: 'Token dan email tidak valid' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: and(
        eq(schema.users.email, email),
        eq(schema.users.verificationToken, token)
      )
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Token verifikasi tidak valid atau sudah digunakan' }, { status: 400 });
    }

    if (user.emailVerified) {
       return NextResponse.json({ success: true, message: 'Email sudah diverifikasi sebelumnya.' });
    }

    // Update emailVerified and clear token
    await db.update(schema.users)
      .set({ 
        emailVerified: new Date(),
        verificationToken: null 
      })
      .where(eq(schema.users.id, user.id));

    return NextResponse.json({ success: true, message: 'Email berhasil diverifikasi' });

  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
