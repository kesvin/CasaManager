import { useState } from 'react'
import RegisterModal from './RegisterModal'
import ForgotPasswordModal from './ForgotPasswordModal'

export default function LoginPanel({ onSuccess }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const body = await res.json()
      if(!res.ok) {
        setError(body?.error || 'Credenciales inválidas')
        setLoading(false)
        return
      }

      // If parent provided an onSuccess handler, call it with the verified user
      if (typeof onSuccess === 'function') {
        try {
          const me = await fetch('/api/auth/me', { credentials: 'include' })
            .then(r => r.json())
            .catch(() => null)
          if (me && me.ok && me.user) onSuccess(me.user)
          // notify other client components that session state changed
          try{ window.dispatchEvent(new Event('casamanager:session-changed')) }catch(e){}
        } catch (e) {
          console.error('failed to fetch /api/auth/me after login', e)
        }
        setLoading(false)
        return
      }

      // Default behaviour for pages that expect a redirect
      window.location.href = '/dashboard'
    }catch(err){
      console.error(err)
      setError('Error de red')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 rounded-2xl border border-[var(--border)] shadow-[0_12px_30px_rgba(0,0,0,0.6)] bg-black/40 backdrop-blur-md" style={{ borderLeft: '1px solid var(--border)' }}>
      <form onSubmit={handleSubmit} className="w-full">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Iniciar sesión</h3>
        <p className="text-sm text-[var(--muted)] mb-4">Accede a tu cuenta de CasaManager</p>

        <label className="block text-sm text-[var(--muted)] mb-2">Correo electrónico</label>
        <input
          value={email}
          onChange={e=>setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-black/60 border border-[var(--border)] text-white"
          placeholder="tu@correo.com"
        />

        <label className="block text-sm text-[var(--muted)] mb-2">Contraseña</label>
        <div className="relative mb-3">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={e=>setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-black/60 border border-[var(--border)] text-white"
            placeholder="Contraseña"
          />
          <button type="button" onClick={()=>setShow(s=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">{show ? 'Ocultar' : 'Mostrar'}</button>
        </div>

        {error && <div className="text-sm text-red-400 mb-3">{error}</div>}

        <button
          disabled={loading}
          className="w-full py-2.5 rounded-full font-semibold text-red-50 border border-[var(--border)] shadow-[0_8px_22px_rgba(227,20,103,0.42)] inline-flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(90deg, rgb(199 21 45), rgb(227 20 103))' }}
        >
          {loading ? (
            'Iniciando sesión...'
          ) : (
            <>
              Iniciar sesión
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: 'rgba(255,255,255,0.95)' }}>
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <div className="mt-3 text-center text-sm text-[var(--muted)]">Nuevo en CasaManager? <button type="button" onClick={()=>setRegisterOpen(true)} className="text-white font-semibold">Crear cuenta</button></div>
        <div className="mt-2 text-center text-sm text-[var(--muted)]"><button type="button" onClick={()=>setForgotOpen(true)} className="text-[var(--muted)] underline">¿Olvidaste tu contraseña?</button></div>
      </form>
      <RegisterModal open={registerOpen} onOpenChange={setRegisterOpen} onSuccess={onSuccess} />
      <ForgotPasswordModal open={forgotOpen} onOpenChange={setForgotOpen} />
    </div>
  )
}
