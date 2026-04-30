// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isUuid = /^[0-9a-f-]{36}$/i.test(id)
  const query = supabaseAdmin.from('products').select('*, variants:product_variants(*)')
  const { data, error } = isUuid ? await query.eq('id', id).single() : await query.eq('slug', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  supabaseAdmin.from('products').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id)
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('products').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabaseAdmin.from('products').update({ is_active: false }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data: { success: true } })
}
