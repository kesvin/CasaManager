(async ()=>{
  try{
    const base = 'http://localhost:3000'
    const email = 'test+ci@example.com'
    console.log('1) POST /api/auth/forgot ->', email)
    let r = await fetch(base + '/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const forgot = await r.json()
    console.log('forgot response:', JSON.stringify(forgot, null, 2))

    const token = forgot.debugToken || (forgot.resetUrl ? new URL(forgot.resetUrl).searchParams.get('token') : null)
    if(!token){ console.error('No token returned'); process.exit(1) }
    console.log('Using token:', token)

    console.log('2) POST /api/auth/reset -> set new password')
    const newPass = 'newPass123'
    r = await fetch(base + '/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: newPass })
    })
    const reset = await r.json()
    console.log('reset response:', JSON.stringify(reset, null, 2))

    console.log('3) POST /api/auth/login -> try login with new password')
    r = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: newPass })
    })
    const login = await r.json().catch(()=>({ ok: false }))
    console.log('login response:', JSON.stringify(login, null, 2))

    process.exit(0)
  }catch(e){
    console.error('E2E error', e)
    process.exit(1)
  }
})()
