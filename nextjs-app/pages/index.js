import Link from 'next/link'
import AppLogo from '../components/AppLogo'
import LoginPanel from '../components/LoginPanel'
import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '../contexts/SupabaseAuth'
import { useRouter } from 'next/router'

function HeaderSession({ user, onLogout }){
	const [open, setOpen] = useState(false)
	function displayName(u){
		if(!u) return '?'
		if(u.name) return u.name
		if(u.email) return u.email.split('@')[0]
		return '?'
	}
	const dname = displayName(user)
	const initials = (dname && dname !== '?') ? dname.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : '?'

	async function handleLogout(){
		try{
			await fetch('/api/auth/logout', { method: 'POST' })
		}catch(e){
			console.error('logout failed', e)
		}
		setOpen(false)
		if(typeof onLogout === 'function') onLogout()
	}

	return (
		<div className="relative">
			<button onClick={()=>setOpen(s=>!s)} className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors">
				<div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-semibold text-white" style={{ background: 'linear-gradient(90deg, rgb(199 21 45), rgb(227 20 103))' }}>{initials}</div>
				<div className="text-left leading-none">
					<div className="text-sm font-semibold text-white/95 truncate max-w-[160px]">{dname}</div>
					<div className="text-xs text-[var(--muted)]">Sesión activa</div>
				</div>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>

			</button>
			{open && (
				<div className="absolute right-0 mt-2 w-44 bg-black rounded-md border border-[var(--border)] shadow-lg py-1">
					<button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5">Cerrar sesión</button>
				</div>
			)}
					</div>
				)
}

