import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('per_page') || '20')
  const from = (page - 1) * perPage
  let query = supabaseAdmin.from('orders').select('*, user:users(full_name, email, phone)', { count: 'exact' }).order('created_at', { ascending: false }).range(from, from + perPage - 1)
  if (status) query = query.eq('status', status)
  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count, page, per_page: perPage })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { items_ordered, shipping_address, user_id, guest_email } = body
  const subtotal: number = items_ordered.reduce((s: number, i: { qty: number; unit_price: number }) => s + i.qty * i.unit_price, 0)
  const delivery_charge = subtotal >= 2000 ? 0 : 80
  const { data, error } = await supabaseAdmin.from('orders').insert({ user_id, guest_email, items_ordered, subtotal, delivery_charge, discount_amount: 0, tax_amount: 0, total_amount: subtotal + delivery_charge, shipping_address, status: 'Pending', payment_status: 'Unpaid' }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
