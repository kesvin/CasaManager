import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const COOKIE_NAME = 'casamanager_session'

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { name, email, password } = req.body || {}
  if(!email || !password || !name) return res.status(400).json({ error: 'Missing fields' })
  if(typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })

  try{
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    let created = null

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      // ensure email not in use
      const { data: existing, error: existsErr } = await supabaseAdmin
        .from('app_users')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle()
      if (existsErr) throw existsErr
      if (existing) return res.status(409).json({ error: 'Email ya registrado' })

      const password_hash = await bcrypt.hash(password, 10)
      const { data, error } = await supabaseAdmin
        .from('app_users')
        .insert({ email: email.toLowerCase(), name, password_hash, role: 'user' })
        .select('id,email,name,role')
        .maybeSingle()
      if (error) throw error
      created = data
    } else {
      // development fallback: write to maintenance/dev_users.json
      const devFile = path.join(process.cwd(), 'maintenance', 'dev_users.json')
      let users = []
      try{
        if (fs.existsSync(devFile)){
          users = JSON.parse(fs.readFileSync(devFile, 'utf8')) || []
        }
      }catch(e){ console.error('reading dev users', e) }

      if (users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())){
        return res.status(409).json({ error: 'Email ya registrado' })
      }

      const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
      users.push({ id, email: email.toLowerCase(), name, password, role: 'user' })
      try{ fs.writeFileSync(devFile, JSON.stringify(users, null, 2), 'utf8') }catch(e){ console.error('writing dev users', e) }
      created = { id, email: email.toLowerCase(), name, role: 'user' }
    }

    // create session token and set cookie
    const payload = { id: created.id, email: created.email, name: created.name, role: created.role }
    let secret = process.env.SESSION_SECRET
    if(!secret){
      console.warn('SESSION_SECRET not set; using development fallback secret')
      secret = 'dev_session_secret_change_me'
    }
    const token = jwt.sign(payload, secret, { expiresIn: '7d' })
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax${process.env.NODE_ENV==='production'?'; Secure':''}`)

    return res.json({ ok: true })
  }catch(err){
    console.error('signup error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
