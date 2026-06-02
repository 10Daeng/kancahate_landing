import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Resend } from 'resend';

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, turnstileToken, referredBy } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Harap isi semua kolom' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Kata sandi minimal 6 karakter' }, { status: 400 });
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
      return NextResponse.json({ success: false, error: 'Harap selesaikan verifikasi keamanan (CAPTCHA)' }, { status: 400 });
    }

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 400 });
    }

    // 3. Hash password dan buat token
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 4. Simpan ke database
    // Validasi referredBy (harus UUID valid agar tidak crash)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validReferredBy = referredBy && uuidRegex.test(referredBy) ? referredBy : null;

    const newUser = await db.insert(schema.users).values({
      name,
      email,
      passwordHash,
      verificationToken,
      ...(validReferredBy ? { referredBy: validReferredBy } : {}),
      // emailVerified will remain null until verified
    }).returning({ id: schema.users.id, email: schema.users.email });

    // 5. Kirim email verifikasi
    if (resend) {
      const verifyLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%); padding: 40px 20px; text-align: center;">
            <img src="https://kancahate.my.id/logo.png" alt="Kancah Ate Logo" width="60" height="60" style="margin-bottom: 16px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Kancah Ate</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 15px; font-weight: 500;">Teman Cerita Virtualmu</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Selamat Datang, ${name}! 👋</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Terima kasih telah bergabung dengan Kancah Ate. Kami sangat senang Anda ada di sini. Untuk mulai menggunakan akun Anda, silakan verifikasi alamat email ini dengan mengklik tombol di bawah.
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${verifyLink}" style="background: linear-gradient(135deg, #7C3AED, #A855F7); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);">
                Verifikasi Email Saya
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
              Tombol tidak berfungsi? Salin dan tempel tautan berikut ke peramban Anda:<br>
              <a href="${verifyLink}" style="color: #7C3AED; word-break: break-all;">${verifyLink}</a>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">
              Jika Anda tidak mendaftar di Kancah Ate, silakan abaikan email ini.<br>
              © 2026 Kancah Ate. All rights reserved.
            </p>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: 'Kancah Ate <noreply@kancahate.my.id>',
        to: email,
        subject: 'Verifikasi Akun Kancah Ate Anda',
        html: emailHtml,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Pendaftaran berhasil. Silakan cek email Anda untuk memverifikasi akun sebelum login.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
