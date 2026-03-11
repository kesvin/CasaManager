'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

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

export default function Sidebar({ collapsed=false }){
  const [open, setOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef()
  const [menuDirectionUp, setMenuDirectionUp] = useState(false)

  useEffect(()=>{
    try{
      const saved = localStorage.getItem('gc_sidebar_open')
      if(saved!==null) setOpen(saved === '1')
      else setOpen(!collapsed)
    }catch(e){}
  }, [collapsed])

  useEffect(()=>{
    const fetchUser = async () => {
      try{
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if(res.ok){
          const json = await res.json()
          if(json?.user) setUser(json.user)
        }
      }catch(e){/* ignore */}
    }
    fetchUser()
  }, [])

  useEffect(()=>{
    const onDoc = (e) => {
      if(menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onResize = () => setMenuOpen(false)
    document.addEventListener('click', onDoc)
    window.addEventListener('resize', onResize)
    return () => { document.removeEventListener('click', onDoc); window.removeEventListener('resize', onResize) }
  }, [])

  useEffect(()=>{
    if(!menuOpen || !menuRef.current) return
    // compute whether there's enough space below; if not, open upwards
    const rect = menuRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    // approximate menu height 120px
    const needed = 120
    setMenuDirectionUp(spaceBelow < needed && spaceAbove > spaceBelow)
  }, [menuOpen])

  useEffect(()=>{
    try{ localStorage.setItem('gc_sidebar_open', open ? '1' : '0') }catch(e){}
  }, [open])

  const mainItems = [
    { key: 'dashboard', label: 'Panel', icon: 'dashboard' },
    { key: 'expenses', label: 'Gastos', icon: 'expenses' },
    { key: 'accounts', label: 'Cuentas', icon: 'accounts' },
    { key: 'improvements', label: 'Mejoras', icon: 'improvements' },
    { key: 'reports', label: 'Informes', icon: 'reports' },
    { key: 'admin', label: 'Administrar', icon: 'admin' }
  ]

  const secondaryItems = [
    { key: 'documents', label: 'Documentos', icon: 'documents' },
    { key: 'contacts', label: 'Contactos', icon: 'contacts' }
  ]

  const router = useRouter()
  const currentPath = ((router?.asPath || router?.pathname || '/').split('?')[0].replace(/\/+$/, '')) || '/'

  return (
    <aside className={`sidebar ${open ? 'open' : 'collapsed'}`} aria-label="Barra lateral">
      <div className="sidebar-top">
        <button className="collapse-btn" onClick={() => setOpen(!open)} aria-label="Mostrar u ocultar barra lateral">
          {open ? (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6l-6 6 6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>) : (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Navegación principal">
        {mainItems.map(i => {
          const href = i.key === 'dashboard' ? '/dashboard' : `/${i.key}`
          const active = currentPath === href || currentPath.startsWith(`${href}/`)
          const itemStyle = undefined
          const activeGlow = active ? { color: 'var(--white)', textShadow: '0 0 10px rgba(255,255,255,0.9)' } : undefined
          return (
            <Link key={i.key} href={href} className={`nav-item ${active ? 'active' : ''}`} style={itemStyle} title={open ? undefined : i.label} aria-current={active ? 'page' : undefined}>
              <span className="nav-icon" aria-hidden style={{display:'inline-flex', ...activeGlow}}>{<Icon name={i.icon} />}</span>
              {open && <span className="nav-label" style={activeGlow}>{i.label}</span>}
            </Link>
          )
        })}

        <div className="menu-divider" aria-hidden />

        {secondaryItems.map(i => {
          const href = `/${i.key}`
          const active = currentPath === href || currentPath.startsWith(`${href}/`)
          const activeGlow = active ? { color: 'var(--white)', textShadow: '0 0 10px rgba(255,255,255,0.9)' } : undefined
          return (
            <Link key={i.key} href={href} className={`nav-item secondary ${active ? 'active' : ''}`} title={open ? undefined : i.label} aria-current={active ? 'page' : undefined}>
              <span className="nav-icon" aria-hidden style={{display:'inline-flex', ...activeGlow}}>{<Icon name={i.icon} />}</span>
              {open && <span className="nav-label" style={activeGlow}>{i.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="profile" ref={menuRef}>
          <div className="avatar">{(user?.email || 'K').slice(0,2).toUpperCase()}</div>
          {open && (
            <div style={{position:'relative'}} className="profile-info">
              <div className="name">{user?.name || (user?.email ? user.email.split('@')[0] : 'Kevin')}</div>
              <div className="role" style={{display:'flex',alignItems:'center',gap:8}}>
                <span>Sesión activa</span>
                <button onClick={(e)=>{ e.stopPropagation(); setMenuOpen(s=>!s) }} className="dropdown-toggle" aria-expanded={menuOpen} style={{background:'transparent',border:0,color:'var(--muted)',cursor:'pointer'}}>
                  ▾
                </button>
                {menuOpen && (
                  <div className="profile-menu" style={{position:'absolute',left:0,background:'var(--card)',border:'1px solid var(--border)',padding:8,borderRadius:8,zIndex:40,
                    ...(menuDirectionUp ? { bottom: 'calc(100% + 8px)' } : { top: 'calc(100% + 8px)' })
                  }}>
                    <button className="btn-logout" onClick={async ()=>{
                      try{ await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }) }catch(e){}
                      setUser(null)
                      window.location.reload()
                    }} style={{display:'block',width:'100%',textAlign:'left',padding:'6px 8px',background:'transparent',border:0,color:'var(--text)',cursor:'pointer'}}>Cerrar sesión</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .sidebar{width:260px;flex:0 0 260px;padding:28px 24px 24px;display:flex;flex-direction:column;gap:16px;height:auto;min-height:100%;align-self:stretch;box-sizing:border-box;position:relative}
        .sidebar.collapsed{width:72px;flex:0 0 72px}
        .sidebar-top{position:absolute;top:14px;right:14px;display:flex;align-items:center;justify-content:flex-end}
        .collapse-btn{background:transparent;border:0;color:white;cursor:pointer;padding:6px;border-radius:6px;transition:all 0.2s ease;display:flex;align-items:center;justify-content:center}
        .collapse-btn:hover{background:rgba(255,255,255,0.1)}
        .sidebar-nav{display:flex;flex-direction:column;gap:28px;margin-top:30px;flex:1;padding-top:2px}
        .nav-item{display:flex;align-items:center;gap:20px;padding:18px 16px;border-radius:12px;color:var(--white);text-decoration:none;font-weight:700;transition:all 0.2s ease;box-shadow:0 2px 8px rgba(0,0,0,0.4);background:#000000}
        .nav-item:hover{background:rgba(29,78,216,0.22);color:var(--white);box-shadow:0 2px 10px rgba(0,0,0,0.5)}
        .nav-item.active{background:rgb(227 20 103 / 42%);color:var(--white);box-shadow:0 2px 8px rgba(0,0,0,0.4)}
        .nav-item.secondary{background:#000000}
        .nav-item.secondary:hover{background:rgba(29,78,216,0.22)}
        .menu-divider{height:1px;background:var(--border);opacity:0.9;margin:4px 6px}
        .nav-item .nav-icon, .nav-item .nav-label{color:var(--white)}
        .nav-item.active .nav-label, .nav-item.active .nav-icon{color:var(--white);text-shadow:0 0 10px rgba(255,255,255,0.9)}
        .nav-icon{font-size:22px;flex:0 0 22px;display:flex;align-items:center;justify-content:center}
        .nav-label{font-size:17px;font-weight:700;padding-left:10px}
        .sidebar-footer{margin-top:auto;padding-top:20px;border-top:1px solid var(--border)}
        .profile{display:flex;align-items:center;gap:14px}
        .avatar{width:40px;height:40px;border-radius:8px;background:black;border:1px solid var(--white);display:flex;align-items:center;justify-content:center;color:var(--white);font-weight:700;font-size:12px;flex:0 0 40px}
        .profile-info{min-width:0}
        .name{font-weight:700;color:var(--white);font-size:13px}
        .role{font-size:11px;color:var(--muted)}
        .collapse-btn:hover{background:rgba(255,255,255,0.15)}
        @media (max-width:900px){
          .sidebar{display:none}
        }
      `}</style>
    </aside>
  )
}
