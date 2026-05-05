import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search  = searchParams.get('search') || ''
  const page    = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('per_page') || '20')
  const from    = (page - 1) * perPage

  let query = supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1)

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count, page, per_page: perPage })
}