export default function LandingPage(){
		const { user, loading } = useSupabaseAuth()
		const [mobileOpen, setMobileOpen] = useState(false)
		const [sessionUser, setSessionUser] = useState(null)
		const router = useRouter()

		// Fetch server-side session (HttpOnly cookie) to reflect login state
		useEffect(()=>{
			let mounted = true
			const fetchSession = async () => {
				try{
					const r = await fetch('/api/auth/me', { credentials: 'include' })
					if(!mounted) return
					const data = await r.json()
					if(data?.ok && data.user) setSessionUser(data.user)
					else setSessionUser(null)
				}catch(e){}
			}
			fetchSession()

			const onSessionChanged = () => { try{ fetchSession() }catch(e){} }
			window.addEventListener('casamanager:session-changed', onSessionChanged)
			return ()=>{ mounted = false; window.removeEventListener('casamanager:session-changed', onSessionChanged) }
		}, [])

		const isLogged = Boolean(user || sessionUser)
		const activeUser = user || sessionUser



	// prevent background scrolling when mobile menu is open
	useEffect(()=>{
		if(typeof document === 'undefined') return
		document.body.style.overflow = mobileOpen ? 'hidden' : 'auto'
		return ()=>{ document.body.style.overflow = 'auto' }
	}, [mobileOpen])

		return (
		<div className="min-h-screen bg-black">
			<div className="max-w-[1480px] mx-auto px-4 py-4 sm:py-6">
				<section
					className="relative overflow-hidden rounded-[28px] border border-[var(--border)] min-h-[78vh] px-7 py-7 sm:px-11 sm:py-10"
					style={{
						background: 'radial-gradient(circle at 18% 14%, rgb(227 20 103 / 42%), transparent 38%), #000000'
					}}
				>
					<div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
						<video className="h-full w-full object-cover opacity-30" autoPlay muted loop playsInline preload="metadata">
							<source src="/videos/hero-particles.mp4" type="video/mp4" />
						</video>
					</div>
					<div
						aria-hidden
						className="absolute inset-0"
						style={{
							background:
								'radial-gradient(circle at 76% 58%, rgb(227 20 103 / 42%), transparent 32%), radial-gradient(circle at 46% 20%, rgb(227 20 103 / 42%), transparent 38%), linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.48))'
						}}
					/>
					<div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/65" />

					<header className="relative z-10 w-full max-w-[1030px] mx-auto rounded-full border border-[var(--border)] bg-black/70 backdrop-blur-md px-6 sm:px-7 py-2.5 grid grid-cols-[auto,auto] md:grid-cols-[auto,1fr,auto] items-center gap-3 text-center md:text-left">
						<Link href="/" className="inline-flex items-center gap-2 text-slate-50 font-extrabold text-sm tracking-wide transition-colors" style={{ color: 'var(--white)' }}>
								<AppLogo size={28} className="shrink-0" />
								<span>CasaManager</span>
							</Link>

						{/* Hamburger visible on tablet/mobile (lg and below) */}
						<button onClick={()=>setMobileOpen(s=>!s)} aria-expanded={mobileOpen} className="inline-flex justify-end items-center gap-2 lg:hidden px-2 py-1 rounded-md text-slate-300 group hover:text-[var(--purple)] transition-colors">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
						</button>
						<nav className="hidden lg:flex flex-wrap justify-center md:justify-end items-center gap-x-4 gap-y-2 md:gap-x-6 text-slate-300 text-xs font-semibold leading-none" aria-label="Navegación principal">
							<Link href="/dashboard" className={`transition-colors hover:text-red-300 ${!isLogged ? 'opacity-50' : 'pointer-events-auto'}`} aria-disabled={!isLogged} tabIndex={isLogged ? 0 : -1} onClick={(e)=>{ if(!isLogged) e.preventDefault() }}>Panel</Link>
							<Link href="/expenses" className={`transition-colors hover:text-red-300 ${!isLogged ? 'opacity-50' : 'pointer-events-auto'}`} aria-disabled={!isLogged} tabIndex={isLogged ? 0 : -1} onClick={(e)=>{ if(!isLogged) e.preventDefault() }}>Gastos</Link>
							<Link href="/accounts" className={`transition-colors hover:text-red-300 ${!isLogged ? 'opacity-50' : 'pointer-events-auto'}`} aria-disabled={!isLogged} tabIndex={isLogged ? 0 : -1} onClick={(e)=>{ if(!isLogged) e.preventDefault() }}>Cuentas</Link>
							<Link href="/improvements" className={`transition-colors hover:text-red-300 ${!isLogged ? 'opacity-50' : 'pointer-events-auto'}`} aria-disabled={!isLogged} tabIndex={isLogged ? 0 : -1} onClick={(e)=>{ if(!isLogged) e.preventDefault() }}>Mejoras</Link>
							<Link href="/reports" className={`transition-colors hover:text-red-300 ${!isLogged ? 'opacity-50' : 'pointer-events-auto'}`} aria-disabled={!isLogged} tabIndex={isLogged ? 0 : -1} onClick={(e)=>{ if(!isLogged) e.preventDefault() }}>Informes</Link>
							<Link href="/admin" className={`transition-colors hover:text-red-300 ${!isLogged ? 'opacity-50' : 'pointer-events-auto'}`} aria-disabled={!isLogged} tabIndex={isLogged ? 0 : -1} onClick={(e)=>{ if(!isLogged) e.preventDefault() }}>Administrar</Link>
							<Link href="/documents" className={`transition-colors hover:text-red-300 ${!isLogged ? 'opacity-50' : 'pointer-events-auto'}`} aria-disabled={!isLogged} tabIndex={isLogged ? 0 : -1} onClick={(e)=>{ if(!isLogged) e.preventDefault() }}>Documentos</Link>
							<Link href="/contacts" className={`transition-colors hover:text-red-300 ${!isLogged ? 'opacity-50' : 'pointer-events-auto'}`} aria-disabled={!isLogged} tabIndex={isLogged ? 0 : -1} onClick={(e)=>{ if(!isLogged) e.preventDefault() }}>Contactos</Link>
						</nav>

						                        {/* Session block: separated from nav visually */}
												<div className="hidden lg:flex items-center justify-end md:ml-4 md:pl-4 md:border-l md:border-[var(--border)]">
																			{isLogged ? <HeaderSession user={activeUser} onLogout={()=>{ fetch('/api/auth/logout',{ method: 'POST' }).then(()=>setSessionUser(null)).catch(()=>setSessionUser(null)) }} /> : null}
																		</div>
					</header>

										{/* Mobile / tablet menu panel (in-flow, pushes content down) */}
										<div className={`lg:hidden w-full mt-3 transition-all duration-200 ease-in-out overflow-hidden ${mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'} ${isLogged ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
											<div className="relative z-50 mx-auto max-w-[1030px] px-3">
												<div className="relative z-50 bg-black/80 border border-[var(--border)] rounded-lg p-4">
													<nav className={`flex flex-col gap-2 ${isLogged ? 'pointer-events-auto' : 'pointer-events-none'}`}>
														{['/dashboard','/expenses','/accounts','/improvements','/reports','/admin','/documents','/contacts'].map((href, idx)=>{
															const labels = ['Panel','Gastos','Cuentas','Mejoras','Informes','Administrar','Documentos','Contactos']
															const label = labels[idx]
															return (
																<Link key={href} href={href} aria-disabled={!isLogged} tabIndex={isLogged ? 0 : -1} onClick={(e)=>{ if(!isLogged) e.preventDefault() }} className={`block px-3 py-2 rounded text-sm font-semibold ${!isLogged ? 'opacity-60 text-[var(--muted)] pointer-events-none' : 'text-slate-200 hover:text-red-300 pointer-events-auto'}`}>
																	{label}
																</Link>
															)
														})}
													</nav>
													<div className="mt-3 pt-3 border-t border-[var(--border)]">
														{isLogged ? (
															<div className="flex items-center justify-between">
																<div className="flex items-center gap-3">
																	<div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: 'linear-gradient(90deg, rgb(199 21 45), rgb(227 20 103))' }}>{(activeUser && (activeUser.name || activeUser.email) ? (activeUser.name ? activeUser.name.split(' ')[0][0] : activeUser.email.split('@')[0][0]) : '?')}</div>
																	<div className="text-sm font-semibold text-white/95 truncate max-w-[160px]">{activeUser ? (activeUser.name || (activeUser.email && activeUser.email.split('@')[0])) : '?'}</div>
																</div>
																<button onClick={async ()=>{ await fetch('/api/auth/logout',{ method: 'POST' }); setSessionUser(null); setMobileOpen(false); }} className="text-sm text-white/90 px-3 py-1.5 rounded hover:bg-white/5">Cerrar sesión</button>
															</div>
														) : (
															<div className="text-center text-sm text-[var(--muted)]">No hay sesión activa</div>
														)}
													</div>
												</div>
											</div>
										</div>

					<div className="relative z-10 mt-12 sm:mt-24">
						<div className="w-full max-w-[1030px] mx-auto flex flex-col lg:flex-row items-start gap-8">
						<div className="text-slate-50 max-w-[660px] flex-1">
							<div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-black/70 text-[var(--muted)] text-xs font-semibold px-3 py-2 mb-4 sm:mb-5">
								⚡ Tu centro de gastos domésticos
							</div>

							<h1 className="text-[clamp(1.95rem,8vw,4rem)] leading-[1.02] tracking-[-0.03em] sm:tracking-[-0.04em] font-bold m-0 text-white">
								<span className="text-white">Tu asistente de gastos</span>
								<br />
								<span style={{ background: 'linear-gradient(90deg, rgb(199 21 45), rgb(227 20 103))', WebkitBackgroundClip: 'text', color: 'transparent' }}>más rápido y visual</span>
							</h1>

							<p className="mt-5 text-slate-300 text-sm sm:text-[15px] leading-relaxed max-w-[560px]">
								Registra un gasto en segundos o entra al dashboard completo con una experiencia más limpia, enfocada y lista para operar.
							</p>

							<div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-[320px] sm:max-w-none">
								{isLogged ? (
									<Link href="/expenses" className="w-full sm:w-auto text-center rounded-full text-red-50 font-extrabold text-[13px] px-5 py-2.5 shadow-[0_8px_22px_rgba(227,20,103,0.42)] border border-[var(--border)] transition-colors" style={{ background: 'linear-gradient(90deg, rgb(199 21 45), rgb(227 20 103))' }}>
										Añadir gasto rápido ↗
									</Link>
								) : (
									<button disabled className="w-full sm:w-auto text-center rounded-full text-red-50 font-extrabold text-[13px] px-5 py-2.5 shadow-[0_8px_22px_rgba(227,20,103,0.12)] border border-[var(--border)] opacity-60 cursor-not-allowed" style={{ background: 'linear-gradient(90deg, rgb(199 21 45 / 18%), rgb(227 20 103 / 18%))' }}>
										Añadir gasto rápido ↗
									</button>
								)}

								{isLogged ? (
									<Link href="/dashboard" className="w-full sm:w-auto text-center rounded-full border border-[var(--border)] bg-black/70 text-[var(--text)] font-extrabold text-[13px] px-5 py-2.5 hover:bg-[rgba(227,20,103,0.42)] hover:border-[rgba(227,20,103,0.42)] transition-colors">
										Abrir dashboard
									</Link>
								) : (
									<button disabled className="w-full sm:w-auto text-center rounded-full border border-[var(--border)] bg-black/40 text-[var(--muted)] font-extrabold text-[13px] px-5 py-2.5 opacity-60 cursor-not-allowed">
										Abrir dashboard
									</button>
								)}

							</div>
						</div>

												<div className="flex-shrink-0 w-full lg:w-[360px]">
																			<div className="block ml-auto">
																				{!isLogged && <LoginPanel onSuccess={setSessionUser} />}
																			</div>
												</div>
					</div>
					</div>
				</section>
			</div>
		</div>
	)
}
