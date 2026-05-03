import { NextRequest, NextResponse } from 'next/server'

/* Generic track endpoint — delegates to courier-specific logic */
export async function GET(req: NextRequest, { params }: { params: Promise<{ courier: string }> }) {
  const { courier } = await params
  const { searchParams } = req.nextUrl
  const code        = searchParams.get('code')        ?? ''
  const consignment = searchParams.get('consignment') ?? ''

  try {
    const origin = req.nextUrl.origin
    const res = await fetch(`${origin}/api/courier/${courier}?code=${code}&consignment=${consignment}`)
    if (!res.ok) return NextResponse.json({ status: 'pending' })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ status: 'pending' })
  }
}
