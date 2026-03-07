import jwt from 'jsonwebtoken'

const COOKIE_NAME = 'casamanager_session'

export default function handler(req, res){
  try{
    const cookies = req.headers.cookie || ''
    const match = cookies.split(';').map(s=>s.trim()).find(s=>s.startsWith(`${COOKIE_NAME}=`))
    if(!match) return res.json({ ok: false })
    const token = match.split('=')[1]
    let secret = process.env.SESSION_SECRET
    if(!secret){
      secret = 'dev_session_secret_change_me'
    }
    const payload = jwt.verify(token, secret)
    return res.json({ ok: true, user: payload })
  }catch(err){
    return res.json({ ok: false })
  }
}
