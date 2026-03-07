;(async () => {
  try {
    // load env from .env.local so supabase client has the keys (simple parser, no dependency)
    const fs = await import('fs')
    let envRaw = ''
    try { envRaw = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8') } catch(e) { /* ignore */ }
    envRaw.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim()
      if(!trimmed || trimmed.startsWith('#')) return
      const eq = trimmed.indexOf('=')
      if(eq === -1) return
      const key = trimmed.slice(0, eq)
      let val = trimmed.slice(eq+1)
      // strip surrounding quotes
      if(val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
      if(val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
      process.env[key] = val
    })

    const mod = await import('../lib/supabaseServer.js')
    const { supabaseAdmin } = mod

    const payload = {
      user_id: null,
      account_id: null,
      amount: 1.23,
      description: 'test insert from script',
      category: 'test',
      metadata: {}
    }

    const { data, error } = await supabaseAdmin.from('gastos').insert(payload).select().limit(1).single()
    if(error){
      console.error('Insert error:', error)
      process.exit(1)
    }

    console.log('Inserted row:', data)
    process.exit(0)
  } catch (e) {
    console.error('Script failed:', e)
    process.exit(1)
  }
})()
