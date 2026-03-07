import Head from 'next/head'
import LoginPanel from '../components/LoginPanel'

export default function LoginPage(){
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(227,20,103,0.08), transparent 20%), var(--bg)' }}>
      <Head>
        <title>Sign In • CasaManager</title>
      </Head>

      <div className="w-full max-w-xl px-6">
        <div className="mx-auto rounded-2xl overflow-hidden shadow-2xl" style={{ maxWidth: 680 }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="hidden md:block bg-gradient-to-br from-[rgba(99,30,255,0.18)] to-transparent p-8" style={{ background: 'linear-gradient(180deg, rgba(99,30,255,0.12), rgba(227,20,103,0.06))' }}>
              <div className="text-white/90">
                <h3 className="text-2xl font-bold mb-2">Sign In</h3>
                <p className="text-sm">Keep it all together and you'll be fine</p>
              </div>
              <div className="mt-6">
                <img src="/images/login-illustration.png" alt="" className="opacity-60" />
              </div>
            </div>

            <div className="p-6 md:p-8 flex items-center justify-center">
              <LoginPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
