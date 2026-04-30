import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

export const createBrowserClient = () =>
  createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

// Lazy singleton — only created on first use, never at module load time
let _admin: SupabaseClient | null = null
function getAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
  }
  return _admin
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    const admin = getAdmin()
    const val = (admin as unknown as Record<string, unknown>)[prop as string]
    return typeof val === 'function' ? (val as Function).bind(admin) : val
  },
})
