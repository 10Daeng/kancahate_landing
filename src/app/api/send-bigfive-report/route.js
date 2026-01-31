// --- API BIG FIVE REPORT EMAIL ---
// Mengirim laporan lengkap Big Five (OCEAN) ke email user
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
    const { email, scores, levels, domainDetails } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return Response.json(
        { success: false, error: 'Email tidak valid' },
        { status: 400 }
      );
    }

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Laporan Kepribadian Big Five Kamu - Kancah Ate</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f0f4f8; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px; text-align: center; color: white; }
          .logo { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
          .subtitle { opacity: 0.9; margin-top: 5px; }
          .content { padding: 30px; }
          .intro { text-align: center; margin-bottom: 30px; }
          .intro h2 { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
          .intro p { color: #64748b; }
          .domain-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #cbd5e1; }
          .domain-header { display: flex; justify-between align-items-center; margin-bottom: 10px; }
          .domain-name { display: flex; align-items-center; gap: 8px; font-size: 18px; font-weight: 700; color: #1e293b; }
          .domain-score { font-size: 24px; font-weight: 800; }
          .domain-desc { color: #64748b; font-size: 14px; margin-bottom: 12px; }
          .level-box { background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; }
          .level-title { font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 4px; }
          .level-desc { font-size: 14px; color: #334155; }
          .progress-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
          .progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
          .strengths-list { margin-top: 12px; }
          .strength-item { display: inline-block; background: #dcfce7; color: #16a34a; padding: 4px 10px; border-radius: 6px; font-size: 12px; margin: 4px 4px 0 0; }
          .careers-list { margin-top: 12px; }
          .career-item { display: inline-block; background: #dbeafe; color: #2563eb; padding: 4px 10px; border-radius: 6px; font-size: 12px; margin: 4px 4px 0 0; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          .cta { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Kancah Ate</div>
            <div class="subtitle">Teman Cerita Virtual</div>
          </div>

          <div class="content">
            <div class="intro">
              <h2>Hasil Tes Kepribadian Big Five</h2>
              <p>Analisis lengkap 5 dimensi kepribadian kamu (OCEAN)</p>
            </div>

            ${Object.entries(domainDetails).map(([domain, detail]) => {
              const scorePercent = (parseFloat(detail.score) / 5) * 100;
              return `
                <div class="domain-card" style="border-left-color: ${detail.level === 'high' ? detail.name.includes('Keterbukaan') ? '#a855f7' : detail.name.includes('Kesadaran') ? '#3b82f6' : detail.name.includes('Ekstraversi') ? '#eab308' : detail.name.includes('Keramahan') ? '#22c55e' : '#ef4444' : '#94a3b8'}">
                  <div class="domain-header">
                    <div class="domain-name">
                      <span>${detail.emoji}</span>
                      <span>${detail.name}</span>
                    </div>
                    <div class="domain-score" style="color: ${detail.level === 'high' ? '#16a34a' : detail.level === 'low' ? '#ef4444' : '#64748b'}">${detail.score}</div>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${scorePercent}%; background: ${detail.level === 'high' ? '#16a34a' : detail.level === 'low' ? '#ef4444' : '#64748b'}"></div>
                  </div>
                  <p class="domain-desc">${detail.description}</p>
                  <div class="level-box">
                    <div class="level-title">${detail.level.toUpperCase()}</div>
                    <div class="level-desc">${detail.title}</div>
                  </div>
                  ${detail.strengths && detail.strengths.length > 0 ? `
                    <div class="strengths-list">
                      ${detail.strengths.map(s => `<span class="strength-item">✓ ${s}</span>`).join('')}
                    </div>
                  ` : ''}
                  ${detail.careers && detail.careers.length > 0 ? `
                    <div class="careers-list">
                      <div class="level-title">💼 Karir yang Cocok</div>
                      ${detail.careers.slice(0, 5).map(c => `<span class="career-item">💼 ${c}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #64748b; margin-bottom: 15px;">
                Ingin diskusi lebih lanjut tentang kepribadianmu?
              </p>
              <a href="https://kancahate.my.id" class="cta">
                💬 Chat dengan Kai
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Email ini dikirim pada ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="color: #94a3b8;">kancahate.my.id - Teman Cerita Virtual</p>
            <p style="color: #cbd5e1; font-size: 11px; margin-top: 10px;">
              Big Five adalah model psikologi ilmiah yang valid. Hasil ini untuk pengembangan diri.<br>
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
      subject: `Laporan Kepribadian Big Five Kamu`,
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
        testType: 'BIG_FIVE',
        resultSummary: {
          scores,
          levels
        },
        rawResult: { scores, levels }
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
