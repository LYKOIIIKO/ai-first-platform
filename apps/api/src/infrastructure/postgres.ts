import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { postgresSettings } from './settings';

export function createPostgresProbe(timeout: number) {
  const pool = new Pool({
    ...postgresSettings(),
    connectionTimeoutMillis: timeout,
    statement_timeout: timeout,
    query_timeout: timeout,
  });
  pool.on('error', () => {});
  const database = drizzle(pool);
  return {
    async check() {
      await database.execute(sql`SELECT 1`);
    },
    close: () => pool.end(),
  };
}
