import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function UploadToServer() {
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('')
  const [publicUrl, setPublicUrl] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setStatus('Reading file...')

    const reader = new FileReader()
    reader.onload = async () => {
      const result = reader.result
      const base64 = typeof result === 'string' ? result.split(',')[1] : null
      if (!base64) return setStatus('Failed to read file')

      setStatus('Getting session token...')
      let token = null
      try {
        if (supabase.auth?.getSession) {
          const { data } = await supabase.auth.getSession()
          token = data?.session?.access_token
        } else if (supabase.auth?.session) {
          const s = supabase.auth.session()
          token = s?.access_token || s?.accessToken
        }
      } catch (err) {
        // ignore
      }

      if (!token) return setStatus('No access token (not signed in)')

      setStatus('Uploading...')
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ filename: file.name, contentType: file.type, base64 }),
        })

        const json = await res.json()
        if (!res.ok) {
          setStatus(json?.error || 'Upload failed')
          return
        }

        setPublicUrl(json.publicUrl || null)
        setStatus('Upload successful')
      } catch (err) {
        setStatus(err.message || String(err))
      }
    }
    reader.onerror = () => setStatus('Failed to read file')
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <label style={{ display: 'block', marginBottom: 8 }}>
        Selecciona archivo
        <input type="file" onChange={handleFile} style={{ display: 'block', marginTop: 8 }} />
      </label>
      <div style={{ marginTop: 8 }}>
        <strong>Status:</strong> {status}
      </div>
      {fileName && (
        <div style={{ marginTop: 8 }}>
          <strong>File:</strong> {fileName}
        </div>
      )}
      {publicUrl && (
        <div style={{ marginTop: 8 }}>
          <a href={publicUrl} target="_blank" rel="noreferrer">Abrir archivo</a>
        </div>
      )}
    </div>
  )
}
