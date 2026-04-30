// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('orders').select('*, user:users(full_name, email, phone)').eq('order_id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { status, tracking_number, carrier, admin_notes } = body

  const updates: Record<string, unknown> = {}
  if (status) {
    updates.status = status
    if (status === 'Shipped')   updates.shipped_at   = new Date().toISOString()
    if (status === 'Delivered') updates.delivered_at = new Date().toISOString()
    if (status === 'Cancelled') updates.cancelled_at = new Date().toISOString()
  }
  if (tracking_number) updates.tracking_number = tracking_number
  if (carrier)         updates.carrier = carrier
  if (admin_notes)     updates.admin_notes = admin_notes

  const { data, error } = await supabaseAdmin
    .from('orders').update(updates).eq('order_id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
