import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ADMIN = ['/admin/login']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (PUBLIC_ADMIN.some(p => pathname.startsWith(p))) return NextResponse.next()

  const session = req.cookies.get('admin_session')?.value
  const secret  = process.env.ADMIN_SECRET ?? 'shajpori_secret_key_2025'

  if (session !== secret) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
