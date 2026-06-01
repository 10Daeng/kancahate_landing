import { neon } from '@neondatabase/serverless';

async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  
  console.log('Connecting to database...');
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Adding verification_token column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)`;
    
    console.log('Adding otp_code column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10)`;
    
    console.log('Adding otp_expires column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP`;
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
