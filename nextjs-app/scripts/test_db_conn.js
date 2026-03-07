#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

function readEnv(file){
  if(!fs.existsSync(file)) return {}
  const out = {}
  for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if(!m) continue
    let v = m[2].trim()
    // strip surrounding quotes
    if((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1,-1)
    out[m[1]] = v
  }
  return out
}

const envFile = path.join(__dirname,'..','.env.local')
const env = readEnv(envFile)
const conn = env.DATABASE_URL || process.env.DATABASE_URL
if(!conn){
  console.error('No DATABASE_URL found in .env.local or env')
  process.exit(2)
}

;(async ()=>{
  const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
  try{
    await client.connect()
    console.log('Connected to database')
    const r = await client.query('SELECT NOW() as now')
    console.log('Query result:', r.rows[0])
    await client.end()
    process.exit(0)
  }catch(err){
    console.error('DB connect error:', err && err.message ? err.message : err)
    try{ await client.end() }catch(e){}
    process.exit(1)
  }
})()
