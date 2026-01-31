// --- API MULTIPLE INTELLIGENCE REPORT EMAIL ---
// Mengirim laporan lengkap Multiple Intelligence ke email user
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

// MI Type styling
const MI_STYLES = {
  LM: { emoji: "🧮", color: "#3b82f6", gradient: "from-blue-400 to-indigo-500", name: "Logical-Mathematical" },
  VL: { emoji: "📝", color: "#f59e0b", gradient: "from-amber-400 to-orange-500", name: "Verbal-Linguistic" },
  VS: { emoji: "🎨", color: "#a855f7", gradient: "from-purple-400 to-violet-500", name: "Visual-Spatial" },
  BK: { emoji: "🏃", color: "#f43f5e", gradient: "from-rose-400 to-pink-500", name: "Bodily-Kinesthetic" },
  M: { emoji: "🎵", color: "#ec4899", gradient: "from-pink-400 to-rose-500", name: "Musical" },
  I: { emoji: "👥", color: "#22c55e", gradient: "from-green-400 to-emerald-500", name: "Interpersonal" },
  IN: { emoji: "🧘", color: "#6366f1", gradient: "from-indigo-400 to-violet-500", name: "Intrapersonal" },
  N: { emoji: "🌿", color: "#10b981", gradient: "from-emerald-400 to-green-500", name: "Naturalist" }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, miType, title, description, emoji, scores, strengths, weaknesses, studyTips, careers, advice } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return Response.json(
        { success: false, error: 'Email tidak valid' },
        { status: 400 }
      );
    }

    const mainStyle = MI_STYLES[miType] || MI_STYLES.LM;

    // Calculate max score for percentage
    const maxPerType = 12; // 3 questions x max score 4
    const scoreEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Laporan Kecerdasan Kamu - Kancah Ate</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f3ff; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 30px; text-align: center; color: white; }
          .logo { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
          .subtitle { opacity: 0.9; margin-top: 5px; }
          .content { padding: 30px; }
          .intro { text-align: center; margin-bottom: 30px; }
          .main-emoji { font-size: 64px; text-align: center; margin: 20px 0; }
          .main-title { font-size: 28px; font-weight: 800; text-align: center; color: ${mainStyle.color}; margin-bottom: 10px; }
          .main-desc { color: #64748b; line-height: 1.7; text-align: center; margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: 700; color: #333; margin-bottom: 15px; border-left: 4px solid ${mainStyle.color}; padding-left: 10px; }
          .list-box { background: #faf5ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .list-item { display: block; background: white; padding: 10px 14px; margin: 6px 0; border-radius: 8px; font-size: 14px; color: #333; border-left: 3px solid ${mainStyle.color}; }
          .weakness-box { background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .weakness-item { display: inline-block; background: white; padding: 6px 12px; margin: 4px; border-radius: 6px; font-size: 13px; color: #dc2626; border: 1px solid #fecaca; }
          .career-item { display: inline-block; background: #dbeafe; color: #2563eb; padding: 6px 12px; margin: 4px; border-radius: 6px; font-size: 13px; }
          .score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .score-item { background: #faf5ff; padding: 12px; border-radius: 8px; text-align: center; }
          .score-emoji { font-size: 20px; }
          .score-bar { margin-top: 6px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
          .score-fill { height: 100%; border-radius: 3px; }
          .advice { background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .advice h4 { color: #92400e; margin: 0 0 10px 0; }
          .advice p { color: #78350f; margin: 0; line-height: 1.6; }
          .footer { background: #faf5ff; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
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
              <h2 style="font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 5px;">Hasil Tes Multiple Intelligence</h2>
              <p style="color: #64748b;">Teori Kecerdasan Majemuk Howard Gardner</p>
            </div>

            <div class="main-emoji">${mainStyle.emoji}</div>
            <div class="main-title">${title}</div>
            <div class="main-desc">${description}</div>

            <div class="section-title">📊 Skor Semua Kecerdasan</div>
            <div class="score-grid">
              ${scoreEntries.map(([type, score]) => {
                const style = MI_STYLES[type];
                const percent = (score / maxPerType) * 100;
                return `
                  <div class="score-item">
                    <div class="score-emoji">${style.emoji}</div>
                    <div style="font-size: 11px; font-weight: 600; color: #64748b;">${type}</div>
                    <div style="font-size: 16px; font-weight: 700; color: ${style.color};">${score}</div>
                    <div class="score-bar">
                      <div class="score-fill" style="width: ${percent}%; background: ${style.color};"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="section-title">💪 Kelebihanmu</div>
            <div class="list-box">
              ${strengths.map(s => `<span class="list-item">✨ ${s}</span>`).join('')}
            </div>

            ${weaknesses && weaknesses.length > 0 ? `
              <div class="section-title">⚠️ Tantanganmu</div>
              <div class="weakness-box">
                ${weaknesses.map(w => `<span class="weakness-item">📌 ${w}</span>`).join('')}
              </div>
            ` : ''}

            <div class="section-title">📚 Tips Belajar</div>
            <div class="list-box">
              ${studyTips.map(tip => `<span class="list-item">📖 ${tip}</span>`).join('')}
            </div>

            <div class="section-title">💼 Karir yang Cocok</div>
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              ${careers.map(c => `<span class="career-item">💼 ${c}</span>`).join('')}
            </div>

            <div class="advice">
              <h4>🌟 Tips Pengembangan Diri</h4>
              <p>${advice}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #64748b; margin-bottom: 15px;">
                Ingin diskusi lebih lanjut tentang potensimu?
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
              Multiple Intelligence adalah teori Howard Gardner. Setiap orang unik dengan kombinasi kecerdasan berbeda.<br>
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
      subject: `Laporan Kecerdasan Kamu: ${title.split('(')[0].trim()}`,
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
        testType: 'MULTIPLE_INTELLIGENCE',
        resultSummary: {
          miType,
          title,
          scores
        },
        rawResult: { miType, scores }
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
