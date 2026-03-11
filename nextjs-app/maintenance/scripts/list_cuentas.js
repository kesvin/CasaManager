#!/usr/bin/env node
// maintenance/scripts/list_cuentas.js
// Lists rows in `cuentas` to inspect what's shown in /accounts

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
    const countRes = await supabaseAdmin.from('cuentas').select('id', { head: true, count: 'exact' })
    console.log('cuentas count:', countRes.count)
    const dataRes = await supabaseAdmin.from('cuentas').select('*').order('created_at', { ascending: true }).limit(200)
    if(dataRes.error) throw dataRes.error
    console.log('cuentas rows (first 200):')
    dataRes.data.forEach((r, i) => {
      console.log(i+1, JSON.stringify(r))
    })
  }catch(err){
    console.error('Error listing cuentas:', err)
    process.exit(1)
  }
}

main()
