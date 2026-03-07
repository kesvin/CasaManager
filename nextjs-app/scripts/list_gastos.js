;(async () => {
  try {
    // load env from .env.local
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
      if(val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
      if(val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
      process.env[key] = val
    })

    const mod = await import('../lib/supabaseServer.js')
    const { supabaseAdmin } = mod

    const { data, error } = await supabaseAdmin
      .from('gastos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if(error){
      console.error('Query error:', error)
      process.exit(1)
    }

    console.log('Found', data.length, 'gastos')
    data.forEach(r => console.log(r))
    process.exit(0)
  } catch (e) {
    console.error('Script failed:', e)
    process.exit(1)
  }
})()
