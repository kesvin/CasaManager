;(async () => {
  try{
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
    if(!supabaseAdmin) throw new Error('supabaseAdmin not available')

    console.log('Listing files in bucket: documents')
    const { data, error } = await supabaseAdmin.storage.from('documents').list('', { limit: 100 })
    if(error) throw error
    if(!data || data.length === 0) {
      console.log('No files found in documents bucket')
      process.exit(0)
    }
    data.forEach(f => console.log(f.name, f.id || ''))
    process.exit(0)
  }catch(e){
    console.error('Failed to list bucket:', e)
    process.exit(1)
  }
})()
