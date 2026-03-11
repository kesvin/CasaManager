#!/usr/bin/env node
// maintenance/scripts/list_app_data.js
// Non-destructive listing of important tables for manual review

const fs = require('fs')
const path = require('path')

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
    const v = line.slice(eq + 1)
    obj[k] = v
  }
  return obj
}

async function main(){
  const cwd = process.cwd()
  const envPath = path.join(cwd, '.env.local')
  if(!fs.existsSync(envPath)){
    console.error('.env.local not found in', cwd)
    process.exit(1)
  }
  const env = readEnvFile(envPath)
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY){
    console.error('Supabase env vars missing in .env.local')
    process.exit(1)
  }

  const { createClient } = require('@supabase/supabase-js')
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try{
    console.log('Listing owners (count + first 50 rows)')
    const ownersCountRes = await supabaseAdmin.from('owners').select('id', { head: true, count: 'exact' })
    console.log('owners count:', ownersCountRes.count)
    const ownersData = await supabaseAdmin.from('owners').select('*').limit(50)
    console.log('owners sample rows:', ownersData.data || [])

    console.log('\nListing app_users (count + first 50 rows)')
    const usersCountRes = await supabaseAdmin.from('app_users').select('id', { head: true, count: 'exact' })
    console.log('app_users count:', usersCountRes.count)
    const usersData = await supabaseAdmin.from('app_users').select('*').limit(50)
    console.log('app_users sample rows:', usersData.data || [])

  }catch(err){
    console.error('Error querying Supabase', err)
    process.exit(1)
  }
}

main()
