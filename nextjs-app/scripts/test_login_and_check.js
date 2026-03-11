(async ()=>{
  try{
    const base = 'http://127.0.0.1:3000'
    // credentials from maintenance/dev_users.json
    const credentials = { email: 'kevin568977@gmail.com', password: 'As125677xd@' }

    // login
    const loginRes = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

    console.log('LOGIN STATUS', loginRes.status)
    const loginBody = await loginRes.text()
    console.log('LOGIN BODY', loginBody)
    const setCookie = loginRes.headers.get('set-cookie') || loginRes.headers.get('set-cookie')
    console.log('SET-COOKIE HEADER:', setCookie ? '[present]' : '[none]')

    if(!setCookie){
      console.error('No cookie returned; cannot proceed to check /dashboard')
      process.exit(1)
    }

    // Use cookie in next request
    const cookieValue = setCookie.split(';')[0]
    const dashRes = await fetch(base + '/dashboard', {
      method: 'GET',
      headers: { 'Cookie': cookieValue },
      redirect: 'manual'
    })
    console.log('/dashboard STATUS', dashRes.status)
    if(dashRes.status >= 300 && dashRes.status < 400){
      console.log('REDIRECT TO', dashRes.headers.get('location'))
    } else {
      const txt = await dashRes.text()
      console.log('DASHBOARD LENGTH', txt.length)
    }
  }catch(e){
    console.error('ERROR', e && e.message)
    process.exit(1)
  }
})()
