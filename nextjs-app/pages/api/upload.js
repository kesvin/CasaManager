import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null
  if (!token) return res.status(401).json({ error: 'Missing authorization token' })

  // Validate token by asking Supabase auth for the user using an admin client if available,
  // otherwise create a temporary client with the anon key and try to get the user.
  let user = null
  try {
    // Try to use the server admin client if present
    try {
      const { supabaseAdmin } = await import('../../lib/supabaseServer')
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
      if (userData?.user) user = userData.user
    } catch (e) {
      // fallthrough
    }

    // If admin client not available or didn't return user, use anon client and ask auth
    if (!user) {
      const client = createClient(supabaseUrl, supabaseAnonKey)
      // try to set session with access token so client can act as the user
      if (client.auth?.setSession) {
        await client.auth.setSession({ access_token: token })
      } else if (client.auth?.setAuth) {
        client.auth.setAuth(token)
      }
      const { data: udata, error: uerr } = await client.auth.getUser()
      if (udata?.user) user = udata.user
    }
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (!user) return res.status(401).json({ error: 'Invalid token' })

  const { filename, contentType, base64 } = req.body || {}
  if (!filename || !base64) return res.status(400).json({ error: 'Missing filename or base64 content' })

  const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_')
  const filePath = `${user.id}/${Date.now()}_${safeName}`

  try {

    const buffer = Buffer.from(base64, 'base64')

    // Use a client scoped to the user (anon key + session) so upload uses user's identity
    const client = createClient(supabaseUrl, supabaseAnonKey)
    if (client.auth?.setSession) {
      await client.auth.setSession({ access_token: token })
    } else if (client.auth?.setAuth) {
      client.auth.setAuth(token)
    }

    const { data: uploadData, error: uploadErr } = await client.storage
      .from('documents')
      .upload(filePath, buffer, { contentType })

    if (uploadErr) return res.status(500).json({ error: uploadErr.message })

    const { data: publicData } = client.storage.from('documents').getPublicUrl(filePath)

    return res.status(200).json({ path: filePath, publicUrl: publicData?.publicUrl || null, upload: uploadData })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
