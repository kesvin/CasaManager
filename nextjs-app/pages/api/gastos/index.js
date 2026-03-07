'use strict'

import { getUserFromReq } from '../../../lib/auth'
import { supabaseAdmin } from '../../../lib/supabaseServer'

export default async function handler(req, res){
  try{
    if(req.method === 'GET'){
      const user = await getUserFromReq(req)
      if(!user) return res.status(401).json({ error: 'Unauthorized' })

      const { data, error } = await supabaseAdmin
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200)

      if(error) throw error
      return res.status(200).json({ data })
    }

    if(req.method === 'POST'){
      const { account_id, amount, description, category, metadata } = req.body || {}
      if(!amount) return res.status(400).json({ error: 'amount required' })

      const user = await getUserFromReq(req)
      if(!user) return res.status(401).json({ error: 'Unauthorized' })

      const payload = {
        user_id: user.id,
        account_id: account_id || null,
        amount,
        description: description || null,
        category: category || null,
        metadata: metadata || null
      }

      const { data, error } = await supabaseAdmin.from('gastos').insert(payload).select().limit(1).single()
      if(error) throw error
      return res.status(201).json({ data })
    }

    res.setHeader('Allow', 'GET,POST')
    return res.status(405).end('Method Not Allowed')
  }catch(err){
    console.error(err)
    return res.status(500).json({ error: err.message || 'internal' })
  }
}
