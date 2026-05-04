import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { currentPassword, newPassword } = await req.json()

  const storedOverride = req.cookies.get('admin_pw_override')?.value
  const envPassword    = process.env.ADMIN_PASSWORD ?? 'shajpori2025'
  const activePassword = storedOverride ?? envPassword

  if (currentPassword !== activePassword) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
  }

  const secret = process.env.ADMIN_SECRET ?? 'shajpori_secret_key_2025'
  const res    = NextResponse.json({ ok: true })

  // Store new password in httpOnly cookie so it overrides the env var
  res.cookies.set('admin_pw_override', newPassword, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 365,
    path:     '/',
  })
  // Re-issue session cookie as well
  res.cookies.set('admin_session', secret, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 7,
    path:     '/',
  })
  return res
}
