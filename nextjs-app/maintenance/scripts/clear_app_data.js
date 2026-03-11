#!/usr/bin/env node
// maintenance/scripts/clear_app_data.js
// Clears app data in Supabase (if env configured) and resets local dev files to keep only Kevin and Alba.
// Usage: node maintenance/scripts/clear_app_data.js

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
  const keepEmails = ['kevin568977@gmail.com','suarezgonzalezalba@gmail.com']
  const keepNames = ['Kevin','Alba']

  // First: clean local maintenance files (dev_users.json, dev_reset_tokens.json)
  try{
    const usersPath = path.join(cwd, 'maintenance', 'dev_users.json')
    if (fs.existsSync(usersPath)){
      const raw = fs.readFileSync(usersPath, 'utf8')
      let users = JSON.parse(raw)
      users = users.filter(u => keepEmails.includes((u.email||'').toLowerCase()))
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8')
      console.log('Pruned', usersPath)
    }
    const tokensPath = path.join(cwd, 'maintenance', 'dev_reset_tokens.json')
    if (fs.existsSync(tokensPath)){
      fs.writeFileSync(tokensPath, JSON.stringify([], null, 2), 'utf8')
      console.log('Cleared', tokensPath)
    }
  }catch(err){ console.error('Local cleanup error', err) }

  if (!fs.existsSync(envPath)){
    console.log('.env.local not found — skipped Supabase cleanup. Run this script on a trusted host with Supabase keys to also clear the remote DB.')
    process.exit(0)
  }

  const env = readEnvFile(envPath)
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY){
    console.log('Supabase keys not set in .env.local — skipping remote cleanup.')
    process.exit(0)
  }

  const { createClient } = require('@supabase/supabase-js')
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try{
    console.log('Starting Supabase cleanup — keeping users:', keepEmails.join(', '))

    // 1) Delete all gastos (expenses)
    // Use delete() without comparing to an empty string (invalid for UUID columns)
    let res = await supabaseAdmin.from('gastos').delete()
    if (res.error) console.error('gastos delete error', res.error)
    else console.log('Deleted gastos rows')

    // 2) Delete budgets, fixed_expenses, improvements, house_documents, house_contacts, categories, cuentas
    const tables = ['budgets','fixed_expenses','improvements','house_documents','house_contacts','categories','cuentas']
    for (const t of tables){
      const r = await supabaseAdmin.from(t).delete()
      if (r.error) console.error(`${t} delete error`, r.error)
      else console.log(`Deleted ${t} rows`)
    }

    // 3) Owners: delete owners except Kevin and Alba
    const ownersRes = await supabaseAdmin.from('owners').select('id,name')
    if (ownersRes.error) console.error('owners select error', ownersRes.error)
    else {
      const owners = ownersRes.data || []
      const toDelete = owners.filter(o => !keepNames.includes(o.name))
      for (const o of toDelete){
        const d = await supabaseAdmin.from('owners').delete().eq('id', o.id)
        if (d.error) console.error('Failed deleting owner', o, d.error)
        else console.log('Deleted owner', o.name)
      }
    }

    // 4) app_users: remove rows and auth users except keepEmails
    const appUsersRes = await supabaseAdmin.from('app_users').select('id,email')
    if (appUsersRes.error) console.error('app_users select error', appUsersRes.error)
    else {
      const appUsers = appUsersRes.data || []
      for (const u of appUsers){
        if (!keepEmails.includes((u.email||'').toLowerCase())){
          // Remove auth user if exists
          try{
            const list = await supabaseAdmin.auth.admin.listUsers()
            const allAuth = Array.isArray(list.data) ? list.data : (list.data?.users || [])
            const authUser = allAuth.find(a => a.email && a.email.toLowerCase() === (u.email||'').toLowerCase())
            if (authUser){
              const delAuth = await supabaseAdmin.auth.admin.deleteUser(authUser.id)
              if (delAuth.error) console.error('Failed to delete auth user', authUser.email, delAuth.error)
              else console.log('Deleted auth user', authUser.email)
            }
          }catch(e){ console.error('Auth list/delete error', e) }

          const delApp = await supabaseAdmin.from('app_users').delete().eq('id', u.id)
          if (delApp.error) console.error('Failed to delete app_user', u.email, delApp.error)
          else console.log('Deleted app_user', u.email)
        }
      }
    }

    console.log('Supabase cleanup complete')
  }catch(err){
    console.error('Unexpected error during Supabase cleanup', err)
    process.exit(1)
  }
}

main()
