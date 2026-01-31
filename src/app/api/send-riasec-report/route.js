// --- API RIASEC REPORT EMAIL ---
// Mengirim laporan lengkap RIASEC ke email user
// Sekaligus menyimpan data analytics anonim

import { Resend } from 'resend';
import { saveAssessmentAnalytics } from '@/services/assessmentAnalytics';

// Initialize Resend only if API key is available
let resend = null;
if (process.env.RESEND_API_KEY) {
  try {
    resend = new Resend(process.env.RESEND_API_KEY);
  } catch (e) {
    console.warn('Resend initialization failed:', e.message);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { email, hollandCode, primaryType, typeBreakdown } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return Response.json(
        { success: false, error: 'Email tidak valid' },
        { status: 400 }
      );
    }

    // Get primary type info
    const typeNames = {
      R: { name: 'Realistic (Doers)', emoji: '🔧' },
      I: { name: 'Investigative (Thinkers)', emoji: '🧠' },
      A: { name: 'Artistic (Creators)', emoji: '🎨' },
      S: { name: 'Social (Helpers)', emoji: '🤝' },
      E: { name: 'Enterprising (Persuaders)', emoji: '💼' },
      C: { name: 'Conventional (Organizers)', emoji: '📋' }
    };

    const primaryInfo = typeNames[primaryType] || typeNames.R;

    // Calculate score breakdown text
    const scoreText = typeBreakdown
      .sort((a, b) => b.percentage - a.percentage)
      .map((t) => `${t.emoji} ${t.name}: ${t.percentage}%`)
      .join('\n');

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Laporan Minat Karir Kamu - Kancah Ate</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 30px; text-align: center; color: white; }
          .logo { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
          .subtitle { opacity: 0.9; margin-top: 5px; }
          .content { padding: 30px; }
          .holland-code { font-size: 48px; font-weight: 800; text-align: center; color: #ff6b35; margin: 20px 0; }
          .code-label { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
          .primary-type { text-align: center; margin-bottom: 30px; }
          .primary-emoji { font-size: 48px; }
          .type-name { font-size: 24px; font-weight: 700; color: #333; }
          .type-desc { color: #666; line-height: 1.6; margin-top: 10px; }
          .section-title { font-size: 18px; font-weight: 700; color: #333; margin-bottom: 15px; border-left: 4px solid #ff6b35; padding-left: 10px; }
          .score-breakdown { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .score-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
          .score-item:last-child { border-bottom: none; }
          .career-list { display: flex; flex-wrap: gap: 8px; margin-top: 10px; }
          .career-tag { background: #f0f0ff; color: #6366f1; padding: 6px 12px; border-radius: 20px; font-size: 13px; }
          .tips { background: #e8f5e9; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .tips h4 { color: #2d7a3f; margin: 0 0 10px 0; }
          .tips ul { margin: 0; padding-left: 20px; }
          .tips li { color: #2d7a3f; margin-bottom: 8px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .cta { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Kancah Ate</div>
            <div class="subtitle">Teman Cerita Virtual</div>
          </div>

          <div class="content">
            <p style="text-align: center; color: #666; margin-bottom: 20px;">
              Hai! 👋 Berikut laporan lengkap hasil tes minat karirmu.
            </p>

            <div class="holland-code">
              <div class="code-label">Kode Karir Holland</div>
              ${hollandCode}
            </div>

            <div class="primary-type">
              <div class="primary-emoji">${primaryInfo.emoji}</div>
              <div class="type-name">${primaryInfo.name}</div>
            </div>

            <div class="section-title">📊 Profil Minat Kamu</div>
            <div class="score-breakdown">
              ${scoreText}
            </div>

            <div class="section-title">💼 Rekomendasi Karir</div>
            <div class="career-list">
              ${
                typeBreakdown[0].jobs
                  ? typeBreakdown[0].jobs.map(job => `<span class="career-tag">${job}</span>`).join('')
                  : 'Explore karir yang sesuai dengan minatmu'
              }
            </div>

            <div class="tips">
              <h4>💡 Tips Pengembangan Diri</h4>
              <ul>
                <li>Eksplorasi karir di bidang yang sesuai dengan minatmu</li>
                <li>Cari mentor atau orang yang sudah sukses di bidang karir pilihanmu</li>
                <li>Ikuti kursus, workshop, atau event terkait minatmu</li>
                <li>Join komunitas atau forum untuk networking</li>
                <li>Bangun portofolio atau proyek untuk mengasah kemampuan</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; margin-bottom: 15px;">
                Ingin diskusi lebih lanjut tentang minat karirmu?
              </p>
              <a href="https://kancahate.my.id" class="cta">
                💬 Chat dengan Kai
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Email ini dikirim pada ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="color: #999;">kancahate.my.id - Teman Cerita Virtual</p>
            <p style="color: #aaa; font-size: 11px; margin-top: 10px;">
              Jika kamu tidak mendaftar untuk tes ini, silakan abaikan email ini.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend
    if (!resend) {
      console.error('Resend not configured - missing API key');
      return Response.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Kancah Ate <noreply@kancahate.my.id>',
      to: email,
      subject: `Laporan Minat Karir Kamu: ${hollandCode}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Email error:', error);
      return Response.json(
        { success: false, error: 'Gagal mengirim email' },
        { status: 500 }
      );
    }

    // Save analytics data (anonymous)
    await saveAssessmentAnalytics(
      {
        testType: 'RIASEC',
        resultSummary: {
          hollandCode,
          primaryType,
          scores: typeBreakdown.reduce((acc, t) => ({ ...acc, [t.code]: t.score }), {})
        },
        rawResult: { hollandCode, primaryType, typeBreakdown }
      },
      { headers: request.headers }
    );

    return Response.json({
      success: true,
      message: 'Email berhasil dikirim'
    });

  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
