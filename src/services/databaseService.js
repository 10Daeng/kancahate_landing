'use server';

import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function getDatabaseStats() {
  try {
    // 1. Dapatkan daftar tabel user (bukan system tables)
    const tablesQuery = await db.execute(sql`
      SELECT 
        tablename as table_name
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    const tableNames = (tablesQuery.rows || tablesQuery).map(t => t.table_name);

    // 2. Untuk setiap tabel, hitung row count dan size secara akurat
    const tableStats = [];

    for (const tableName of tableNames) {
      try {
        // COUNT(*) — akurat, tidak tergantung ANALYZE
        const countResult = await db.execute(
          sql.raw(`SELECT COUNT(*) as row_count FROM "${tableName}"`)
        );
        const rowCount = Number(
          (countResult.rows || countResult)[0]?.row_count || 0
        );

        // pg_total_relation_size — ukuran tabel + index
        const sizeResult = await db.execute(
          sql.raw(`
            SELECT 
              pg_total_relation_size('"${tableName}"') as size_bytes,
              pg_size_pretty(pg_total_relation_size('"${tableName}"')) as total_size
          `)
        );
        const sizeRow = (sizeResult.rows || sizeResult)[0] || {};

        tableStats.push({
          table_name: tableName,
          row_count: rowCount,
          size_bytes: Number(sizeRow.size_bytes || 0),
          total_size: sizeRow.total_size || '0 bytes',
        });
      } catch (tableErr) {
        console.error(`Error fetching stats for table "${tableName}":`, tableErr.message);
        tableStats.push({
          table_name: tableName,
          row_count: 0,
          size_bytes: 0,
          total_size: 'Error',
        });
      }
    }

    // Sort by size descending
    tableStats.sort((a, b) => b.size_bytes - a.size_bytes);

    return {
      success: true,
      data: tableStats,
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
