#!/usr/bin/env node
// Ensure Kevin is the only row in `owners` table

const fs = require('fs')
const path = require('path')

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
  const cwd = process.cwd()
  const envPath = path.join(cwd, '.env.local')
  if(!fs.existsSync(envPath)){
    console.error('.env.local not found — cannot modify Supabase')
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
    // Delete all owners except Kevin
    const ownersRes = await supabaseAdmin.from('owners').select('id,name')
    if (ownersRes.error) throw ownersRes.error
    const owners = ownersRes.data || []

    for (const o of owners){
      if (String(o.name).trim().toLowerCase() !== 'kevin'){
        const d = await supabaseAdmin.from('owners').delete().eq('id', o.id)
        if (d.error) console.error('Failed deleting owner', o, d.error)
        else console.log('Deleted owner', o.name)
      }
    }

    // Ensure Kevin exists
    const kevinRes = await supabaseAdmin.from('owners').select('*').ilike('name','kevin').limit(1)
    if (kevinRes.error) throw kevinRes.error
    if (!kevinRes.data || kevinRes.data.length === 0){
      const insert = await supabaseAdmin.from('owners').insert([{ name: 'Kevin', icon: 'male', monthly_income: 1500 }])
      if (insert.error) console.error('Failed to insert Kevin', insert.error)
      else console.log('Inserted Kevin into owners')
    }else{
      console.log('Kevin already present in owners')
    }

    console.log('Owners enforcement complete')
  }catch(err){
    console.error('Unexpected error', err)
    process.exit(1)
  }
}

main()
