import { NextResponse } from 'next/server'

// Verify HS256 JWT using Web Crypto (edge-safe). If verification fails,
// redirect to '/'. Public paths and API are excluded.
async function verifyJwtHs256(token, secret){
  try{
    const parts = token.split('.')
    if(parts.length !== 3) return false
    const [headerB64, payloadB64, sigB64] = parts
    const dataStr = `${headerB64}.${payloadB64}`

    // base64url -> Uint8Array
    const b64ToUint8 = (b64url) => {
      const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64url.length + 3) % 4)
      if (typeof Buffer !== 'undefined') return Uint8Array.from(Buffer.from(b64, 'base64'))
      const binary = atob(b64)
      const arr = new Uint8Array(binary.length)
      for(let i=0;i<binary.length;i++) arr[i] = binary.charCodeAt(i)
      return arr
    }

    const uintData = new TextEncoder().encode(dataStr)
    const keyData = new TextEncoder().encode(secret)
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const sigBuffer = await crypto.subtle.sign('HMAC', key, uintData)
    const sigArr = new Uint8Array(sigBuffer)

    // encode signature to base64url
    const toBase64Url = (arr) => {
      if (typeof Buffer !== 'undefined'){
        return Buffer.from(arr).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
      }
      let bin = ''
      for(let i=0;i<arr.length;i++) bin += String.fromCharCode(arr[i])
      return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
    }

    const expected = toBase64Url(sigArr)
    return expected === sigB64
  }catch(e){
    return false
  }
}

export async function middleware(req){
  const { pathname } = req.nextUrl

  // Allow API routes
  if (pathname.startsWith('/api')) return NextResponse.next()

  // Public pages
  const PUBLIC_PATHS = ['/', '/robots.txt', '/sitemap.xml']
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  // Get token from cookie
  const cookie = req.cookies.get && req.cookies.get('casamanager_session')?.value
  if (!cookie) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  const secret = process.env.SESSION_SECRET || 'dev_session_secret_change_me'
  const ok = await verifyJwtHs256(cookie, secret)
  if (!ok){
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|favicon.png|favicon.svg).*)'
}
