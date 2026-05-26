import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Database URL must be configured in your environment variables
// Expected format: postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
export const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy');
export const db = drizzle(sql, { schema });
