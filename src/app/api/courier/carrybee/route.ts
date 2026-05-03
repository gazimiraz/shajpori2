import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://carrybee.com.bd/api/v1'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apiKey, apiSecret, ...payload } = body

    if (!apiKey) return NextResponse.json({ error: 'Carrybee API key missing' }, { status: 400 })

    const res = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        ...(apiSecret ? { 'X-Secret-Key': apiSecret } : {}),
      },
      body: JSON.stringify({
        merchant_order_id:  payload.invoice,
        recipient_name:     payload.recipientName,
        recipient_phone:    payload.recipientPhone,
        recipient_address:  payload.recipientAddress,
        cod_amount:         payload.codAmount ?? 0,
        product_description:payload.note ?? '',
        weight:             payload.weight ?? 0.5,
        delivery_type:      'regular',
      }),
    })

    const data = await res.json()
    if (!res.ok || data.success === false) {
      return NextResponse.json({ error: data.message ?? 'Carrybee error' }, { status: 400 })
    }

    return NextResponse.json({
      consignmentId: data.order?.tracking_id ?? data.tracking_id ?? data.id,
      trackingCode:  data.order?.tracking_id ?? data.tracking_id ?? data.id,
      status:        'pending',
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code      = searchParams.get('consignment') ?? searchParams.get('code') ?? ''
  const apiKey    = searchParams.get('apiKey') ?? ''

  try {
    const res = await fetch(`${BASE}/orders/track/${code}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    const data = await res.json()
    const status = data?.order?.status ?? data?.status ?? 'pending'
    return NextResponse.json({ status, raw: data })
  } catch {
    return NextResponse.json({ status: 'pending' })
  }
}
