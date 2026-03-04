export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { pin } = req.body || {}
    const expected = process.env.PROTECT_ADMIN_PIN || ''

    if (!expected) return res.status(500).json({ error: 'Admin PIN not configured' })

    if (!pin || String(pin) !== String(expected)) {
      return res.status(401).json({ ok: false })
    }

    // Set a short-lived HttpOnly cookie for admin session (1 hour)
    const cookie = `admin_auth=1; Path=/; HttpOnly; Max-Age=${60 * 60}; SameSite=Lax;` + (process.env.VERCEL ? ' Secure;' : '')
    res.setHeader('Set-Cookie', cookie)
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
}
