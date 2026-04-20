import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/inicio', '/perfil', '/local', '/ticket']
const AUTH_PATHS = ['/', '/entrar', '/verificar']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path))
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_PATHS.includes(pathname)
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users away from protected routes
  const isProtected = isProtectedRoute(request.nextUrl.pathname)

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/entrar'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth/landing pages to dashboard
  if (user && isAuthRoute(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/inicio'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
