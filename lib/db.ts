import { Pool, type PoolClient } from 'pg'

let pool: Pool | undefined
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured')
  const url = new URL(process.env.DATABASE_URL)
  if (url.hostname.endsWith('.neon.tech')) url.searchParams.set('sslmode', 'verify-full')
  return pool ??= new Pool({ connectionString: url.toString(), max: 4, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000, statement_timeout: 15000 })
}

export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try { await client.query('BEGIN'); const result = await work(client); await client.query('COMMIT'); return result }
  catch (error) { await client.query('ROLLBACK'); throw error }
  finally { client.release() }
}
