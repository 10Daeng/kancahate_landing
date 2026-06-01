import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, turnstileToken } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email dan kata sandi diperlukan' }, { status: 400 });
    }

    // 1. Verifikasi Cloudflare Turnstile
    if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY && turnstileToken) {
      const turnstileFormData = new URLSearchParams();
      turnstileFormData.append('secret', process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY);
      turnstileFormData.append('response', turnstileToken);

      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: turnstileFormData,
      });

      const turnstileData = await turnstileRes.json();
      if (!turnstileData.success) {
        return NextResponse.json({ success: false, error: 'Gagal verifikasi keamanan (Turnstile)' }, { status: 400 });
      }
    } else if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY && !turnstileToken) {
      return NextResponse.json({ success: false, error: 'Harap selesaikan verifikasi keamanan' }, { status: 400 });
    }

    // 2. Cek User dan Password
    // Admin login bypass (darurat) tidak perlu OTP, akan di-handle langsung di NextAuth
    if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ success: true, requireOtp: false });
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Email atau password salah' }, { status: 400 });
    }

    // Cek apakah akun dikunci
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      const minutesLeft = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
      return NextResponse.json({ success: false, error: `Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${minutesLeft} menit.` }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Catat kegagalan
      const newAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateData = { failedLoginAttempts: newAttempts };
      
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60000);
      }
      
      await db.update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, user.id));

      if (newAttempts >= 5) {
        return NextResponse.json({ success: false, error: 'Terlalu banyak percobaan gagal. Akun dikunci selama 15 menit.' }, { status: 403 });
      }
      return NextResponse.json({ success: false, error: 'Email atau password salah' }, { status: 400 });
    }

    // Cek apakah email sudah diverifikasi
    if (!user.emailVerified) {
      return NextResponse.json({ success: false, error: 'Akun belum diverifikasi. Silakan cek email Anda untuk memverifikasi akun.' }, { status: 403 });
    }

    // Jika berhasil passwordnya, reset failed attempts
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await db.update(schema.users)
        .set({ failedLoginAttempts: 0, lockedUntil: null })
        .where(eq(schema.users.id, user.id));
    }

    // 3. Buat OTP 6 Digit
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60000); // 5 menit

    // Simpan OTP ke DB
    await db.update(schema.users)
      .set({ otpCode, otpExpires })
      .where(eq(schema.users.id, user.id));

    // 4. Kirim Email OTP
    if (resend) {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%); padding: 40px 20px; text-align: center;">
            <img src="https://kancahate.my.id/logo.png" alt="Kancah Ate Logo" width="60" height="60" style="margin-bottom: 16px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Kancah Ate</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 15px; font-weight: 500;">Verifikasi Keamanan</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Halo, ${user.name || 'Pengguna'}! 🔒</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Seseorang sedang mencoba masuk ke akun Anda. Untuk memastikan bahwa ini benar-benar Anda, silakan masukkan kode 6 digit berikut ke layar login:
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 24px 32px; border-radius: 12px; display: inline-block;">
                <span style="color: #7C3AED; font-size: 36px; font-weight: 800; letter-spacing: 8px; font-family: monospace;">
                  ${otpCode}
                </span>
              </div>
            </div>
            
            <p style="color: #e4a11b; background-color: #fef9c3; padding: 12px; border-radius: 8px; font-size: 14px; line-height: 1.5; margin-bottom: 0; text-align: center; font-weight: 600;">
              ⏳ Kode ini akan kedaluwarsa dalam 5 menit.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">
              Jika Anda tidak sedang mencoba untuk masuk ke Kancah Ate, abaikan email ini atau segera perbarui kata sandi Anda.<br><br>
              © 2026 Kancah Ate. All rights reserved.
            </p>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: 'Kancah Ate <noreply@kancahate.my.id>',
        to: email,
        subject: `Kode OTP Login Anda: ${otpCode}`,
        html: emailHtml,
      });
    } else {
        // Untuk testing lokal jika Resend tidak dikonfigurasi
        console.log(`[DEV ONLY] OTP CODE FOR ${email} IS: ${otpCode}`);
    }

    return NextResponse.json({ 
      success: true, 
      requireOtp: true,
      message: 'Kode OTP telah dikirim ke email Anda.'
    });

  } catch (error) {
    console.error('OTP Request error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
