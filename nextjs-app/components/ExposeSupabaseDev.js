'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ExposeSupabaseDev(){
  useEffect(()=>{
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development'){
      try{ window.supabase = supabase }catch(e){}
    }
    return () => { try{ if (typeof window !== 'undefined' && window.supabase === supabase) delete window.supabase }catch(e){} }
  },[])

  return null
}
