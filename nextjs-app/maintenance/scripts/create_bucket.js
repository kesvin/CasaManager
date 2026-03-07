const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

function readEnv(filePath) {
  const txt = fs.readFileSync(filePath, 'utf8')
  const lines = txt.split(/\r?\n/)
  const env = {}
  for (const line of lines) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

async function run(){
  const repoRoot = path.join(__dirname, '..', '..')
  const envPath = path.join(repoRoot, '.env.local')
  if (!fs.existsSync(envPath)){
    console.error('.env.local not found at', envPath)
    process.exit(1)
  }

  const env = readEnv(envPath)
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key){
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabaseAdmin = createClient(url, key)
  try {
    const { data, error } = await supabaseAdmin.storage.createBucket('documents', { public: true })
    if (error) {
      console.error('createBucket error:', error)
      process.exit(1)
    }
    console.log('Bucket created:', data)
  } catch (e) {
    console.error('Unexpected error:', e.message || e)
    process.exit(1)
  }
}

run()
