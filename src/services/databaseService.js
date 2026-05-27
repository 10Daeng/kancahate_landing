'use server';

import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function getDatabaseStats() {
  try {
    // Query PostgreSQL internal tables for metrics
    const statsQuery = await db.execute(sql`
      SELECT 
        relname as table_name, 
        n_live_tup as row_count, 
        pg_size_pretty(pg_total_relation_size(C.oid)) as total_size,
        pg_total_relation_size(C.oid) as size_bytes
      FROM pg_class C 
      LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace) 
      LEFT JOIN pg_stat_user_tables S ON (S.relid = C.oid)
      WHERE nspname NOT IN ('pg_catalog', 'information_schema') 
        AND relkind = 'r'
        AND relname NOT LIKE 'pg_%'
        AND relname NOT LIKE 'sql_%'
      ORDER BY size_bytes DESC;
    `);

    // Get connection status (if it didn't throw, it's connected)
    return {
      success: true,
      data: statsQuery.rows || statsQuery,
      status: 'connected',
    };
  } catch (error) {
    console.error('Error fetching database stats:', error);
    return {
      success: false,
      error: error.message,
      status: 'disconnected',
    };
  }
}
