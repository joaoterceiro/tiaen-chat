import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create a Supabase client
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get the session from the cookie
  const sessionCookie = req.cookies.get('sb-access-token')?.value
  if (sessionCookie) {
    // Add the session token to the headers
    res.headers.set('Authorization', `Bearer ${sessionCookie}`)
  }

  return res
}

export const config = {
  matcher: [
    '/api/instances/:path*',
    '/api/evolution/:path*',
    '/api/rag/:path*',
  ]
} 