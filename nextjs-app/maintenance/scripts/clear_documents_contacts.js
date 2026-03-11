#!/usr/bin/env node
// Clears house_documents and house_contacts tables in Supabase

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
    console.error('.env.local not found — aborting')
    process.exit(1)
  }
  const env = readEnvFile(envPath)
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY){
    console.error('Supabase env vars missing in .env.local — aborting')
    process.exit(1)
  }

  const { createClient } = require('@supabase/supabase-js')
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try{
    console.log('Deleting rows from house_documents...')
    // Select ids first, then delete by id list to satisfy DB policies
    const docs = await supabaseAdmin.from('house_documents').select('id')
    if(docs.error) console.error('house_documents select error', docs.error)
    else if((docs.data||[]).length){
      const ids = docs.data.map(r=>r.id)
      const del = await supabaseAdmin.from('house_documents').delete().in('id', ids)
      if(del.error) console.error('house_documents delete error', del.error)
      else console.log('Deleted house_documents rows:', ids.length)
    }else{
      console.log('No house_documents rows to delete')
    }

    console.log('Deleting rows from house_contacts...')
    const contacts = await supabaseAdmin.from('house_contacts').select('id')
    if(contacts.error) console.error('house_contacts select error', contacts.error)
    else if((contacts.data||[]).length){
      const ids2 = contacts.data.map(r=>r.id)
      const del2 = await supabaseAdmin.from('house_contacts').delete().in('id', ids2)
      if(del2.error) console.error('house_contacts delete error', del2.error)
      else console.log('Deleted house_contacts rows:', ids2.length)
    }else{
      console.log('No house_contacts rows to delete')
    }

    console.log('Documents/Contacts cleanup complete')
  }catch(err){
    console.error('Unexpected error during cleanup', err)
    process.exit(1)
  }
}

main()
