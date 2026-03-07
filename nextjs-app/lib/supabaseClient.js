import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// During server-side rendering (or when env vars are not provided)
// creating a Supabase client will throw. Export a lightweight noop
// stub for SSR so pages can render without NEXT_PUBLIC_SUPABASE_* set.
const noopSupabase = {
	auth: {
		getSession: async () => ({ data: { session: null } }),
		session: () => null,
		onAuthStateChange: () => ({ data: null }),
	},
}

export const supabase = typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey
	? createClient(supabaseUrl, supabaseAnonKey)
	: noopSupabase
