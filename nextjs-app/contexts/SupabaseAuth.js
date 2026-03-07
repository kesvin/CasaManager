'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({ user: null, session: null, loading: true })

export function SupabaseAuthProvider({ children }){
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function init(){
      // If the user was redirected from a magic link, the session
      // info may be present in the URL (#access_token=...). Try to
      // extract it using the SDK helper if available before falling
      // back to the default getSession.
      try {
        if (typeof window !== 'undefined' && window.location && window.location.hash) {
          const hash = window.location.hash
          if (hash.includes('access_token') || hash.includes('type=magiclink') || hash.includes('refresh_token')) {
            // If SDK exposes getSessionFromUrl / getSessionFromURL, use it.
            // Try SDK helper first
            if (supabase?.auth?.getSessionFromUrl) {
              const result = await supabase.auth.getSessionFromUrl()
              if (!mounted) return
              if (result?.data?.session) {
                setSession(result.data.session)
                setUser(result.data.session.user || null)
                setLoading(false)
                try { window.location.hash = '' } catch (e) {}
                return
              }
            }

            // If SDK helper is not available or didn't return a session,
            // parse tokens from the hash and set the session manually.
            try {
              const params = Object.fromEntries(new URLSearchParams(hash.replace(/^#/,'')))
              const access_token = params.access_token
              const refresh_token = params.refresh_token
              if (access_token && refresh_token && supabase?.auth?.setSession) {
                await supabase.auth.setSession({ access_token, refresh_token })
                const { data } = await supabase.auth.getSession()
                if (!mounted) return
                setSession(data.session || null)
                setUser(data.session?.user || null)
                setLoading(false)
                try { window.location.hash = '' } catch (e) {}
                return
              }
            } catch (e) {
              // ignore parsing errors and continue
            }
          }
        }
      } catch (e) {
        // ignore and continue to default session fetch
        // console.warn('getSessionFromUrl failed', e)
      }

      const { data } = await supabase.auth.getSession()
      if(!mounted) return
      setSession(data.session || null)
      setUser(data.session?.user || null)
      setLoading(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null)
      setUser(newSession?.user || null)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSupabaseAuth(){
  return useContext(AuthContext)
}
