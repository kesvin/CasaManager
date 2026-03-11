(async ()=>{
  try{
    const res = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'CI Test', email: 'test+ci@example.com', password: 'TestPass123' })
    })
    const body = await res.text()
    console.log('STATUS', res.status)
    console.log('BODY', body)
    console.log('SET-COOKIE', res.headers.get('set-cookie') || 'none')
  }catch(e){
    console.error('ERROR', e && e.message)
  }
})()
