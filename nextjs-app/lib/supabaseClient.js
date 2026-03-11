import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Provide a safe noop client for SSR when env vars are missing
const noopSupabase = {
	auth: {
		getSession: async () => ({ data: { session: null } }),
		session: () => null,
		onAuthStateChange: () => ({ data: null }),
	},
	from: () => ({ select: async () => ({ data: [] }) }),
	// basic placeholders for common methods used in the app
}

export const supabase = (typeof window !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY)
	? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
	: noopSupabase

export default supabase
