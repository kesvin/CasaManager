import Link from 'next/link'
import AppLogo from '../components/AppLogo'

export default function LandingPage(){
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

          <header className="relative z-10 w-full max-w-[1030px] mx-auto rounded-full border border-[var(--border)] bg-black/70 backdrop-blur-md px-6 sm:px-7 py-2.5 grid grid-cols-1 md:grid-cols-[auto,1fr] items-center gap-3 text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-50 font-extrabold text-sm tracking-wide transition-colors hover:text-red-300">
              <AppLogo size={28} className="shrink-0" />
              <span>CasaManager</span>
            </Link>
            <nav className="hidden md:flex flex-wrap justify-center md:justify-end items-center gap-x-4 gap-y-2 md:gap-x-6 text-slate-300 text-xs font-semibold leading-none" aria-label="Navegación principal">
              <Link href="/dashboard" className="transition-colors hover:text-red-300">Panel</Link>
              <Link href="/expenses" className="transition-colors hover:text-red-300">Gastos</Link>
              <Link href="/accounts" className="transition-colors hover:text-red-300">Cuentas</Link>
              <Link href="/improvements" className="transition-colors hover:text-red-300">Mejoras</Link>
              <Link href="/reports" className="transition-colors hover:text-red-300">Informes</Link>
              <Link href="/admin" className="transition-colors hover:text-red-300">Administrar</Link>
              <Link href="/documents" className="transition-colors hover:text-red-300">Documentos</Link>
              <Link href="/contacts" className="transition-colors hover:text-red-300">Contactos</Link>
            </nav>
          </header>

          <div className="relative z-10 max-w-[660px] mt-12 sm:mt-24 text-slate-50">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-black/70 text-[var(--muted)] text-xs font-semibold px-3 py-2 mb-4 sm:mb-5">
              ⚡ Tu centro de gastos domésticos
            </div>

            <h1 className="text-[clamp(1.95rem,8vw,4rem)] leading-[1.02] tracking-[-0.03em] sm:tracking-[-0.04em] font-bold m-0 text-white">
              <span className="text-white">Tu asistente de gastos</span>
              <br />
              <span className="text-red-600">más rápido y visual</span>
            </h1>

            <p className="mt-5 text-slate-300 text-sm sm:text-[15px] leading-relaxed max-w-[560px]">
              Registra un gasto en segundos o entra al dashboard completo con una experiencia más limpia, enfocada y lista para operar.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-[320px] sm:max-w-none">
              <Link href="/expenses" className="w-full sm:w-auto text-center rounded-full bg-red-700 text-red-50 font-extrabold text-[13px] px-5 py-2.5 shadow-[0_8px_22px_rgba(227,20,103,0.42)] hover:bg-red-600 transition-colors">
                Añadir gasto rápido ↗
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto text-center rounded-full border border-[var(--border)] bg-black/70 text-[var(--text)] font-extrabold text-[13px] px-5 py-2.5 hover:bg-[rgba(227,20,103,0.42)] hover:border-[rgba(227,20,103,0.42)] transition-colors">
                Abrir dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
