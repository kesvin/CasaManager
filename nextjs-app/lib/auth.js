import { supabaseAdmin } from './supabaseServer'

// Extract bearer token from Authorization header or cookie
export function extractAccessToken(req){
  const auth = req.headers?.authorization || ''
  if(auth && auth.toLowerCase().startsWith('bearer ')){
    return auth.split(' ')[1]
  }

  // check common Supabase cookie (supabase-js stores in localStorage by default)
  const cookie = req.headers?.cookie || ''
  const m = cookie.match(/sb-access-token=([^;]+)/) || cookie.match(/sb:token=([^;]+)/)
  if(m) return decodeURIComponent(m[1])

  return null
}

export async function getUserFromReq(req){
  const token = extractAccessToken(req)
  if(!token) return null

  try{
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if(error) return null
    return data?.user || null
  }catch(e){
    return null
  }
}

export async function requireUser(req, res){
  const user = await getUserFromReq(req)
  if(!user){
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return user
}
