// --- API LOVE LANGUAGES REPORT EMAIL ---
// Mengirim laporan lengkap Love Languages ke email user
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

    const { email, loveLanguage, title, description, emoji, scores, whatYouNeed, whatYouCanDo, redFlags, perfectMatch, advice } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return Response.json(
        { success: false, error: 'Email tidak valid' },
        { status: 400 }
      );
    }

    // Type info for styling
    const typeStyles = {
      Words: { emoji: "💬", color: "#ec4899", gradient: "from-pink-400 to-rose-500" },
      Acts: { emoji: "🤝", color: "#3b82f6", gradient: "from-blue-400 to-indigo-500" },
      Gifts: { emoji: "🎁", color: "#f59e0b", gradient: "from-amber-400 to-orange-500" },
      Quality: { emoji: "⏰", color: "#a855f7", gradient: "from-purple-400 to-violet-500" },
      Touch: { emoji: "🤗", color: "#f43f5e", gradient: "from-rose-400 to-pink-500" }
    };

    const style = typeStyles[loveLanguage] || typeStyles.Words;

    // Calculate percentages
    const total = Object.values(scores).reduce((sum, val) => sum + val, 0);

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Laporan Bahasa Cinta Kamu - Kancah Ate</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #fef2f2; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 30px; text-align: center; color: white; }
          .logo { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
          .subtitle { opacity: 0.9; margin-top: 5px; }
          .content { padding: 30px; }
          .emoji { font-size: 64px; text-align: center; margin: 20px 0; }
          .title { font-size: 26px; font-weight: 800; text-align: center; color: ${style.color}; margin-bottom: 15px; line-height: 1.3; }
          .desc { color: #666; line-height: 1.7; text-align: center; margin-bottom: 25px; font-size: 16px; }
          .section-title { font-size: 18px; font-weight: 700; color: #333; margin-bottom: 15px; border-left: 4px solid ${style.color}; padding-left: 10px; }
          .score-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 25px; }
          .score-item { background: #fdf2f8; padding: 12px 8px; border-radius: 8px; text-align: center; }
          .score-label { font-size: 20px; }
          .score-value { font-size: 24px; font-weight: 800; color: ${style.color}; }
          .score-percent { font-size: 10px; color: #666; }
          .list-box { background: #fdf2f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .list-item { display: block; background: white; padding: 10px 14px; margin: 6px 0; border-radius: 8px; font-size: 14px; color: #333; border-left: 3px solid ${style.color}; }
          .red-flags { background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .red-flag-item { display: inline-block; background: white; padding: 6px 12px; margin: 4px; border-radius: 6px; font-size: 13px; color: #dc2626; border: 1px solid #fecaca; }
          .match-box { background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .match-item { display: inline-block; background: white; padding: 6px 12px; margin: 4px; border-radius: 6px; font-size: 13px; color: #16a34a; border: 1px solid #bbf7d0; }
          .advice { background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .advice h4 { color: #92400e; margin: 0 0 10px 0; }
          .advice p { color: #78350f; margin: 0; line-height: 1.6; }
          .footer { background: #fdf2f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .cta { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: 600; }
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
              Hai! 💕 Berikut laporan lengkap hasil tes Bahasa Cinta kamu.
            </p>

            <div class="emoji">${style.emoji}</div>
            <div class="title">${title}</div>
            <div class="desc">${description}</div>

            <div class="section-title">📊 Skor Bahasa Cintamu</div>
            <div class="score-grid">
              ${Object.entries(scores).map(([key, value]) => {
                const itemStyle = typeStyles[key];
                return `
                  <div class="score-item">
                    <div class="score-label">${itemStyle ? itemStyle.emoji : '❤️'}</div>
                    <div class="score-value">${value}</div>
                    <div class="score-percent">${Math.round((value / total) * 100)}%</div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="section-title">💝 Yang Kamu Butuhkan</div>
            <div class="list-box">
              ${whatYouNeed.map(need => `<span class="list-item">✨ ${need}</span>`).join('')}
            </div>

            <div class="section-title">🎁 Yang Bisa Kamu Berikan</div>
            <div class="list-box">
              ${whatYouCanDo.map(doing => `<span class="list-item">💝 ${doing}</span>`).join('')}
            </div>

            ${redFlags && redFlags.length > 0 ? `
              <div class="section-title">⚠️ Red Flags (Hindari Ini)</div>
              <div class="red-flags">
                ${redFlags.map(flag => `<span class="red-flag-item">🚩 ${flag}</span>`).join('')}
              </div>
            ` : ''}

            ${perfectMatch && perfectMatch.length > 0 ? `
              <div class="section-title">💑 Pasangan yang Cocok</div>
              <div class="match-box">
                ${perfectMatch.map(match => `<span class="match-item">💑 ${match}</span>`).join('')}
              </div>
            ` : ''}

            <div class="advice">
              <h4>💡 Tips untuk Hubungan yang Lebih Baik</h4>
              <p>${advice}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; margin-bottom: 15px;">
                Ingin diskusi lebih lanjut tentang hubungan percintaanmu?
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
              Ingat: Bahasa cinta bisa berubah seiring waktu. Komunikasi adalah kunci hubungan yang sehat! ❤️<br>
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
      subject: `Laporan Bahasa Cinta Kamu: ${title.split('(')[0].trim()}`,
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
        testType: 'LOVE_LANGUAGES',
        resultSummary: {
          loveLanguage,
          title,
          scores
        },
        rawResult: { loveLanguage, scores }
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
