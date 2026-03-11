import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { token, password } = req.body || {}
  if(!token || !password) return res.status(400).json({ error: 'Missing fields' })
  if(typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })

  try{
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    let email = null

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      // find token in password_resets table
      const nowIso = new Date().toISOString()
      const { data: entry, error: e } = await supabaseAdmin
        .from('password_resets')
        .select('token,email,expires_at')
        .eq('token', token)
        .gt('expires_at', nowIso)
        .maybeSingle()
      if (e) throw e
      if (!entry) return res.status(400).json({ error: 'Token inválido o expirado' })
      email = entry.email

      const password_hash = await bcrypt.hash(password, 10)
      const { error: upErr } = await supabaseAdmin
        .from('app_users')
        .update({ password_hash })
        .eq('email', email.toLowerCase())
      if (upErr) throw upErr

      // remove token
      await supabaseAdmin.from('password_resets').delete().eq('token', token).catch(()=>null)
    } else {
      const tokensFile = path.join(process.cwd(), 'maintenance', 'dev_reset_tokens.json')
      let tokens = []
      try{ if (fs.existsSync(tokensFile)) tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8')) || [] }catch(e){ console.error('reading tokens', e) }

      const entryIndex = tokens.findIndex(t => t.token === token)
      if(entryIndex === -1) return res.status(400).json({ error: 'Token inválido o expirado' })
      const entry = tokens[entryIndex]
      if(Date.now() > entry.expiresAt) return res.status(400).json({ error: 'Token expirado' })

      email = entry.email

      const devFile = path.join(process.cwd(), 'maintenance', 'dev_users.json')
      let users = []
      try{ if (fs.existsSync(devFile)) users = JSON.parse(fs.readFileSync(devFile, 'utf8')) || [] }catch(e){ console.error('reading dev users', e) }
      const uidx = users.findIndex(u => u.email && u.email.toLowerCase() === email.toLowerCase())
      if(uidx === -1) return res.status(400).json({ error: 'Usuario no encontrado' })
      users[uidx].password = password
      try{ fs.writeFileSync(devFile, JSON.stringify(users, null, 2), 'utf8') }catch(e){ console.error('writing dev users', e) }

      // remove token
      tokens.splice(entryIndex, 1)
      try{ fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2), 'utf8') }catch(e){ console.error('writing tokens', e) }
    }

    return res.json({ ok: true })
  }catch(err){
    console.error('reset error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
