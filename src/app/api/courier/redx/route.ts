import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://openapi.redx.com.bd/v1.0.0-beta'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apiKey, storeId, ...payload } = body

    if (!apiKey) return NextResponse.json({ error: 'RedX API key missing' }, { status: 400 })

    const res = await fetch(`${BASE}/parcel`, {
      method: 'POST',
      headers: { 'API-ACCESS-TOKEN': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name:    payload.recipientName,
        customer_phone:   payload.recipientPhone,
        delivery_area:    payload.recipientAddress,
        delivery_area_id: 1,
        merchant_invoice_id: payload.invoice,
        cash_collection_amount: payload.codAmount ?? 0,
        parcel_weight:    (payload.weight ?? 0.5) * 1000, // grams
        instruction:      payload.note ?? '',
        value:            payload.codAmount ?? 0,
      }),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.message ?? 'RedX error' }, { status: res.status })

    return NextResponse.json({
      consignmentId: data.parcel?.parcel_id,
      trackingCode:  data.parcel?.tracking_id,
      status:        'pending',
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const apiKey = searchParams.get('apiKey') ?? ''
  try {
    const res = await fetch(`${BASE}/parcel/info/${code}`, {
      headers: { 'API-ACCESS-TOKEN': `Bearer ${apiKey}` },
    })
    const data = await res.json()
    return NextResponse.json({ status: data.parcel?.status ?? 'pending', raw: data })
  } catch {
    return NextResponse.json({ status: 'pending' })
  }
}
