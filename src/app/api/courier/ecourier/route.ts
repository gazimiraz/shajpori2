import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://ecourier.com.bd/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apiKey, apiSecret, storeId, ...payload } = body

    if (!apiKey || !apiSecret) return NextResponse.json({ error: 'eCourier credentials missing' }, { status: 400 })

    const res = await fetch(`${BASE}/parcel`, {
      method: 'POST',
      headers: {
        'API-KEY':    apiKey,
        'API-SECRET': apiSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoice:           payload.invoice,
        recipient_name:    payload.recipientName,
        recipient_mobile:  payload.recipientPhone,
        recipient_address: payload.recipientAddress,
        cod_amount:        payload.codAmount ?? 0,
        product_details:   payload.note ?? '',
        weight:            payload.weight ?? 0.5,
        store_id:          storeId ?? '',
        delivery_type:     'regular',
      }),
    })

    const data = await res.json()
    if (!res.ok || data.code === 0) {
      return NextResponse.json({ error: data.message ?? 'eCourier error' }, { status: 400 })
    }

    return NextResponse.json({
      consignmentId: data.tracking ?? data.consignment_id,
      trackingCode:  data.tracking ?? data.consignment_id,
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
  const apiSecret = searchParams.get('apiSecret') ?? ''

  try {
    const res = await fetch(`${BASE}/parceltrack?tracking=${code}`, {
      headers: {
        'API-KEY':    apiKey,
        'API-SECRET': apiSecret,
      },
    })
    const data = await res.json()
    const status = data?.parcel_status ?? data?.status ?? 'pending'
    return NextResponse.json({ status, raw: data })
  } catch {
    return NextResponse.json({ status: 'pending' })
  }
}
