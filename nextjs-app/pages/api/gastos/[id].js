'use strict'

import { getUserFromReq } from '../../../lib/auth'
import { supabaseAdmin } from '../../../lib/supabaseServer'

export default async function handler(req, res){
  const { id } = req.query || {}
  try{
    if(req.method === 'GET'){
      const user = await getUserFromReq(req)
      if(!user) return res.status(401).json({ error: 'Unauthorized' })

      const { data, error } = await supabaseAdmin
        .from('gastos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if(error && error.code === 'PGRST116') return res.status(404).json({ error: 'not found' })
      if(error) throw error
      return res.status(200).json({ data })
    }

    if(req.method === 'PUT'){
      const { amount, description, category, account_id, metadata } = req.body || {}
      const user = await getUserFromReq(req)
      if(!user) return res.status(401).json({ error: 'Unauthorized' })

      const payload = {
        amount,
        description,
        category,
        account_id,
        metadata
      }

      const { data, error } = await supabaseAdmin
        .from('gastos')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if(error && error.code === 'PGRST116') return res.status(404).json({ error: 'not found' })
      if(error) throw error
      return res.status(200).json({ data })
    }

    if(req.method === 'DELETE'){
      const user = await getUserFromReq(req)
      if(!user) return res.status(401).json({ error: 'Unauthorized' })

      const { data, error } = await supabaseAdmin
        .from('gastos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id')
        .single()

      if(error && error.code === 'PGRST116') return res.status(404).json({ error: 'not found' })
      if(error) throw error
      return res.status(200).json({ success: true })
    }

    res.setHeader('Allow', 'GET,PUT,DELETE')
    return res.status(405).end('Method Not Allowed')
  }catch(err){
    console.error(err)
    return res.status(500).json({ error: err.message || 'internal' })
  }
}
