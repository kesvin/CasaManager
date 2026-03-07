#!/usr/bin/env node
// Link users from Supabase Auth into app `users` table.
// Usage: node scripts/link_auth_users.js [email1 email2 ...]

const { Client } = require('pg')

const EMAILS = process.argv.slice(2)
if (EMAILS.length === 0) {
  // default to the two users you mentioned
  EMAILS.push('kevin568977@gmail.com', 'suarezgonzalezalba@gmail.com')
}

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Please set DATABASE_URL env var (e.g. in .env.local)')
  process.exit(2)
}

const SQL = `
INSERT INTO users (id, email, full_name, metadata, created_at)
SELECT u.id, u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.user_metadata->>'full_name', '') AS full_name,
  COALESCE(u.raw_user_meta_data, u.user_metadata) AS metadata,
  now()
FROM auth.users u
WHERE u.email = ANY($1::text[])
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  metadata = EXCLUDED.metadata;
`

async function main(){
  const client = new Client({ connectionString: DATABASE_URL })
  try{
    await client.connect()
    console.log('Syncing users for:', EMAILS.join(', '))
    const res = await client.query(SQL, [EMAILS])
    console.log('Sync completed.')
  }catch(err){
    console.error('Error syncing users:')
    console.error(err && err.message ? err.message : err)
    process.exit(1)
  }finally{
    await client.end()
  }
}

main()
