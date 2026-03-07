#!/usr/bin/env node
// Sync app_users.id to match Supabase Auth users' UUIDs and set password hashes.
// Usage: node maintenance/scripts/sync_app_users_with_auth.js [email1 email2 ...]

const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

function readEnvFile(p) {
  const text = fs.readFileSync(p, 'utf8')
  const lines = text.split(/\r?\n/)
  const obj = {}
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const k = line.slice(0, eq).trim()
    const v = line.slice(eq + 1)
    obj[k] = v
  }
  return obj
}

async function main(){
  const EMAILS = process.argv.slice(2)
  if (EMAILS.length === 0) {
    EMAILS.push('kevin568977@gmail.com','suarezgonzalezalba@gmail.com')
  }

  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) { console.error('.env.local not found'); process.exit(1) }
  const env = readEnvFile(envPath)
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) { console.error('Supabase env missing'); process.exit(1) }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // default password for seeded users (change if you want)
  const DEFAULT_PASSWORD = 'As125677xd@'

  try{
    const listRes = await supabaseAdmin.auth.admin.listUsers()
    if (listRes.error) throw listRes.error
    let allUsers = []
    if (!listRes.data) allUsers = []
    else if (Array.isArray(listRes.data)) allUsers = listRes.data
    else if (listRes.data.users && Array.isArray(listRes.data.users)) allUsers = listRes.data.users
    else allUsers = []

    for (const email of EMAILS) {
      let authUser = allUsers.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())
      if (!authUser) {
        console.log('Auth user not found for', email, '- creating...')
        const createRes = await supabaseAdmin.auth.admin.createUser({
          email: email.toLowerCase(),
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: null }
        })
        if (createRes.error) {
          console.error('Failed to create auth user for', email, createRes.error)
          continue
        }
        const refreshed = await supabaseAdmin.auth.admin.listUsers()
        if (!refreshed.error) {
          if (Array.isArray(refreshed.data)) allUsers = refreshed.data
          else if (refreshed.data && refreshed.data.users) allUsers = refreshed.data.users
        }
        authUser = allUsers.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || (createRes.user || createRes.data || null)
      }
      const id = authUser.id
      const name = (authUser.user_metadata && authUser.user_metadata.full_name) || (authUser.raw_user_meta_data && authUser.raw_user_meta_data.full_name) || null
      const password_hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10)

      const up = await supabaseAdmin
        .from('app_users')
        .upsert([{ id, email: email.toLowerCase(), name, password_hash }], { onConflict: 'email', returning: 'representation' })

      if (up.error) {
        console.error('Upsert error for', email, up.error)
      } else {
        console.log('Synced', email, '-> id', id)
      }
    }

    console.log('Sync complete')
    process.exit(0)
  }catch(err){
    console.error('Unexpected error', err)
    process.exit(1)
  }
}

main()
