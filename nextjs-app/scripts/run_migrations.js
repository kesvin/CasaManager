import fs from 'fs'
import path from 'path'
import { Client } from 'pg'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function run(){
  const databaseUrl = process.argv[2] || process.env.DATABASE_URL
  if(!databaseUrl){
    console.error('DATABASE_URL not set')
    process.exit(1)
  }

  const migrationsDir = path.join(__dirname, '..', 'db', 'migrations')
  if(!fs.existsSync(migrationsDir)){
    console.error('Migrations folder not found:', migrationsDir)
    process.exit(1)
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
  if(!files.length){
    console.log('No migration files found')
    return
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
  try{
    await client.connect()
    for(const file of files){
      const full = path.join(migrationsDir, file)
      const sql = fs.readFileSync(full, 'utf8')
      console.log('Running', file)
      await client.query(sql)
      console.log('Applied', file)
    }
    console.log('All migrations applied')
  }catch(err){
    console.error('Migration error:', err.message || err)
    process.exitCode = 2
  }finally{
    try{ await client.end() }catch(e){}
  }
}

run()
