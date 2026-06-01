import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthToken, getUserByToken, isAdminUser, saveIncidentReport, getIncidentReports, updateIncidentReportStatus } from '@/lib/db';

const VALID_INCIDENT_TYPES = [
  'kekerasan_fisik', 'kekerasan_verbal', 'bullying_fisik',
  'bullying_verbal', 'bullying_psikologis', 'bullying_siber', 'intoleransi',
];

const VALID_STATUSES = ['baru', 'ditinjau', 'ditindaklanjuti', 'selesai'];

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = getAuthToken(cookieStore);

    let userId = null;
    if (token) {
      const user = await getUserByToken(token);
      if (user) {
        userId = user.id;
      }
    }

    const body = await request.json();
    const {
      reporterName, reporterStatus, reporterPhone, reporterEmail,
      isAnonymous, perpetrators, victims,
      incidentType, bullyingTypes, location, incidentDate, incidentTime,
      chronology, witnesses, evidence, initialActions, reportedToCounselor,
      valuesViolated, severity,
    } = body;

    if (!incidentType) {
      return NextResponse.json(
        { success: false, error: 'Jenis insiden wajib diisi' },
        { status: 400 }
      );
    }

    if (!chronology || !chronology.trim()) {
      return NextResponse.json(
        { success: false, error: 'Kronologi kejadian wajib diisi' },
        { status: 400 }
      );
    }

    if (!VALID_INCIDENT_TYPES.includes(incidentType)) {
      return NextResponse.json(
        { success: false, error: 'Jenis insiden tidak valid' },
        { status: 400 }
      );
    }

    if (!isAnonymous && !userId) {
      return NextResponse.json(
        { success: false, error: 'Harap masuk terlebih dahulu atau pilih laporan anonim' },
        { status: 401 }
      );
    }

    const report = await saveIncidentReport({
      reporterId: isAnonymous ? null : userId,
      reporterName: reporterName || null,
      reporterStatus: reporterStatus || null,
      reporterPhone: reporterPhone || null,
      reporterEmail: reporterEmail || null,
      isAnonymous: isAnonymous || false,
      perpetrators: perpetrators || [],
      victims: victims || [],
      incidentType,
      bullyingTypes: bullyingTypes || [],
      location: location || null,
      incidentDate: incidentDate || null,
      incidentTime: incidentTime || null,
      chronology: chronology || null,
      witnesses: witnesses || [],
      evidence: evidence || [],
      initialActions: initialActions || null,
      reportedToCounselor: reportedToCounselor || false,
      valuesViolated: valuesViolated || [],
      severity: severity || 'sedang',
    });

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Laporan berhasil dikirim. Terima kasih atas keberanianmu melaporkan insiden ini.'
    });

  } catch (error) {
    console.error('Error creating incident report:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengirim laporan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = getAuthToken(cookieStore);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const user = await getUserByToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan' },
        { status: 401 }
      );
    }

    const isAdmin = await isAdminUser(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const reports = await getIncidentReports({ status, limit, offset });

    return NextResponse.json({
      success: true,
      data: reports
    });

  } catch (error) {
    console.error('Error fetching incident reports:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil laporan' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = getAuthToken(cookieStore);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const user = await getUserByToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan' },
        { status: 401 }
      );
    }

    const isAdmin = await isAdminUser(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya admin yang dapat mengubah status laporan.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID laporan dan status baru wajib diisi' },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    const updated = await updateIncidentReportStatus(id, status, adminNotes);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Laporan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Status laporan berhasil diubah menjadi "${status}"`
    });

  } catch (error) {
    console.error('Error updating incident report:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengubah status laporan' },
      { status: 500 }
    );
  }
}