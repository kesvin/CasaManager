import { Pool } from 'pg'

let pool

if (!global._pgPool) {
  const opts = {}
  // Support multiple common env var names for hosted Postgres (DATABASE_URL or various POSTGRES_* names)
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URI
  if (connectionString) {
    opts.connectionString = connectionString
    // Supabase requires SSL; node-postgres in serverless environments may need this
    opts.ssl = { rejectUnauthorized: false }
    try {
      global._pgPool = new Pool(opts)
    } catch (err) {
      // Pool construction rarely throws, but catch to avoid crashing the server during startup
      console.error('pg Pool construction failed:', err && err.message ? err.message : err)
      global._pgPool = null
    }
  } else {
    global._pgPool = null
  }
}

pool = global._pgPool

function dbUnavailableError() {
  const host = (process.env.DATABASE_URL || '').replace(/.*@/, '').replace(/:.*$/, '') || 'DATABASE_URL'
  return new Error(`Postgres not available (no pool). Ensure DATABASE_URL is set and reachable. Host: ${host}`)
}

export async function query(text, params) {
  if (!pool) {
    throw dbUnavailableError()
  }
  try {
    const res = await pool.query(text, params)
    return res
  } catch (err) {
    // Provide clearer logs for common network/DNS errors
    if (err && (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN' || err.code === 'ETIMEDOUT')) {
      console.error('Postgres network/DNS error:', err && err.message ? err.message : err)
    } else {
      console.error('Postgres query error:', err && err.message ? err.message : err)
    }
    throw err
  }
}

export async function getClient() {
  if (!pool) throw dbUnavailableError()
  return await pool.connect()
}
