(async function(){
  let fs
  try { fs = require('fs') } catch(e) { fs = (await import('fs')).default || (await import('fs')) }
  try{
    const base = 'http://localhost:3000'
    const email = 'test+ci@example.com'
    const out = { steps: [] }

    out.steps.push({ step: 'forgot', email })
    let r = await fetch(base + '/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    let forgot
    try { const t = await r.text(); try { forgot = JSON.parse(t) } catch(e) { forgot = { _rawText: t, _status: r.status } } } catch(e) { forgot = { error: String(e) } }
    out.steps.push({ response: forgot })

    const token = forgot.debugToken || (forgot.resetUrl ? new URL(forgot.resetUrl).searchParams.get('token') : null)
    if(!token){ out.error = 'No token returned'; fs.writeFileSync('maintenance/e2e_result.json', JSON.stringify(out, null, 2)); process.exit(1) }
    out.steps.push({ step: 'using_token', token })

    out.steps.push({ step: 'reset' })
    const newPass = 'newPass123'
    r = await fetch(base + '/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: newPass })
    })
    let reset
    try { const t = await r.text(); try { reset = JSON.parse(t) } catch(e) { reset = { _rawText: t, _status: r.status } } } catch(e) { reset = { error: String(e) } }
    out.steps.push({ response: reset })

    out.steps.push({ step: 'login_attempt' })
    r = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: newPass })
    })
    let login
    try { const t = await r.text(); try { login = JSON.parse(t) } catch(e) { login = { _rawText: t, _status: r.status } } } catch(e) { login = { error: String(e) } }
    out.steps.push({ response: login })

    fs.writeFileSync('maintenance/e2e_result.json', JSON.stringify(out, null, 2))
    process.exit(0)
  }catch(e){
    fs.writeFileSync('maintenance/e2e_result.json', JSON.stringify({ error: String(e) }, null, 2))
    process.exit(1)
  }
})()
