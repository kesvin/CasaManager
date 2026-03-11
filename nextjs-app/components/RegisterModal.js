"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function RegisterModal({ open, onOpenChange, onSuccess }){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function close(){
    onOpenChange && onOpenChange(false)
  }

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    if(!email || !password || !name){
      setError('Completa todos los campos')
      return
    }
    if(password !== confirm){
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try{
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const body = await res.json()
      if(!res.ok) {
        setError(body?.error || 'Error al registrarse')
        setLoading(false)
        return
      }
      // Successfully registered and session cookie set; notify parent and close modal
      try {
        if (typeof onSuccess === 'function') {
          const me = await fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()).catch(() => null)
          if (me && me.ok && me.user) onSuccess(me.user)
        }
      } catch (e) {
        // ignore
      }
      onOpenChange && onOpenChange(false)
    }catch(err){
      setError('Error al registrarse')
    }finally{
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear cuenta</DialogTitle>
          <div className="text-sm text-[var(--muted)]">Regístrate para usar CasaManager</div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-[var(--muted)]">Nombre</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--muted)]">Contraseña</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)]">Repetir</label>
              <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" />
            </div>
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>Cancelar</Button>
            <Button type="submit" variant="success" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
