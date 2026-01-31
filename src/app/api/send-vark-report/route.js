// --- API VARK REPORT EMAIL ---
// Mengirim laporan lengkap VARK ke email user
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

    const { email, varkType, typeName, title, description, strength, tips, scores, studyMethods, careers, weaknesses, advice } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return Response.json(
        { success: false, error: 'Email tidak valid' },
        { status: 400 }
      );
    }

    // Type info for styling
    const typeStyles = {
      V: { emoji: "👁️", color: "#3b82f6", gradient: "from-blue-400 to-cyan-500" },
      A: { emoji: "🎧", color: "#f59e0b", gradient: "from-amber-400 to-orange-500" },
      R: { emoji: "📚", color: "#10b981", gradient: "from-emerald-400 to-teal-500" },
      K: { emoji: "✋", color: "#f43f5e", gradient: "from-rose-400 to-pink-500" }
    };

    const style = typeStyles[varkType] || typeStyles.V;

    // Calculate percentages
    const total = Object.values(scores).reduce((sum, val) => sum + val, 0);

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Laporan Gaya Belajar VARK Kamu - Kancah Ate</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 30px; text-align: center; color: white; }
          .logo { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
          .subtitle { opacity: 0.9; margin-top: 5px; }
          .content { padding: 30px; }
          .vark-emoji { font-size: 64px; text-align: center; margin: 20px 0; }
          .type-title { font-size: 28px; font-weight: 800; text-align: center; color: ${style.color}; margin-bottom: 10px; }
          .type-desc { color: #666; line-height: 1.7; text-align: center; margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: 700; color: #333; margin-bottom: 15px; border-left: 4px solid ${style.color}; padding-left: 10px; }
          .strength-box { background: #f0fdfa; padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
          .strength-box p { color: #0f766e; margin: 0; font-size: 16px; }
          .tips-list, .methods-list, .careers-list { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .list-item { display: block; background: white; padding: 10px 14px; margin: 6px 0; border-radius: 8px; font-size: 14px; color: #333; border-left: 3px solid ${style.color}; }
          .score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .score-item { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
          .score-label { font-size: 20px; font-weight: 700; color: ${style.color}; }
          .score-value { font-size: 28px; font-weight: 800; color: #333; }
          .score-percent { font-size: 12px; color: #666; }
          .advice { background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .advice h4 { color: #92400e; margin: 0 0 10px 0; }
          .advice p { color: #78350f; margin: 0; line-height: 1.6; }
          .weaknesses { background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .weakness-item { display: inline-block; background: white; padding: 6px 12px; margin: 4px; border-radius: 6px; font-size: 13px; color: #dc2626; border: 1px solid #fecaca; }
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
              Hai! 👋 Berikut laporan lengkap hasil tes gaya belajar VARK kamu.
            </p>

            <div class="vark-emoji">${style.emoji}</div>
            <div class="type-title">${typeName}</div>
            <div class="type-desc">${description}</div>

            <div class="strength-box">
              <p style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">KEKUATANMU</p>
              <p style="font-weight: 600;">${strength}</p>
            </div>

            <div class="section-title">📊 Skor Gaya Belajar</div>
            <div class="score-grid">
              ${Object.entries(scores).map(([key, value]) => `
                <div class="score-item">
                  <div class="score-label">${key}</div>
                  <div class="score-value">${value}</div>
                  <div class="score-percent">${Math.round((value / total) * 100)}%</div>
                </div>
              `).join('')}
            </div>

            <div class="section-title">💡 Tips Belajar Efektif</div>
            <div class="tips-list">
              ${tips.map(tip => `<span class="list-item">✓ ${tip}</span>`).join('')}
            </div>

            <div class="section-title">📖 Metode Belajar yang Cocok</div>
            <div class="methods-list">
              ${studyMethods.map(method => `<span class="list-item">📌 ${method}</span>`).join('')}
            </div>

            ${weaknesses && weaknesses.length > 0 ? `
              <div class="section-title">⚠️ Tantanganmu</div>
              <div class="weaknesses">
                ${weaknesses.map(w => `<span class="weakness-item">${w}</span>`).join('')}
              </div>
            ` : ''}

            <div class="section-title">💼 Karir yang Cocok</div>
            <div class="careers-list">
              ${careers.map(c => `<span class="list-item">💼 ${c}</span>`).join('')}
            </div>

            <div class="advice">
              <h4>🎓 Tips Pengembangan Diri</h4>
              <p>${advice}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; margin-bottom: 15px;">
                Ingin diskusi lebih lanjut tentang gaya belajarmu?
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
      subject: `Laporan Gaya Belajar Kamu: ${typeName}`,
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
        testType: 'VARK',
        resultSummary: {
          varkType,
          typeName,
          scores
        },
        rawResult: { varkType, scores, tips }
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
