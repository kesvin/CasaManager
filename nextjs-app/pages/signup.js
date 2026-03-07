import Head from 'next/head'
import Link from 'next/link'

export default function SignupPage(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-slate-50">
      <Head>
        <title>Sign up - CasaManager</title>
      </Head>
      <div className="w-full max-w-md bg-[#0b0b0b] border border-[var(--border)] rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Crear cuenta</h2>
        <p className="mb-4 text-sm text-slate-300">Actualmente la creación de cuentas está deshabilitada. Contacta al administrador para añadir usuarios.</p>
        <Link href="/" className="inline-block px-4 py-2 rounded border border-[var(--border)]">Volver</Link>
      </div>
    </div>
  )
}
