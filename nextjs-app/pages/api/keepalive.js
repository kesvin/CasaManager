import { supabaseAdmin } from '../../lib/supabaseServer'

export default async function handler(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ ok: false, message: 'supabaseAdmin not configured' })

    // lightweight server-side query to register activity on Supabase
    const { data, error } = await supabaseAdmin.from('users').select('id').limit(1)
    if (error) {
      return res.status(500).json({ ok: false, error })
    }

    return res.status(200).json({ ok: true, rows: Array.isArray(data) ? data.length : 0 })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
}
