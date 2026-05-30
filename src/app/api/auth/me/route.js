import { NextResponse } from 'next/server';
import { getUserByToken } from '@/lib/db';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ isLoggedIn: false, requiresLogin: true }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = await getUserByToken(token);

    if (!user) {
      return NextResponse.json({ isLoggedIn: false, requiresLogin: true }, { status: 401 });
    }

    return NextResponse.json({ isLoggedIn: true, user });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ isLoggedIn: false, error: 'Internal server error' }, { status: 500 });
  }
}
