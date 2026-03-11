import { useState } from 'react'

export default function ForgotPasswordModal({ open, onOpenChange }){
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  if(!open) return null

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try{
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const body = await res.json()
      if(!res.ok) return setStatus({ error: body?.error || 'Error' })

      // In development we return the token/URL to ease testing
      setStatus({ ok: true, debugToken: body?.debugToken, resetUrl: body?.resetUrl })
      setLoading(false)
    }catch(err){
      console.error(err)
      setStatus({ error: 'Error de red' })
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={()=>onOpenChange(false)} />
      <div className="relative max-w-md w-full bg-black/40 backdrop-blur-md rounded-2xl border border-[var(--border)] p-6">
        <h3 className="text-lg font-bold text-white mb-2">Recuperar contraseña</h3>
        <p className="text-sm text-[var(--muted)] mb-4">Introduce tu correo y te enviaremos instrucciones para restablecerla.</p>
        <form onSubmit={handleSubmit}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full px-3 py-2 rounded bg-black/60 border border-[var(--border)] text-white mb-3" />
          <div className="flex gap-3">
            <button type="button" onClick={()=>onOpenChange(false)} className="px-4 py-2 rounded bg-transparent border border-[var(--border)] text-white">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-gradient-to-r from-red-600 to-pink-600 text-white">Enviar</button>
          </div>
        </form>

        {status && (
          <div className="mt-3 text-sm">
            {status.error && <div className="text-red-400">{status.error}</div>}
            {status.ok && (
              <div className="text-green-300">
                Si existe la cuenta, hemos generado un enlace de restablecimiento.
                {status.debugToken && (
                  <div className="mt-2 text-xs text-[var(--muted)]">Token (dev): <code className="text-white">{status.debugToken}</code></div>
                )}
                {status.resetUrl && (
                  <div className="mt-1 text-xs text-[var(--muted)]">URL (dev): <a className="underline" href={status.resetUrl}>{status.resetUrl}</a></div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
