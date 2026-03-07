;(async () => {
  try{
    // load .env.local
    const fs = await import('fs')
    let envRaw = ''
    try { envRaw = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8') } catch(e) { /* ignore */ }
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

    const { supabaseAdmin } = await import('../lib/supabaseServer.js')
    const { createClient } = await import('@supabase/supabase-js')

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if(!url || !anon) throw new Error('Missing NEXT_PUBLIC_SUPABASE_* env vars')

    const anonClient = createClient(url, anon)

    const testEmail = `ci-test-${Date.now()}@example.com`
    const testPassword = `T3st!${Math.floor(Math.random()*9000)+1000}`

    console.log('Creating test user', testEmail)
    // create user via admin
    const createRes = await supabaseAdmin.auth.admin.createUser({ email: testEmail, password: testPassword, email_confirm: true }).catch(e=>({ error:e }))
    if(createRes?.error) {
      console.error('Failed to create user:', createRes.error)
      process.exit(1)
    }
    const user = createRes.user || createRes.data?.user || createRes

    // sign in to get access token
    console.log('Signing in as test user')
    const { data: signData, error: signErr } = await anonClient.auth.signInWithPassword({ email: testEmail, password: testPassword })
    if(signErr) {
      console.error('Sign in failed:', signErr)
      process.exit(1)
    }

    const token = signData.session?.access_token
    if(!token) { console.error('No access token'); process.exit(1) }

    console.log('Validating token and inserting gasto via supabaseAdmin')
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if(userErr){ console.error('getUser failed', userErr); process.exit(1) }
    const userObj = userData.user
    if(!userObj){ console.error('No user from token'); process.exit(1) }

    // ensure app-level users table has an entry matching the auth user (foreign key)
    console.log('Ensuring app users row for', userObj.id)
    await supabaseAdmin.from('users').upsert({ id: userObj.id, email: userObj.email, full_name: userObj.user_metadata?.full_name || null }).select()

    const payload = { user_id: userObj.id, account_id: null, amount: 9.99, description: 'API test insert', category: null }
    const { data: insertData, error: insertErr } = await supabaseAdmin.from('gastos').insert(payload).select().limit(1).single()
    if(insertErr){ console.error('Insert failed', insertErr); process.exit(1) }
    console.log('Insert succeeded:', insertData)

    // cleanup: remove test user
    try{
      // cleanup: delete app user row and auth user
      const uid = userObj.id
      if(uid){
        console.log('Deleting app user row', uid)
        await supabaseAdmin.from('users').delete().eq('id', uid)
        console.log('Deleting auth user', uid)
        await supabaseAdmin.auth.admin.deleteUser(uid)
      }
    }catch(e){ console.error('Cleanup failed:', e) }

    process.exit(0)
  }catch(e){
    console.error('Test script error:', e)
    process.exit(1)
  }
})()
