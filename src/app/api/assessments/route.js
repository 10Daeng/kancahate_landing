import { NextResponse } from 'next/server';
import { sql, getUserByToken } from '@/lib/db';

async function getUserFromAuthHeader(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return await getUserByToken(token);
}

export async function GET(request) {
  try {
    const user = await getUserFromAuthHeader(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT id, email, assessment_type as test_type, scores, result_data as result, created_at as completed_at
      FROM assessment_results
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(result || []);
  } catch (error) {
    console.error('Error in GET /api/assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromAuthHeader(request);
    const body = await request.json();
    const { testType, result, anonUserId } = body;

    const assessmentData = {
      user_id: user ? user.id : null,
      anon_user_id: anonUserId || null,
      email: user ? user.email : 'anonymous@kancahate.my.id',
      scores: result.scores || result.totalScore || null,
      test_type: testType
    };

    const dbResult = await sql`
      INSERT INTO assessment_results (user_id, anon_user_id, email, assessment_type, scores, result_data, created_at)
      VALUES (${assessmentData.user_id}, ${assessmentData.anon_user_id}, ${assessmentData.email}, ${testType}, ${JSON.stringify(assessmentData.scores)}, ${JSON.stringify(result)}, NOW())
      RETURNING id, created_at as completed_at
    `;

    return NextResponse.json(dbResult[0]);
  } catch (error) {
    console.error('Error in POST /api/assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getUserFromAuthHeader(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM assessment_results
      WHERE id = ${id}
      AND user_id = ${user.id}
      RETURNING id
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
