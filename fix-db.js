import { sql } from './src/lib/db.js';

async function main() {
  try {
    console.log('Dropping email_verified column...');
    await sql`ALTER TABLE users DROP COLUMN email_verified;`;
    console.log('Column dropped successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
