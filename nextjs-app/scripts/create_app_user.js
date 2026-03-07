#!/usr/bin/env node
// Create an app user with bcrypt password hash in app_users table
// Usage: node scripts/create_app_user.js email password "Full Name"

const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

const [,, email, password, fullName] = process.argv
if(!email || !password){
  console.error('Usage: node scripts/create_app_user.js email password "Full Name"')
  process.exit(2)
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY){
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env (.env.local)')
  process.exit(2)
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function main(){
  const hash = await bcrypt.hash(password, 10)
  try{
    const record = { email: email.toLowerCase(), name: fullName || '', password_hash: hash, role: 'member' }
    const { data, error } = await supabaseAdmin.from('app_users').upsert([record], { onConflict: 'email' })
    if(error) throw error
    console.log('Upserted app_user:', data && data[0] ? data[0].id || data[0].email : '<unknown>')
  }catch(err){
    console.error('Error creating app_user:', err && err.message ? err.message : err)
    process.exit(1)
  }
}

main()
