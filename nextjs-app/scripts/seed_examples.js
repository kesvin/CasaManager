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

    const { supabaseAdmin } = await import('../lib/supabaseServer.js')

    console.log('Clearing child tables...')
    // Delete in order that respects FK constraints. Use safe helper to skip missing tables.
    const toClear = ['gastos','fixed_expenses','budgets','house_documents','house_contacts','improvements','categories','cuentas','owners','users']
    const safeDelete = async (table) => {
      try{
        const { error } = await supabaseAdmin.from(table).delete().gt('created_at','1970-01-01')
        if(error) throw error
        console.log('Cleared', table)
      } catch(e){
        console.log(`Skipping clear for ${table}: ${e.message}`)
      }
    }
    for(const t of toClear) await safeDelete(t)

    console.log('Inserting sample users...')
    const users = []
    for(let i=1;i<=5;i++) users.push({ email: `demo${i}@example.com`, full_name: `Demo User ${i}`, role: 'member' })
    let res
    try{
      res = await supabaseAdmin.from('users').insert(users).select()
      if(res.error) throw res.error
    } catch(e){
      console.log('Skipping users insert:', e.message)
      res = { data: [] }
    }
    const insertedUsers = res.data || []

    console.log('Inserting sample cuentas...')
    const cuentas = []
    for(let i=1;i<=5;i++) cuentas.push({ name: `Caja ${i}`, type: i%2? 'cash':'bank', balance: (100*i).toFixed(2) })
    try{
      res = await supabaseAdmin.from('cuentas').insert(cuentas).select()
      if(res.error) throw res.error
    } catch(e){
      console.log('Skipping cuentas insert:', e.message)
      res = { data: [] }
    }
    const insertedCuentas = res.data || []

    console.log('Inserting sample owners...')
    const owners = []
    for(let i=1;i<=5;i++) owners.push({ name: `Owner ${i}`, icon: 'user', monthly_income: (1000*i).toFixed(2) })
    try{
      res = await supabaseAdmin.from('owners').insert(owners).select()
      if(res.error) throw res.error
    } catch(e){
      console.log('Skipping owners insert:', e.message)
      res = { data: [] }
    }
    const insertedOwners = res.data || []

    console.log('Inserting sample categories...')
    const categories = []
    const catNames = ['Groceries','Utilities','Rent','Transport','Misc']
    for(let i=0;i<5;i++) categories.push({ name: catNames[i] })
    try{
      res = await supabaseAdmin.from('categories').insert(categories).select()
      if(res.error) throw res.error
    } catch(e){
      console.log('Skipping categories insert:', e.message)
      res = { data: [] }
    }
    const insertedCategories = res.data || []

    console.log('Inserting sample budgets...')
    try{
      const budgets = insertedOwners.map(o => ({ owner_id: o.id, amount: 500.00 }))
      res = await supabaseAdmin.from('budgets').insert(budgets).select()
      if(res.error) throw res.error
    } catch(e){
      console.log('Skipping budgets insert:', e.message)
    }

    console.log('Inserting sample fixed_expenses...')
    try{
      const fixed = []
      for(let i=0;i<5;i++){
        fixed.push({
          name: `Fixed ${i+1}`,
          amount: (50*(i+1)).toFixed(2),
          day: (i%28)+1,
          account_id: insertedCuentas[i % insertedCuentas.length]?.id || null,
          owner_id: insertedOwners[i % insertedOwners.length]?.id || null,
          category_id: insertedCategories[i % insertedCategories.length]?.id || null,
          active: true
        })
      }
      res = await supabaseAdmin.from('fixed_expenses').insert(fixed).select()
      if(res.error) throw res.error
    } catch(e){
      console.log('Skipping fixed_expenses insert:', e.message)
    }

    console.log('Inserting sample improvements...')
    const improvements = []
    for(let i=1;i<=5;i++) improvements.push({ title: `Improvement ${i}`, estimated_cost: (200*i).toFixed(2) })
    try{
      res = await supabaseAdmin.from('improvements').insert(improvements).select()
      if(res.error) throw res.error
    } catch(e){
      console.log('Skipping improvements insert:', e.message)
      res = { data: [] }
    }

    console.log('Inserting sample house_contacts...')
    const contacts = []
    for(let i=1;i<=5;i++) contacts.push({ name: `Contact ${i}`, company: `Company ${i}`, phone: `+60000000${i}`, description: `Service ${i}` })
    try{
      res = await supabaseAdmin.from('house_contacts').insert(contacts).select()
      if(res.error) throw res.error
    } catch(e){
      console.log('Skipping house_contacts insert:', e.message)
      res = { data: [] }
    }

    console.log('Inserting sample house_documents...')
    const docs = []
    for(let i=1;i<=5;i++) docs.push({ title: `Doc ${i}`, kind: 'invoice', file_name: `doc${i}.pdf`, file_type: 'application/pdf', file_size: 12345, file_url: null })
    try{
      res = await supabaseAdmin.from('house_documents').insert(docs).select()
      if(res.error) throw res.error
    } catch(e){
      console.log('Skipping house_documents insert:', e.message)
      res = { data: [] }
    }

    console.log('Inserting sample gastos...')
    const gastos = []
    for(let i=0;i<5;i++){
      const uid = (insertedUsers && insertedUsers.length) ? insertedUsers[i % insertedUsers.length].id : null
      const aid = (insertedCuentas && insertedCuentas.length) ? insertedCuentas[i % insertedCuentas.length].id : null
      const cat = (insertedCategories && insertedCategories.length) ? insertedCategories[i % insertedCategories.length].name : null
      gastos.push({
        user_id: uid,
        account_id: aid,
        amount: (10*(i+1)).toFixed(2),
        description: `Sample gasto ${i+1}`,
        category: cat,
        metadata: { example: true }
      })
    }
    try{
      res = await supabaseAdmin.from('gastos').insert(gastos).select()
      if(res.error) throw res.error
    } catch(e){
      console.log('Skipping gastos insert:', e.message)
    }

    console.log('Seeding complete.')
    process.exit(0)
  } catch (e) {
    console.error('Seeding failed:', e)
    process.exit(1)
  }
})()
