import { NextResponse } from 'next/server'

// Middleware kept minimal: allow all requests through so Supabase handles auth.
export function middleware(req) {
  return NextResponse.next()
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)'
}
