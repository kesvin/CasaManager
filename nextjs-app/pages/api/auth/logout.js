const COOKIE_NAME = 'casamanager_session'

export default async function handler(req, res){
  // clear cookie
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=deleted; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${process.env.NODE_ENV==='production'?'; Secure':''}`)
  res.json({ ok: true })
}
