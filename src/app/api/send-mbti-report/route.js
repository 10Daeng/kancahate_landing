// --- API MBTI REPORT EMAIL ---
// Mengirim laporan lengkap MBTI ke email user
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

    const { email, mbtiType, typeName, description, traits, scores, strengths, careers, advice } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return Response.json(
        { success: false, error: 'Email tidak valid' },
        { status: 400 }
      );
    }

    // Calculate percentages for each dichotomy
    const calculatePercent = (a, b) => {
      const total = a + b;
      if (total === 0) return 50;
      return Math.round((a / total) * 100);
    };

    const ePercent = calculatePercent(scores.E, scores.I);
    const iPercent = 100 - ePercent;
    const sPercent = calculatePercent(scores.S, scores.N);
    const nPercent = 100 - sPercent;
    const tPercent = calculatePercent(scores.T, scores.F);
    const fPercent = 100 - tPercent;
    const jPercent = calculatePercent(scores.J, scores.P);
    const pPercent = 100 - jPercent;

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Laporan Kepribadian MBTI Kamu - Kancah Ate</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 30px; text-align: center; color: white; }
          .logo { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
          .subtitle { opacity: 0.9; margin-top: 5px; }
          .content { padding: 30px; }
          .mbti-code { font-size: 56px; font-weight: 900; text-align: center; color: #8b5cf6; margin: 20px 0; letter-spacing: 4px; }
          .type-name { font-size: 22px; font-weight: 700; text-align: center; color: #333; margin-bottom: 15px; }
          .type-desc { color: #666; line-height: 1.7; text-align: center; margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: 700; color: #333; margin-bottom: 15px; border-left: 4px solid #8b5cf6; padding-left: 10px; }
          .traits { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 20px; }
          .trait-tag { background: #f0f0ff; color: #6366f1; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
          .score-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
          .score-label { width: 30px; font-weight: 700; color: #8b5cf6; font-size: 16px; }
          .bar-container { flex: 1; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; }
          .bar-fill { height: 100%; transition: width 0.3s; }
          .bar-e { background: linear-gradient(90deg, #3b82f6 50%, #8b5cf6 50%); }
          .bar-s { background: linear-gradient(90deg, #eab308 50%, #3b82f6 50%); }
          .bar-t { background: linear-gradient(90deg, #22c55e 50%, #eab308 50%); }
          .bar-j { background: linear-gradient(90deg, #a855f7 50%, #22c55e 50%); }
          .percent { width: 40px; text-align: right; font-size: 12px; color: #666; }
          .strengths, .careers { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .list-item { display: inline-block; background: white; padding: 6px 12px; margin: 4px; border-radius: 6px; font-size: 13px; color: #333; border: 1px solid #e5e7eb; }
          .advice { background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .advice h4 { color: #92400e; margin: 0 0 10px 0; }
          .advice p { color: #78350f; margin: 0; line-height: 1.6; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
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
            <p style="text-align: center; color: #666; margin-bottom: 20px;">
              Hai! 👋 Berikut laporan lengkap hasil tes kepribadian MBTI kamu.
            </p>

            <div class="mbti-code">${mbtiType}</div>
            <div class="type-name">${typeName}</div>
            <div class="type-desc">${description}</div>

            <div class="traits">
              ${traits.map(t => `<span class="trait-tag">${t}</span>`).join('')}
            </div>

            <div class="section-title">📊 Skor Kepribadian Kamu</div>

            <div class="score-bar">
              <span class="score-label">E</span>
              <div class="bar-container">
                <div class="bar-fill bar-e" style="width: ${ePercent}%"></div>
              </div>
              <span class="percent">${ePercent}%</span>
              <span class="score-label" style="text-align: right;">I</span>
            </div>

            <div class="score-bar">
              <span class="score-label">S</span>
              <div class="bar-container">
                <div class="bar-fill bar-s" style="width: ${sPercent}%"></div>
              </div>
              <span class="percent">${sPercent}%</span>
              <span class="score-label" style="text-align: right;">N</span>
            </div>

            <div class="score-bar">
              <span class="score-label">T</span>
              <div class="bar-container">
                <div class="bar-fill bar-t" style="width: ${tPercent}%"></div>
              </div>
              <span class="percent">${tPercent}%</span>
              <span class="score-label" style="text-align: right;">F</span>
            </div>

            <div class="score-bar">
              <span class="score-label">J</span>
              <div class="bar-container">
                <div class="bar-fill bar-j" style="width: ${jPercent}%"></div>
              </div>
              <span class="percent">${jPercent}%</span>
              <span class="score-label" style="text-align: right;">P</span>
            </div>

            <div class="section-title">💪 Kelebihanmu</div>
            <div class="strengths">
              ${strengths.map(s => `<span class="list-item">✓ ${s}</span>`).join('')}
            </div>

            <div class="section-title">💼 Karir yang Cocok</div>
            <div class="careers">
              ${careers.map(c => `<span class="list-item">💼 ${c}</span>`).join('')}
            </div>

            <div class="advice">
              <h4>💡 Tips Pengembangan Diri</h4>
              <p>${advice}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; margin-bottom: 15px;">
                Ingin diskusi lebih lanjut tentang kepribadianmu?
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
      subject: `Laporan Kepribadian Kamu: ${mbtiType} - ${typeName}`,
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
        testType: 'MBTI',
        resultSummary: {
          mbtiType,
          typeName,
          scores
        },
        rawResult: { mbtiType, scores, traits }
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
