'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from './Header'
import Sidebar from './Sidebar'

function Icon({ name }){
  switch(name){
    case 'dashboard': return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor"/><rect x="13" y="3" width="8" height="5" rx="1" fill="currentColor"/><rect x="13" y="10" width="8" height="11" rx="1" fill="currentColor"/></svg>)
    case 'expenses': return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1v22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="8" r="3" fill="currentColor"/><circle cx="18" cy="16" r="3" fill="currentColor"/></svg>)
    case 'accounts': return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M7 10h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>)
    case 'reports': return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 14l3-3 4 4 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)
    case 'admin': return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 013.5 16.88l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82L4.21 3.5A2 2 0 016.33.67l.06.06a1.65 1.65 0 001.82.33h.01A1.65 1.65 0 0010 1.5V1a2 2 0 014 0v.5c.2.06.4.17.58.33.56.48 1.33.17 1.82-.33l.06-.06A2 2 0 0117.79 3.5l-.06.06a1.65 1.65 0 00-.33 1.82V6c.06.2.17.4.33.58.48.56.17 1.33-.33 1.82l-.06.06z" stroke="currentColor" strokeWidth="1"/></svg>)
    case 'improvements': return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4l6 6-9 9H5v-6l9-9z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 5l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>)
    case 'documents': return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>)
    case 'contacts': return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M5 20c0-3.2 3.1-5.8 7-5.8s7 2.6 7 5.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>)
    default: return null
  }
}

export default function Layout({ children }){
  const theme = 'dark'
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const mainNavItems = [
    { href: '/dashboard', label: 'Panel', icon: 'dashboard' },
    { href: '/expenses', label: 'Gastos', icon: 'expenses' },
    { href: '/accounts', label: 'Cuentas', icon: 'accounts' },
    { href: '/improvements', label: 'Mejoras', icon: 'improvements' },
    { href: '/reports', label: 'Informes', icon: 'reports' },
    { href: '/admin', label: 'Administrar', icon: 'admin' }
  ]

  const secondaryNavItems = [
    { href: '/documents', label: 'Documentos', icon: 'documents' },
    { href: '/contacts', label: 'Contactos', icon: 'contacts' }
  ]

  const navItems = [...mainNavItems, ...secondaryNavItems]

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    try{ localStorage.setItem('gastos_theme', 'dark') }catch(e){}
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [router?.asPath])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'auto'
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'auto'
      }
    }
  }, [mobileMenuOpen])

  const currentPath = ((router?.asPath || router?.pathname || '/').split('?')[0].replace(/\/+$/, '')) || '/'
  const currentLabel = navItems.find(item => currentPath === item.href || currentPath.startsWith(`${item.href}/`))?.label || 'Panel'

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <div className="dashboard-shell-wrap">
        <section
          className="dashboard-shell"
          style={{
            background:
              'radial-gradient(circle at 82% 18%, rgba(29, 78, 216, 0.16), transparent 32%), radial-gradient(circle at 14% 86%, var(--border), transparent 34%), #000000'
          }}
        >
          <Header />
          <div className="mobile-nav" aria-label="Navegación móvil">
            <div className="mobile-nav-inner">
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú"
              >
                ☰ Menú
              </button>
              <span className="mobile-current">{currentLabel}</span>
            </div>
          </div>

          <div className="app-shell" style={{display:'flex',gap:24,flex:1,alignItems:'stretch',minHeight:0}}>
            <Sidebar />
            <main className="app-main" style={{flex:1,padding:'28px 24px'}}>{children}</main>
          </div>
        </section>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Menú principal">
            <div className="mobile-menu-head">
              <strong>Menú</strong>
              <button type="button" className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú">✕</button>
            </div>
            <nav className="mobile-menu-list" aria-label="Navegación principal móvil">
              {mainNavItems.map(item => {
                const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`)

                return (
                  <Link key={item.href} href={item.href} className={`mobile-menu-item ${active ? 'active' : ''}`}>
                    <span className="mobile-menu-icon" aria-hidden><Icon name={item.icon} /></span>
                    <span className="mobile-menu-label">{item.label}</span>
                  </Link>
                )
              })}
              <div className="mobile-menu-divider" aria-hidden />
              {secondaryNavItems.map(item => {
                const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`)

                return (
                  <Link key={item.href} href={item.href} className={`mobile-menu-item ${active ? 'active' : ''}`}>
                    <span className="mobile-menu-icon" aria-hidden><Icon name={item.icon} /></span>
                    <span className="mobile-menu-label">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-shell-wrap{max-width:1480px;margin:14px auto;padding:0 16px 16px}
        .dashboard-shell{position:relative;overflow:hidden;border-radius:28px;border:1px solid var(--border);min-height:calc(100vh - 30px);display:flex;flex-direction:column}
        .dashboard-shell::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 76% 64%, var(--border), transparent 32%), radial-gradient(circle at 35% 18%, rgba(29, 78, 216, 0.10), transparent 28%)}
        .dashboard-shell::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom, transparent, transparent, rgba(0,0,0,0.75))}
        .dashboard-shell :global(.app-shell), .dashboard-shell :global(header), .dashboard-shell :global(.mobile-nav){position:relative;z-index:1}
        .mobile-nav{display:none;padding:10px 12px;border-bottom:1px solid var(--border);background:#000}
        .mobile-nav-inner{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .mobile-menu-btn{padding:8px 12px;border:1px solid var(--border);border-radius:10px;background:#000000;color:var(--white);font-size:13px;font-weight:700}
        .mobile-current{font-size:13px;color:var(--muted);font-weight:600}
        .mobile-menu-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:60;display:flex;justify-content:flex-start}
        .mobile-menu-panel{width:min(86vw,320px);height:100vh;background:#000;border-right:1px solid var(--border);padding:16px 14px;display:flex;flex-direction:column;gap:12px}
        .mobile-menu-head{display:flex;align-items:center;justify-content:space-between;color:#fff;padding-bottom:6px;border-bottom:1px solid var(--border)}
        .mobile-close-btn{border:0;background:transparent;color:#fff;font-size:18px;line-height:1;cursor:pointer}
        .mobile-menu-list{display:flex;flex-direction:column;gap:8px;overflow-y:auto;padding-top:4px}
        .mobile-menu-item{padding:12px 10px;border-radius:10px;background:#000000;color:var(--white);text-decoration:none;font-weight:700;display:flex;align-items:center;gap:10px}
        .mobile-menu-icon{display:inline-flex;align-items:center;justify-content:center;color:currentColor;flex:0 0 20px}
        .mobile-menu-label{padding-left:10px}
        .mobile-menu-item.active{background:rgb(227 20 103 / 42%);color:var(--white);text-shadow:0 0 10px rgba(255,255,255,0.9)}
        .mobile-menu-divider{height:1px;background:var(--border);opacity:0.9;margin:8px 6px}
        @media (max-width:900px){
          .dashboard-shell-wrap{padding:0 10px 10px;margin:8px auto}
          .mobile-nav{display:block;position:sticky;top:0;z-index:20}
          :global(.app-shell){gap:0 !important}
          .app-main{padding:16px 12px !important}
        }
      `}</style>
    </div>
  )
}
