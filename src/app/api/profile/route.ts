import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    const { data: created } = await supabaseAdmin
      .from('users')
      .insert({ id: user.id, email: user.email!, full_name: user.user_metadata?.full_name ?? '', role: 'customer' })
      .select()
      .single()
    data = created
  }

  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = ['full_name', 'phone', 'date_of_birth', 'gender', 'bio', 'avatar_url']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
