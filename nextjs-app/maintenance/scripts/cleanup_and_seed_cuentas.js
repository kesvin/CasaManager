#!/usr/bin/env node
// maintenance/scripts/cleanup_and_seed_cuentas.js
// Deletes Caja 1..Caja 5, inserts Efectivo and Tarjeta if missing

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
    const toDelete = ['Caja 1','Caja 2','Caja 3','Caja 4','Caja 5']
    console.log('Deleting rows with names:', toDelete)
    const del = await supabaseAdmin.from('cuentas').delete().in('name', toDelete)
    if(del.error) throw del.error
    console.log('Deleted rows result:', del.data || [])

    // Ensure Efectivo and Tarjeta exist
    const required = [
      { name: 'Efectivo', type: 'cash', balance: 0 },
      { name: 'Tarjeta', type: 'bank', balance: 0 }
    ]

    for(const r of required){
      const existing = await supabaseAdmin.from('cuentas').select('*').eq('name', r.name).limit(1)
      if(existing.error) throw existing.error
      if(existing.data && existing.data.length > 0){
        console.log(`${r.name} already exists:`, existing.data[0].id)
      }else{
        const ins = await supabaseAdmin.from('cuentas').insert([r]).select()
        if(ins.error) throw ins.error
        console.log('Inserted', r.name, ins.data && ins.data[0])
      }
    }

    // Final list
    const list = await supabaseAdmin.from('cuentas').select('*').order('created_at', { ascending: true })
    console.log('Final cuentas rows:')
    list.data.forEach((r,i)=> console.log(i+1, JSON.stringify(r)))

  }catch(err){
    console.error('Error in cleanup_and_seed_cuentas:', err)
    process.exit(1)
  }
}

main()
