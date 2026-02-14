// =============================================
-- API ROUTE: LOGOUT (Pengganti Supabase Auth)
-- =============================================

import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Logout user dengan menghapus cookie
 */
export async function POST(request) {
  const response = NextResponse.json({
    success: true,
    message: 'Berhasil logout'
  });

  // Hapus auth token cookie
  response.cookies.delete('auth_token', {
    path: '/'
  });

  return response;
}
