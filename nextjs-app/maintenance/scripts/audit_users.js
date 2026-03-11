#!/usr/bin/env node
// Non-destructive audit: compare Supabase Auth users, `app_users` and `users` tables.
// Usage: node maintenance/scripts/audit_users.js
// Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

function readEnvFile(p) {
  if (!fs.existsSync(p)) return {}
  const text = fs.readFileSync(p, 'utf8')
  const lines = text.split(/\r?\n/)
  const obj = {}
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const k = line.slice(0, eq).trim()
    const v = line.slice(eq + 1).trim()
    obj[k] = v
  }
  return obj
}

async function main(){
  const envPath = path.join(process.cwd(), '.env.local')
  const env = readEnvFile(envPath)
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY){
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local or environment and re-run.')
    process.exit(1)
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try{
    console.log('Fetching auth users...')
    const listRes = await supabaseAdmin.auth.admin.listUsers()
    if (listRes.error) throw listRes.error

    let authUsers = []
    if (!listRes.data) authUsers = []
    else if (Array.isArray(listRes.data)) authUsers = listRes.data
    else if (listRes.data.users && Array.isArray(listRes.data.users)) authUsers = listRes.data.users

    console.log('Fetching app_users...')
    const { data: appUsers, error: appErr } = await supabaseAdmin.from('app_users').select('id,email,name')
    if (appErr) throw appErr

    console.log('Fetching users table...')
    const { data: usersTable, error: usersErr } = await supabaseAdmin.from('users').select('id,email,full_name')
    if (usersErr) throw usersErr

    const authByEmail = new Map()
    const authById = new Map()
    for (const u of authUsers){
      const email = (u.email || '').toLowerCase()
      if (email) authByEmail.set(email, u)
      if (u.id) authById.set(u.id, u)
    }

    const appByEmail = new Map()
    const appById = new Map()
    for (const a of (appUsers || [])){
      if (a.email) appByEmail.set((a.email||'').toLowerCase(), a)
      if (a.id) appById.set(a.id, a)
    }

    const usersByEmail = new Map()
    const usersById = new Map()
    for (const r of (usersTable || [])){
      if (r.email) usersByEmail.set((r.email||'').toLowerCase(), r)
      if (r.id) usersById.set(r.id, r)
    }

    // Compute diffs
    const authWithoutApp = []
    for (const u of authUsers){
      const email = (u.email||'').toLowerCase()
      if (!appByEmail.has(email) && !appById.has(u.id)) authWithoutApp.push({ id: u.id, email })
    }

    const appWithoutAuth = []
    for (const a of (appUsers || [])){
      const email = (a.email||'').toLowerCase()
      if (!authByEmail.has(email) && !authById.has(a.id)) appWithoutAuth.push(a)
    }

    const usersWithoutAuth = []
    for (const r of (usersTable || [])){
      const email = (r.email||'').toLowerCase()
      if (!authByEmail.has(email) && !authById.has(r.id)) usersWithoutAuth.push(r)
    }

    console.log('\nSummary:')
    console.log('  auth.users count:', authUsers.length)
    console.log('  app_users count:', (appUsers || []).length)
    console.log('  users table count:', (usersTable || []).length)

    console.log('\nAuth users without corresponding app_users: ', authWithoutApp.length)
    if (authWithoutApp.length) console.log('  Examples:', authWithoutApp.slice(0,10))

    console.log('\napp_users without corresponding auth.user: ', appWithoutAuth.length)
    if (appWithoutAuth.length) console.log('  Examples:', appWithoutAuth.slice(0,10))

    console.log('\nusers table rows without corresponding auth.user: ', usersWithoutAuth.length)
    if (usersWithoutAuth.length) console.log('  Examples:', usersWithoutAuth.slice(0,10))

    console.log('\nIf you want, run `node maintenance/scripts/sync_app_users_with_auth.js` to align `app_users` ids with Auth users (non-destructive for auth; will upsert app_users).')
    process.exit(0)
  }catch(e){
    console.error('Audit failed:', e && e.message ? e.message : e)
    process.exit(2)
  }
}

main()
