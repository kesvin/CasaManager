import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const COOKIE_NAME = 'casamanager_session'

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password } = req.body || {}
  if(!email || !password) return res.status(400).json({ error: 'Missing credentials' })

  try{
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    let user = null

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      const { data, error } = await supabaseAdmin
        .from('app_users')
        .select('id,email,name,password_hash,role')
        .eq('email', email.toLowerCase())
        .maybeSingle()
      if (error) throw error
      user = data
    } else {
      // Fallback for local development: read maintenance/dev_users.json
      try{
        const devFile = path.join(process.cwd(), 'maintenance', 'dev_users.json')
        if (fs.existsSync(devFile)){
          const raw = fs.readFileSync(devFile, 'utf8')
          const users = JSON.parse(raw)
          user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null
          // If found and stored with plaintext `password`, we'll attach password_hash as undefined
          // and do a plain compare below.
        }
      }catch(e){
        console.error('Error reading local dev users file:', e && e.message ? e.message : e)
      }
    }

    if(!user) return res.status(401).json({ error: 'Usuario no existe' })

    let valid = false
    if (user.password_hash) {
      valid = await bcrypt.compare(password, user.password_hash)
    } else if (user.password) {
      // local plaintext password stored for dev convenience
      valid = password === user.password
    }

    if(!valid) return res.status(401).json({ error: 'Credenciales inválidas' })

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role }
    let secret = process.env.SESSION_SECRET
    if(!secret){
      // Development fallback secret (only used when SESSION_SECRET not configured)
      console.warn('SESSION_SECRET not set; using development fallback secret')
      secret = 'dev_session_secret_change_me'
    }

    const token = jwt.sign(payload, secret, { expiresIn: '7d' })

    // set httpOnly cookie
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax${process.env.NODE_ENV==='production'?'; Secure':''}`)

    return res.json({ ok: true })
  }catch(err){
    console.error('login error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
