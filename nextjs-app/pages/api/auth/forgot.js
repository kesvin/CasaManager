import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email } = req.body || {}
  if(!email) return res.status(400).json({ error: 'Missing email' })

  try{
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    let user = null

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      const { data, error } = await supabaseAdmin
        .from('app_users')
        .select('id,email,name')
        .eq('email', email.toLowerCase())
        .maybeSingle()
      if (error) throw error
      user = data
    } else {
      const devFile = path.join(process.cwd(), 'maintenance', 'dev_users.json')
      let users = []
      try{ if (fs.existsSync(devFile)) users = JSON.parse(fs.readFileSync(devFile, 'utf8')) || [] }catch(e){ console.error('reading dev users', e) }
      user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null
    }

    // Always respond OK to avoid leaking whether an email exists
    if(!user){
      return res.json({ ok: true })
    }

    // generate token
    const token = crypto.randomBytes(24).toString('hex')
    const expiresAt = Date.now() + (60 * 60 * 1000) // 1h

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      // optional: delete previous tokens for this email
      await supabaseAdmin.from('password_resets').delete().eq('email', user.email).catch(() => null)
      const { error } = await supabaseAdmin.from('password_resets').insert([{ token, email: user.email, expires_at: new Date(expiresAt).toISOString() }])
      if (error) throw error
    } else {
      const tokensFile = path.join(process.cwd(), 'maintenance', 'dev_reset_tokens.json')
      let tokens = []
      try{ if (fs.existsSync(tokensFile)) tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8')) || [] }catch(e){ console.error('reading tokens', e) }
      tokens.push({ token, email: user.email, expiresAt })
      try{ fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2), 'utf8') }catch(e){ console.error('writing tokens', e) }
    }

    // In production you'd send an email with the reset link. For development, return the token so tests can use it.
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/reset-password?token=${token}`
    return res.json({ ok: true, debugToken: token, resetUrl })
  }catch(err){
    console.error('forgot error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
