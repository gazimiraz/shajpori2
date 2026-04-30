import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const maxPrice = searchParams.get('maxPrice')
  const featured = searchParams.get('featured')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('per_page') || '20')
  const from = (page - 1) * perPage

  let query = supabaseAdmin.from('products').select('*, variants:product_variants(*)', { count: 'exact' }).eq('is_active', true).order('is_featured', { ascending: false }).order('created_at', { ascending: false }).range(from, from + perPage - 1)

  if (category) query = query.eq('category', category)
  if (maxPrice) query = query.lte('price', parseFloat(maxPrice))
  if (featured === 'true') query = query.eq('is_featured', true)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count, page, per_page: perPage })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('products').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
