import { supabaseAdmin } from '../../lib/supabaseServer'

// Temporary diagnostic keepalive endpoint.
// Returns env presence and any error encountered when accessing Supabase.
export default async function handler(req, res) {
  const envs = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ ok: false, message: 'Missing SUPABASE_SERVICE_ROLE_KEY', envs })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ ok: false, message: 'supabaseAdmin not configured (lib import)', envs })
  }

  try {
    // lightweight query to register activity
    const { data, error } = await supabaseAdmin.from('users').select('id').limit(1)
    if (error) {
      // don't leak sensitive info; return error message
      return res.status(500).json({ ok: false, message: 'Supabase query error', detail: String(error.message || error), envs })
    }

    return res.status(200).json({ ok: true, rows: Array.isArray(data) ? data.length : 0, envs })
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Unexpected exception', detail: String(e.message || e), envs })
  }
}
