// =============================================
// SCRIPT UNTUK MEMBUAT ADMIN USER
// Jalankan: node generate-admin-pass.js
// =============================================

import bcrypt from 'bcrypt';

const password = 'Admin123!'; // Ganti dengan password default yang Anda mau
const email = 'kancahate.official@gmail.com';

// Hash password
bcrypt.hash(password, 10)
  .then(hash => {
    console.log('============================================');
    console.log('SQL untuk membuat admin user:');
    console.log('============================================');
    console.log('');
    console.log(`-- Buat user admin (password: ${password})`);
    console.log(`INSERT INTO users (email, password_hash, name, role, is_active, email_verified)`);
    console.log(`VALUES ('${email}',`);
    console.log(` '${hash}',`);
    console.log("  'Admin Utama',");
    console.log("  'superadmin',");
    console.log('  true,');
    console.log('  true');
    console.log(');');
    console.log('');
    console.log('-- Buat admin_users record:');
    console.log('INSERT INTO admin_users (email, name, role, is_active, user_id)');
    console.log('SELECT');
    console.log(`  '${email}',`);
    console.log("  'Admin Utama',");
    console.log("  'superadmin',");
    console.log('  true,');
    console.log(`  (SELECT id FROM users WHERE email = '${email}' LIMIT 1)`);
    console.log(');');
    console.log('============================================');
  })
  .catch(err => {
    console.error('Error hashing password:', err);
  });
