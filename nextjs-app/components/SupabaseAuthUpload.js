'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SupabaseAuthUpload(){
  const [email, setEmail] = useState('')
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')

  const supabaseAuthAvailable = Boolean(supabase && supabase.auth && typeof supabase.auth.signInWithOtp === 'function')

  if (!supabaseAuthAvailable) {
    return (
      <div style={{maxWidth:640}}>
        <h3>Login (Supabase)</h3>
        <p style={{color:'#e11d48'}}>El cliente de Supabase no está disponible en este entorno.</p>
        <p>Para usar el inicio de sesión mágico añade las variables de entorno <strong>NEXT_PUBLIC_SUPABASE_URL</strong> y <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> en <strong>.env.local</strong> y reinicia el servidor de desarrollo.</p>
        <p>También puedes probar con el componente de ejemplo si cargas las claves en el entorno del navegador.</p>
      </div>
    )
  }

  async function sendMagicLink(e){
    e.preventDefault()
    setMessage('Enviando enlace...')
    // Ensure redirect returns to the same origin where the user requested the login
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
    let resp
    try {
      resp = await supabase.auth.signInWithOtp({ email }, { redirectTo })
    } catch (err) {
      // Fallback for older/newer SDK signatures
      resp = await supabase.auth.signInWithOtp({ email })
    }
    const { error } = resp || {}
    if (error) setMessage(error.message)
    else setMessage('Revisa tu correo para iniciar sesión.')
  }

  async function handleUpload(e){
    e.preventDefault()
    if(!file){ setMessage('Selecciona un fichero'); return }
    setMessage('Subiendo...')
    const filePath = `documents/${Date.now()}_${file.name}`

    const { data, error } = await supabase.storage.from('documents').upload(filePath, file)
    if (error){ setMessage(error.message); return }

    const { data: pub } = supabase.storage.from('documents').getPublicUrl(filePath)
    setMessage('Subido: ' + (pub?.publicUrl || filePath))
  }

  return (
    <div style={{maxWidth:640}}>
      <h3>Login (Supabase)</h3>
      <form onSubmit={sendMagicLink} style={{display:'flex',gap:8,flexDirection:'column'}}>
        <input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Enviar enlace mágico</button>
      </form>

      <hr style={{margin:'16px 0'}} />

      <h3>Subir documento</h3>
      <form onSubmit={handleUpload} style={{display:'flex',gap:8,flexDirection:'column'}}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit">Subir</button>
      </form>

      {message && <p style={{marginTop:12}}>{message}</p>}
    </div>
  )
}
