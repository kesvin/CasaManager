 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function ResetPasswordPage(){
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(()=>{
    if(!router.isReady) return
    const t = router.query.token || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('token'))
    if(t) setToken(String(t))
  }, [router.isReady, router.query])

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    if(!token) return setError('Falta token de restablecimiento')
    if(password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres')
    if(password !== confirm) return setError('Las contraseñas no coinciden')
    setLoading(true)
    try{
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const body = await res.json()
      if(!res.ok) {
        setError(body?.error || 'Error al restablecer')
        setLoading(false)
        return
      }
      setSuccess(true)
      setLoading(false)
    }catch(err){
      console.error(err)
      setError('Error de red')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => {
      router.push('/')
    }, 2200)
    return () => clearTimeout(t)
  }, [success, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-black/40 backdrop-blur-md rounded-2xl border border-[var(--border)] p-6">
        <h2 className="text-xl font-bold text-white mb-2">Restablecer contraseña</h2>
        {!success ? (
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-[var(--muted)] mb-4">Introduce tu nueva contraseña para completar el restablecimiento.</p>
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Nueva contraseña" type="password" className="w-full px-3 py-2 rounded bg-black/60 border border-[var(--border)] text-white mb-3" />
            <input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirmar contraseña" type="password" className="w-full px-3 py-2 rounded bg-black/60 border border-[var(--border)] text-white mb-3" />
            {error && <div className="text-sm text-red-400 mb-3">{error}</div>}
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 py-2 rounded bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold">{loading ? 'Restableciendo...' : 'Restablecer contraseña'}</button>
              <Link href="/" className="px-4 py-2 rounded border border-[var(--border)] text-white inline-flex items-center">Cancelar</Link>
            </div>
          </form>
        ) : (
          <div>
            <div className="text-green-300 mb-3">Contraseña restablecida correctamente.</div>
            <Link href="/" className="inline-block px-4 py-2 rounded bg-gradient-to-r from-red-600 to-pink-600 text-white">Ir al inicio</Link>
          </div>
        )}
      </div>
    </div>
  )
}
