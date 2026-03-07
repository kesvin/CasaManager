#!/usr/bin/env node
// Run a SQL file against DATABASE_URL
// Usage: node scripts/run_sql_file.js path/to/file.sql

const fs = require('fs')
const { Client } = require('pg')

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/run_sql_file.js path/to/file.sql')
  process.exit(2)
}

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Please set DATABASE_URL env var (e.g. in .env.local)')
  process.exit(2)
}

async function main(){
  const sql = fs.readFileSync(file, 'utf8')
  const client = new Client({ connectionString: DATABASE_URL })
  try{
    await client.connect()
    console.log('Connected, running SQL file:', file)
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('SQL file executed successfully')
  }catch(err){
    console.error('SQL execution error:')
    console.error(err && err.message ? err.message : err)
    try{ await client.query('ROLLBACK') }catch(_){}
    process.exit(1)
  }finally{
    await client.end()
  }
}

main()
