'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useGastos } from '../contexts/GastosContext'
import { formatMoney } from '../lib/data'
import AppLogo from './AppLogo'
import { Button } from './ui/button'

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const MONTHS_ES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function monthValueFromDate(date){
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonth(monthValue, delta){
  const [yearText, monthText] = String(monthValue || '').split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  if(!Number.isFinite(year) || !Number.isFinite(month)) return monthValueFromDate(new Date())
  const moved = new Date(year, month - 1 + delta, 1)
  return monthValueFromDate(moved)
}

function daysUntilNextCharge(targetDay){
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const currentMonthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const safeCurrentDay = Math.min(Math.max(Number(targetDay || 1), 1), currentMonthDays)
  let nextCharge = new Date(now.getFullYear(), now.getMonth(), safeCurrentDay)

  if(nextCharge < today){
    const nextMonthDays = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate()
    const safeNextDay = Math.min(Math.max(Number(targetDay || 1), 1), nextMonthDays)
    nextCharge = new Date(now.getFullYear(), now.getMonth() + 1, safeNextDay)
  }

  const diffMs = nextCharge.getTime() - today.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

export default function Header(){
  const router = useRouter()
  const { state } = useGastos()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeMonth, setActiveMonth] = useState(monthValueFromDate(new Date()))
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false)

  // Read sidebar state from localStorage so header aligns with it
  useEffect(() => {
    try{
      const saved = localStorage.getItem('gc_sidebar_open')
      if(saved !== null) setSidebarOpen(saved === '1')
      const savedAccount = localStorage.getItem('gc_header_account')
      if(savedAccount) setSelectedAccount(savedAccount)
    }catch(e){}
  }, [])

  useEffect(() => {
    try{ localStorage.setItem('gc_header_account', selectedAccount) }catch(e){}
  }, [selectedAccount])

  const spacerWidth = sidebarOpen ? 300 : 72

  const monthLabel = useMemo(() => {
    const [yearText, monthText] = activeMonth.split('-')
    const monthNumber = Number(monthText)
    const monthName = MONTHS_ES[monthNumber - 1] || 'Mes'
    return `${monthName} ${yearText}`
  }, [activeMonth])

  const monthShortLabel = useMemo(() => {
    const [yearText, monthText] = activeMonth.split('-')
    const monthNumber = Number(monthText)
    const monthName = MONTHS_ES_SHORT[monthNumber - 1] || 'Mes'
    return `${monthName} ${String(yearText).slice(-2)}`
  }, [activeMonth])

  const monthStats = useMemo(() => {
    const monthExpenses = (state.expenses || []).filter(expense => {
      const expenseMonth = String(expense.date || '').slice(0, 7)
      if(expenseMonth !== activeMonth) return false
      if(selectedAccount === 'all') return true
      return String(expense.account_id) === String(selectedAccount)
    })

    const spent = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    const budget = (state.budgets || []).reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
    const available = budget - spent
    const ratio = budget > 0 ? spent / budget : 0

    let traffic = 'green'
    if(ratio > 1) traffic = 'red'
    else if(ratio > 0.8) traffic = 'yellow'

    return { spent, budget, available, traffic }
  }, [state.expenses, state.budgets, activeMonth, selectedAccount])

  const fixedInsights = useMemo(() => {
    const activeFixed = (state.fixedExpenses || []).filter(item => {
      if(!item.active) return false
      if(selectedAccount === 'all') return true
      return String(item.account_id) === String(selectedAccount)
    })

    if(!activeFixed.length){
      return {
        nextChargeText: 'Sin próximos cobros',
        alertsText: 'Sin alertas',
        alertsCount: 0
      }
    }

    let nextItem = null
    let minDays = Number.POSITIVE_INFINITY

    activeFixed.forEach(item => {
      const days = daysUntilNextCharge(item.day)
      if(days < minDays){
        minDays = days
        nextItem = item
      }
    })

    const alertsCount = activeFixed.filter(item => daysUntilNextCharge(item.day) <= 7).length
    const nextChargeText = nextItem
      ? `En ${minDays} días: ${nextItem.name} (${formatMoney(nextItem.amount)})`
      : 'Sin próximos cobros'

    const alertsText = alertsCount > 0
      ? `${alertsCount} cobros esta semana`
      : 'Sin alertas esta semana'

    return { nextChargeText, alertsText, alertsCount }
  }, [state.fixedExpenses, selectedAccount])

  const [mobileLogoMenuOpen, setMobileLogoMenuOpen] = useState(false)
  const mobileLogoRef = useRef(null)

  const mobileNavItems = [
    { href: '/dashboard', label: 'Panel' },
    { href: '/expenses', label: 'Gastos' },
    { href: '/accounts', label: 'Cuentas' },
    { href: '/improvements', label: 'Mejoras' },
    { href: '/reports', label: 'Informes' },
    { href: '/admin', label: 'Administrar' },
    { href: '/documents', label: 'Documentos' },
    { href: '/contacts', label: 'Contactos' }
  ]

  const currentPath = ((router?.asPath || router?.pathname || '/').split('?')[0].replace(/\/+$/, '')) || '/'

  useEffect(() => {
    if (!mobileLogoMenuOpen) return

    function handleOutside(e){
      if (mobileLogoRef.current && !mobileLogoRef.current.contains(e.target)){
        setMobileLogoMenuOpen(false)
      }
    }

    function handleKey(e){
      if (e.key === 'Escape') setMobileLogoMenuOpen(false)
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [mobileLogoMenuOpen])

  useEffect(() => {
    setMobileLogoMenuOpen(false)
  }, [router.asPath])

  return (
    <header className="border-b transition-colors duration-300" style={{ borderColor: 'var(--border)', backgroundColor: '#000000', padding: '14px 0' }}>
      <div className="header-wrap" style={{display:'flex',alignItems:'stretch'}}>
        {/* Logo and title section (same width as sidebar) */}
          <div ref={mobileLogoRef} className="brand-shell-wrap" style={{width:spacerWidth,flex:`0 0 ${spacerWidth}px`,display:'flex',alignItems:'center',gap:'20px',paddingLeft:'12px',textDecoration:'none',position:'relative'}}>
          <Link href="/" className="brand-shell" style={{display:'flex',alignItems:'center',gap:'20px',textDecoration:'none'}} aria-label="Ir al home visual">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg transition-shadow" style={{background:'#000000', border:'1px solid transparent'}}>
              <AppLogo size={36} />
            </div>
            <div className="brand-text">
              <div className="font-bold text-base" style={{ color: '#ffffff' }}>CasaManager</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Tu asistente de gastos del hogar</div>
            </div>
          </Link>

          {/* Mobile hamburger for logo area (only on home) */}
          {currentPath === '/' && (
            <>
              <button
                type="button"
                className="mobile-hamburger"
                aria-label="Abrir menú móvil"
                onClick={() => setMobileLogoMenuOpen(v => !v)}
              >
                ☰
              </button>

              {mobileLogoMenuOpen && (
                <div className="mobile-hamburger-menu" role="menu">
                  {mobileNavItems.map(item => (
                    <a
                      key={item.href}
                      role="menuitem"
                      onClick={(e) => { e.preventDefault(); setMobileLogoMenuOpen(false); router.push(item.href) }}
                      href={item.href}
                    >{item.label}</a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="header-right" style={{flex:1,paddingRight:'24px',display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
          <div className="mobile-header-controls">
            <button
              type="button"
              className="mobile-details-toggle"
              onClick={() => setMobileDetailsOpen(prev => !prev)}
              aria-expanded={mobileDetailsOpen}
              aria-controls="mobile-header-details"
            >
              <span>Resumen del mes</span>
              <span className="mobile-toggle-icons">
                {fixedInsights.alertsCount > 0 && <span className="mobile-alert-dot" aria-hidden />}
                <span className="mobile-toggle-arrow" aria-hidden>{mobileDetailsOpen ? '▲' : '▼'}</span>
              </span>
            </button>
          </div>

          <div id="mobile-header-details" className={`header-grid ${mobileDetailsOpen ? 'mobile-open' : ''}`}>
            <div className="header-widget-group" style={{display:'flex',background:'#000',borderRadius:'10px',border:'1px solid var(--border)',padding:'16px 24px',minHeight:'74px',alignItems:'stretch',width:'100%',gap:'24px'}}>
              {/* Month Widget */}
              <div className="header-widget month-widget" style={{flex:'0 0 120px',minWidth:'100px',padding:'0 8px',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:'6px',border:'none'}}>
                <button type="button" onClick={() => setActiveMonth(prev => shiftMonth(prev, -1))} aria-label="Mes anterior" className="month-arrow">◀</button>
                <div className="month-label">
                  <span className="month-full">{monthLabel}</span>
                  <span className="month-short">{monthShortLabel}</span>
                </div>
                <button type="button" onClick={() => setActiveMonth(prev => shiftMonth(prev, 1))} aria-label="Mes siguiente" className="month-arrow">▶</button>
              </div>
              <div className="vertical-divider" style={{width:'1px',background:'#fff',margin:'0 0.25rem'}}></div>
              {/* Stats Widget */}
              <div className="header-widget stats-widget" style={{flex:'1 1 180px',minWidth:'140px',padding:'0 10px',display:'flex',flexDirection:'column',justifyContent:'center',border:'none'}}>
                <div className="stat-row"><span>Gastado</span><strong>{formatMoney(monthStats.spent)}</strong></div>
                <div className="stat-row"><span>Presupuesto</span><strong>{formatMoney(monthStats.budget)}</strong></div>
                <div className="stat-row"><span>Disponible</span><strong>{formatMoney(monthStats.available)}</strong></div>
                <div className="traffic-row">
                  <span className={`traffic-dot ${monthStats.traffic}`} />
                  <span>{monthStats.traffic === 'green' ? 'Controlado' : monthStats.traffic === 'yellow' ? 'Atención' : 'Excedido'}</span>
                </div>
              </div>
              <div className="vertical-divider" style={{width:'1px',background:'#fff',margin:'0 0.25rem'}}></div>
              {/* Insights Widget */}
              <div className="header-widget insights-widget" style={{flex:'1 1 180px',minWidth:'140px',padding:'0 10px',display:'flex',flexDirection:'column',justifyContent:'center',border:'none', boxShadow:'none', background:'none'}}>
                <div className="insight-title">Próximo cobro fijo</div>
                <div className="insight-main">{fixedInsights.nextChargeText}</div>
                {fixedInsights.alertsCount > 0 && (
                  <div className="insight-alert" style={{marginTop:'4px',fontSize:'11px',display:'flex',alignItems:'center',gap:'6px'}}>
                    <span style={{fontSize:'16px',marginRight:'6px',filter:'drop-shadow(0 0 6px rgba(176,18,40,0.9))'}}>🔔</span>
                    <span>{fixedInsights.alertsText}</span>
                  </div>
                )}
              </div>
              <div className="vertical-divider" style={{width:'1px',background:'#fff',margin:'0 0.25rem'}}></div>
              {/* Actions Widget */}
              <div className="header-widget actions-widget" style={{flex:'1 1 180px',minWidth:'140px',padding:'0 10px',display:'flex',flexDirection:'column',justifyContent:'center',border:'none'}}>
                <div className="actions-row">
                  <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="header-select" aria-label="Seleccionar cuenta">
                    <option value="all">Elegir cuenta...</option>
                    {state.accounts.map(account => (
                      <option key={account.id} value={String(account.id)}>{account.name}</option>
                    ))}
                  </select>
                  <Button variant="success" className="h-10 px-4 whitespace-nowrap" onClick={() => router.push('/expenses')}>＋ Añadir gasto</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .header-wrap{gap:12px}
        .mobile-header-controls{display:none}
        .mobile-details-toggle{display:none}
        .header-grid{display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:10px;max-width:1040px;width:100%}
        .header-widget-group{grid-column:1 / -1;width:100%}
        .header-widget{background:#000000;border:1px solid var(--border);border-radius:10px;padding:8px 10px;min-height:74px;display:flex;flex-direction:column;justify-content:center}
        .month-widget{display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:8px}
        .month-arrow{width:20px;height:20px;border:none;border-radius:6px;background:#000000;color:var(--white);cursor:pointer;font-size:10px;display:inline-flex;align-items:center;justify-content:center}
        .month-label{font-size:12px;font-weight:700;color:var(--white);white-space:nowrap;display:flex;align-items:center;gap:6px}
        .month-short{display:none}
        .stats-widget{gap:1px}
        .stat-row{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:var(--muted)}
        .stat-row strong{color:var(--white);font-size:11px}
        .traffic-row{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);margin-top:2px}
        .traffic-dot{width:8px;height:8px;border-radius:999px;display:inline-block}
        .traffic-dot.green{background:rgb(227 20 103 / 42%);box-shadow:0 0 8px rgba(255,81,102,0.9), 0 0 18px rgba(227,20,103,0.25);filter:drop-shadow(0 0 6px rgba(255,81,102,0.85))}
        .traffic-dot.yellow{background:rgb(227 20 103 / 42%);box-shadow:0 0 8px rgba(255,181,102,0.9), 0 0 14px rgba(227,120,20,0.2);filter:drop-shadow(0 0 6px rgba(255,181,102,0.8))}
        .traffic-dot.red{background:var(--purple);box-shadow:0 0 10px rgba(176,18,40,0.95), 0 0 20px rgba(227,20,103,0.25);filter:drop-shadow(0 0 8px rgba(176,18,40,0.9))}
        .insights-widget{gap:3px}
        .insight-title{font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:0.3px}
        .insight-main{font-size:12px;color:var(--white);font-weight:600;line-height:1.2}
        .insight-alert{font-size:11px;color:${fixedInsights.alertsCount > 0 ? '#ff5166' : 'var(--muted)'};text-shadow:${fixedInsights.alertsCount > 0 ? '0 0 10px rgba(176,18,40,0.95), 0 0 20px rgba(227,20,103,0.25)' : 'none'}}
        .actions-widget{gap:6px}
        .actions-row{display:flex;flex-direction:column;gap:8px;align-items:stretch;flex-wrap:nowrap}
        /* Allow the select to grow and use available horizontal space so placeholder isn't cut */
        .header-select{flex:1 1 auto;min-width:0;width:100%;max-width:none;padding:6px 10px;border-radius:8px;border:1px solid var(--border);background:#000000;color:var(--white);font-size:13px;height:36px;appearance:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .header-select option{font-size:12px}
        /* Use shared Button component styles (variant "success") */
        @media (max-width:1300px){
          .header-grid{grid-template-columns:repeat(2,minmax(220px,1fr));max-width:740px}
        }
        @media (max-width:900px){
          .header-wrap{display:block !important}
          .brand-shell{width:100% !important;flex:1 1 auto !important;padding:0 12px 10px !important;gap:10px !important}
          .brand-text{display:flex;flex-direction:column}
          .header-right{padding:0 12px 0 !important;justify-content:stretch !important;display:block !important}
          .mobile-header-controls{display:block;margin-bottom:8px}
          .mobile-details-toggle{display:flex;width:100%;align-items:center;justify-content:space-between;border:1px solid var(--border);background:#000000;color:var(--white);border-radius:10px;padding:10px 12px;font-size:12px;font-weight:700}
          .mobile-toggle-icons{display:inline-flex;align-items:center;gap:8px}
          .mobile-toggle-arrow{font-size:10px;color:var(--muted)}
          .mobile-alert-dot{width:10px;height:10px;border-radius:999px;background:#ff5166;box-shadow:0 0 10px rgba(176,18,40,0.95), 0 0 20px rgba(227,20,103,0.25)}
          .header-grid{grid-template-columns:0.68fr 1.16fr 1.16fr;max-width:none;gap:6px}
          .header-grid{display:none}
          .header-grid.mobile-open{display:grid}
          /* On mobile force the widget group to stack so all widgets are visible */
          .header-widget-group{display:grid !important;grid-template-columns:1fr;gap:8px;align-items:stretch}
          .header-widget{width:100%}
          .header-widget{min-height:auto;padding:7px 8px}
          .month-widget{padding:4px 5px;gap:3px}
          .month-arrow{width:18px;height:18px;border-radius:5px;font-size:9px;line-height:1}
          .month-label{font-size:10px;line-height:1.1}
          .month-full{display:none}
          .month-short{display:inline}
          .actions-widget{grid-column:1 / -1}
          /* Stack actions: select above the button on mobile and desktop (full-width) */
          .actions-row{flex-direction:column;align-items:stretch}
          .actions-row button{width:100%}
          .actions-row .header-select{width:100%;margin-bottom:8px}
        }
        @media (max-width:560px){
          .brand-text div:last-child{display:none}
          .header-grid{grid-template-columns:0.64fr 1.18fr 1.18fr;gap:5px}
          .header-widget{padding:6px 7px}
          .month-widget{padding:3px 4px;gap:2px}
          .month-arrow{width:16px;height:16px;font-size:8px}
          .month-label{font-size:9px}
          .insight-main{font-size:11px}
          .actions-row{gap:4px}
        }
        .mobile-hamburger{display:none}
        .mobile-hamburger-menu{display:none}
        @media (max-width:900px){
          .mobile-hamburger{display:inline-flex;position:absolute;right:12px;top:12px;background:transparent;border:0;color:var(--white);font-size:18px;padding:6px;border-radius:8px}
          .mobile-hamburger-menu{display:block;position:absolute;top:56px;left:12px;width:calc(100% - 24px);background:#000;border:1px solid var(--border);border-radius:10px;padding:8px;z-index:60}
          .mobile-hamburger-menu a{display:block;padding:8px 10px;color:var(--white);text-decoration:none;border-radius:8px;font-weight:700}
          .mobile-hamburger-menu a:hover{background:rgba(227,20,103,0.12)}
        }
      `}</style>
    </header>
  )
}
