// Usage: node scripts/import_local_state.js path/to/export.json
;(async () => {
  try{
    const fs = await import('fs')
    const path = process.argv[2]
    if(!path) throw new Error('Provide path to exported JSON file from localStorage')

    // load env
    let envRaw = ''
    try { envRaw = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8') } catch(e) {}
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
    const raw = fs.readFileSync(path, 'utf8')
    const data = JSON.parse(raw)

    // insert accounts (cuentas)
    if(Array.isArray(data.accounts)){
      for(const a of data.accounts){
        await supabaseAdmin.from('cuentas').upsert({ id: a.id || undefined, name: a.name, type: a.type || 'unknown', balance: a.balance || 0 })
      }
    }

    // owners
    if(Array.isArray(data.owners)){
      for(const o of data.owners){
        await supabaseAdmin.from('owners').upsert({ id: o.id || undefined, name: o.name, icon: o.icon || 'male', monthly_income: o.monthly_income || 0 })
      }
    }

    // categories
    if(Array.isArray(data.categories)){
      for(const c of data.categories){
        await supabaseAdmin.from('categories').upsert({ id: c.id || undefined, name: c.name })
      }
    }

    // budgets
    if(Array.isArray(data.budgets)){
      for(const b of data.budgets){
        await supabaseAdmin.from('budgets').upsert({ owner_id: b.owner_id, amount: b.amount || 0 })
      }
    }

    // fixedExpenses
    if(Array.isArray(data.fixedExpenses)){
      for(const f of data.fixedExpenses){
        await supabaseAdmin.from('fixed_expenses').upsert({ id: f.id || undefined, name: f.name, amount: f.amount || 0, day: f.day || 1, account_id: f.account_id || null, owner_id: f.owner_id || null, category_id: f.category_id || null, active: f.active !== false })
      }
    }

    // improvements
    if(Array.isArray(data.improvements)){
      for(const i of data.improvements){
        await supabaseAdmin.from('improvements').upsert({ id: i.id || undefined, title: i.title, estimated_cost: i.estimated_cost || 0 })
      }
    }

    // house contacts
    if(Array.isArray(data.houseContacts)){
      for(const c of data.houseContacts){
        await supabaseAdmin.from('house_contacts').upsert({ id: c.id || undefined, name: c.name, company: c.company, phone: c.phone, description: c.description })
      }
    }

    // house documents: if file_data_url is a data URL, upload to storage and save file_url
    if(Array.isArray(data.houseDocuments)){
      for(const d of data.houseDocuments){
        let file_url = d.file_data_url || null
        if(file_url && String(file_url).startsWith('data:')){
          // extract base64
          const base64 = String(file_url).split(',')[1]
          if(base64){
            const buffer = Buffer.from(base64, 'base64')
            const safeName = (d.file_name || 'file').replace(/[^a-zA-Z0-9_.-]/g, '_')
            const filePath = `${d.id || Date.now()}_${safeName}`
            const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage.from('documents').upload(filePath, buffer, { contentType: d.file_type || 'application/octet-stream' })
            if(uploadErr) console.error('Upload error for', d.file_name, uploadErr)
            else {
              const { data: publicData } = supabaseAdmin.storage.from('documents').getPublicUrl(filePath)
              file_url = publicData?.publicUrl || null
            }
          }
        }
        await supabaseAdmin.from('house_documents').upsert({ id: d.id || undefined, title: d.title, kind: d.kind, estimated_cost: d.estimated_cost || 0, contact_name: d.contact_name, contact_phone: d.contact_phone, company: d.company, notes: d.notes, file_name: d.file_name, file_type: d.file_type, file_size: d.file_size || 0, file_url })
      }
    }

    // expenses -> insert into gastos (user_id left null)
    if(Array.isArray(data.expenses)){
      for(const e of data.expenses){
        await supabaseAdmin.from('gastos').insert({ user_id: null, account_id: e.account_id || null, amount: e.amount || 0, description: e.description || null, category: e.category_id || null, metadata: null })
      }
    }

    console.log('Import complete')
    process.exit(0)
  }catch(e){
    console.error('Import failed:', e)
    process.exit(1)
  }
})()
