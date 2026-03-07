import { supabaseAdmin } from '../../lib/supabaseServer'

export default async function handler(req, res){
  try{
    // load server-side state from Postgres
    const [{ data: accounts }, { data: owners }, { data: categories }, { data: budgets }, { data: fixedExpenses }, { data: improvements }, { data: houseDocuments }, { data: houseContacts }, { data: gastos }] = await Promise.all([
      supabaseAdmin.from('cuentas').select('*'),
      supabaseAdmin.from('owners').select('*'),
      supabaseAdmin.from('categories').select('*'),
      supabaseAdmin.from('budgets').select('*'),
      supabaseAdmin.from('fixed_expenses').select('*'),
      supabaseAdmin.from('improvements').select('*'),
      supabaseAdmin.from('house_documents').select('*'),
      supabaseAdmin.from('house_contacts').select('*'),
      supabaseAdmin.from('gastos').select('*')
    ])

    // normalize shapes to match client defaultData() expectations
    const state = {
      accounts: (accounts || []).map(a => ({ id: a.id, name: a.name, type: a.type || 'unknown', balance: a.balance || 0 })),
      owners: (owners || []).map(o => ({ id: o.id, name: o.name, icon: o.icon || 'male', monthly_income: Number(o.monthly_income || 0) })),
      categories: (categories || []).map(c => ({ id: c.id, name: c.name })),
      budgets: (budgets || []).map(b => ({ owner_id: b.owner_id, amount: Number(b.amount || 0) })),
      fixedExpenses: (fixedExpenses || []).map(f => ({ id: f.id, name: f.name, amount: Number(f.amount || 0), day: f.day, account_id: f.account_id, owner_id: f.owner_id, category_id: f.category_id, active: f.active })),
      improvements: (improvements || []).map(i => ({ id: i.id, title: i.title, estimated_cost: Number(i.estimated_cost || 0) })),
      houseDocuments: (houseDocuments || []).map(d => ({ id: d.id, title: d.title, kind: d.kind, estimated_cost: Number(d.estimated_cost || 0), contact_name: d.contact_name, contact_phone: d.contact_phone, company: d.company, notes: d.notes, file_name: d.file_name, file_type: d.file_type, file_size: Number(d.file_size || 0), file_data_url: d.file_url, created_at: d.created_at })),
      houseContacts: (houseContacts || []).map(c => ({ id: c.id, name: c.name, company: c.company, phone: c.phone, description: c.description, created_at: c.created_at })),
      expenses: (gastos || []).map(g => ({ id: g.id, account_id: g.account_id, owner_id: g.user_id, category_id: g.category, amount: Number(g.amount), date: g.created_at ? String(g.created_at).slice(0,10) : null, description: g.description }))
    }

    return res.status(200).json(state)
  }catch(err){
    console.error(err)
    return res.status(500).json({ error: err.message || 'internal' })
  }
}
