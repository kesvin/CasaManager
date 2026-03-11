import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import Layout from '../components/Layout'
import { GastosProvider } from '../contexts/GastosContext'
import { SupabaseAuthProvider, useSupabaseAuth } from '../contexts/SupabaseAuth'
import AppLogo from '../components/AppLogo'

export default function App({ Component, pageProps }){
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(true)
  const didInitialRedirect = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1400)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if(typeof window === 'undefined') return
    if(!('serviceWorker' in navigator)) return

    navigator.serviceWorker.getRegistrations()
      .then(async registrations => {
        if(!registrations.length) return

        await Promise.all(registrations.map(registration => registration.unregister()))

        if('caches' in window){
          const keys = await caches.keys()
          await Promise.all(keys.map(key => caches.delete(key)))
        }

        if(!sessionStorage.getItem('sw-cleanup-done')){
          sessionStorage.setItem('sw-cleanup-done', '1')
          window.location.reload()
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if(!router.isReady || didInitialRedirect.current) return
    didInitialRedirect.current = true
  }, [router])

  const isLandingPage = router.pathname === '/'

  // AuthGate will run inside the provider so the hook is available
  function AuthGate({ children }){
    const { user, loading } = useSupabaseAuth()
    const [verified, setVerified] = useState(null)

    // If supabase reports no user, verify session with server (HttpOnly cookie)
    useEffect(() => {
      if(isLandingPage) return
      if(loading) return
      if(user) { setVerified(true); return }

      // Always check server session endpoint (cookie is HttpOnly and not visible to JS)
      fetch('/api/auth/me', { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          if(data && data.ok && data.user) setVerified(true)
          else setVerified(false)
        })
        .catch(() => setVerified(false))
    }, [isLandingPage, loading, user])

    useEffect(() => {
      if(isLandingPage) return
      if(loading) return
      if(verified === null) return
      if(!user && verified === false) router.replace('/')
    }, [isLandingPage, loading, user, verified, router])

    return children
  }

  return (
    <SupabaseAuthProvider>
      <GastosProvider>
        <AuthGate>
      <Head>
        <title>CasaManager</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* favicon and manifest removed to avoid server-side asset access issues */}
        <meta name="application-name" content="CasaManager" />
        <meta name="apple-mobile-web-app-title" content="CasaManager" />
        <meta name="theme-color" content="#000000" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      {showSplash ? (
        <div className="app-splash" role="status" aria-live="polite" aria-label="Cargando aplicación">
          <div className="splash-logo-wrap">
            <AppLogo size={110} />
          </div>
        </div>
      ) : (
        isLandingPage
          ? <Component {...pageProps} />
          : (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )
      )}

      <style jsx global>{`
        .app-splash {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 20% 20%, rgba(29, 78, 216, 0.16), transparent 40%),
            radial-gradient(circle at 80% 80%, rgb(227 20 103 / 42%), transparent 45%),
            radial-gradient(circle at 50% 10%, rgb(227 20 103 / 42%), transparent 35%),
            #000000;
        }

        .splash-logo-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: splashPulse 1.4s ease-in-out infinite;
        }

        @keyframes splashPulse {
          0%,
          100% { transform: scale(1); opacity: 0.92; }
          50% { transform: scale(1.04); opacity: 1; }
        }
      `}</style>
        </AuthGate>
      </GastosProvider>
    </SupabaseAuthProvider>
  )
}
