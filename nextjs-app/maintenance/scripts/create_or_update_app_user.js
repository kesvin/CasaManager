#!/usr/bin/env node
// Usage: node maintenance/scripts/create_or_update_app_user.js email password "Full Name"
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
  const [,, email, password, name] = process.argv
  if (!email || !password) {
    console.error('Usage: node maintenance/scripts/create_or_update_app_user.js email password "Full Name"')
    process.exit(2)
  }

  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found in project root')
    process.exit(1)
  }
  const env = readEnvFile(envPath)
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase URL or service role key missing in .env.local')
    process.exit(1)
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const password_hash = bcrypt.hashSync(password, 10)

  try{
    const up = await supabaseAdmin
      .from('app_users')
      .upsert([{ email: email.toLowerCase(), name: name || null, password_hash }], { onConflict: 'email', returning: 'representation' })

    if (up.error) {
      console.error('Upsert error', up.error)
      process.exit(1)
    }
    console.log('Upsert OK. Rows:', up.data && up.data.length)
    process.exit(0)
  }catch(err){
    console.error('Unexpected error', err)
    process.exit(1)
  }
}

main()
