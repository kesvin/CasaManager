#!/usr/bin/env node
import bcrypt from 'bcryptjs'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

// load .env.local if present (so the script works when env vars are stored there)
try{
  const envPath = new URL('../.env.local', import.meta.url)
  const envRaw = fs.readFileSync(envPath, 'utf8')
  envRaw.split(/\r?\n/).forEach(line => {
    const t = line.trim()
    if(!t || t.startsWith('#')) return
    const i = t.indexOf('=')
    if(i === -1) return
    const k = t.slice(0,i)
    let v = t.slice(i+1)
    if(v.startsWith('"') && v.endsWith('"')) v = v.slice(1,-1)
    if(v.startsWith("'") && v.endsWith("'")) v = v.slice(1,-1)
    process.env[k] = v
  })
}catch(e){}

// import DB helper after loading env so it picks up DATABASE_URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY){
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(2)
}
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function ensureTable(){
  // Ensure table exists: try a simple select. If it errors, instruct the user to run migrations.
  try{
    await supabaseAdmin.from('app_users').select('id').limit(1)
  }catch(err){
    console.error('app_users table not found or inaccessible. Run migrations via Supabase SQL editor or run the migration scripts.')
    throw err
  }
}

function genId(){
  if(typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // fallback
  return require('uuid').v4()
}

async function upsertUser({ id, email, name, password, role='user' }){
  const hash = bcrypt.hashSync(password, 10)
  const record = { id, email: email.toLowerCase(), name, password_hash: hash, role }
  const { error } = await supabaseAdmin.from('app_users').upsert([record], { onConflict: 'email' })
  if(error) throw error
}

async function main(){
  console.log('Seeding two users: Kevin and Alba')
  await ensureTable()
  const kevinEmail = process.env.KEVIN_EMAIL || 'kevin568977@gmail.com'
  const albaEmail = process.env.ALBA_EMAIL || 'alba@example.com'
  const kevin = { id: genId(), email: kevinEmail, name: 'Kevin', password: process.env.KEVIN_PASSWORD || 'changeme-kevin', role: 'admin' }
  const alba = { id: genId(), email: albaEmail, name: 'Alba', password: process.env.ALBA_PASSWORD || 'changeme-alba', role: 'user' }
  await upsertUser(kevin)
  await upsertUser(alba)
  console.log('Seed complete. Credentials:')
  console.log(`Kevin -> ${kevin.email} / ${kevin.password}`)
  console.log(`Alba  -> ${alba.email} / ${alba.password}`)
}

main().then(()=>process.exit(0)).catch(err=>{ console.error(err); process.exit(1) })
