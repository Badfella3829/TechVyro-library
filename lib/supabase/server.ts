import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// v9: Supabase configuration check - updated 2026-03-19
export function isSupabaseConfigured(): boolean {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const url = configuredUrl?.startsWith("http://") || configuredUrl?.startsWith("https://")
    ? configuredUrl
    : "https://ekdgllztmptfmdipxitf.supabase.co"
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!key) return false

  try {
    const parsedUrl = new URL(url)
    return (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") && Boolean(parsedUrl.hostname)
  } catch {
    return false
  }
}

export async function createClient() {
  // Return null if not configured - caller must handle this
  if (!isSupabaseConfigured()) {
    return null
  }

  const cookieStore = await cookies()
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseUrl = configuredUrl?.startsWith("http://") || configuredUrl?.startsWith("https://")
    ? configuredUrl
    : "https://ekdgllztmptfmdipxitf.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Ignore - called from Server Component
          }
        },
      },
    },
  )
}
