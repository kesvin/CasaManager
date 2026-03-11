#!/usr/bin/env node
// maintenance/scripts/ensure_cuenta_compartida.js
// Inserts 'CuentaCompartida' into 'cuentas' if missing and verifies 'categories' table exists

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
    // Check categories table
    const catRes = await supabaseAdmin.from('categories').select('id').limit(1)
    if(catRes.error) throw catRes.error
    console.log('categories table accessible, rows sample:', (catRes.data || []).length)

    // Check if CuentaCompartida exists
    const res = await supabaseAdmin.from('cuentas').select('*').eq('name','CuentaCompartida').limit(1)
    if(res.error) throw res.error
    if(res.data && res.data.length > 0){
      console.log('CuentaCompartida already exists with id:', res.data[0].id)
      process.exit(0)
    }

    // Insert new cuenta (provide required 'type' column)
    const insertRes = await supabaseAdmin.from('cuentas').insert([{ name: 'CuentaCompartida', type: 'shared' }]).select()
    if(insertRes.error) throw insertRes.error
    console.log('Inserted CuentaCompartida:', insertRes.data && insertRes.data[0])
  }catch(err){
    console.error('Error ensuring CuentaCompartida:', err)
    process.exit(1)
  }
}

main()
