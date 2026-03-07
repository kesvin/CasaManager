#!/usr/bin/env node
// Simple login tester for /api/auth/login
// Usage: node scripts/test_login.js
// Optional env vars: EMAIL, PASSWORD, URL

const URL = process.env.URL || 'http://localhost:3000/api/auth/login'
const EMAIL = process.env.EMAIL || 'kevin568977@gmail.com'
const PASSWORD = process.env.PASSWORD || 'As125677xd@'

async function main(){
  const body = { email: EMAIL, password: PASSWORD }
  try{
    // Node 18+ has global fetch; this will work there. If not, the error will be shown.
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    console.log('STATUS:', res.status, res.statusText)

    console.log('\nHEADERS:')
    for (const [k,v] of res.headers.entries()) console.log(`${k}: ${v}`)

    const text = await res.text()
    console.log('\nBODY:')
    console.log(text)

    if (!res.ok) process.exit(2)
  }catch(err){
    console.error('REQUEST ERROR:')
    console.error(err && err.message ? err.message : err)
    process.exit(1)
  }
}

main()
