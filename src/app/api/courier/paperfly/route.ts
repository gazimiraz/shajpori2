import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://paperfly.com.bd/merchant/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apiKey, apiSecret, ...payload } = body

    if (!apiKey || !apiSecret) return NextResponse.json({ error: 'Paperfly credentials missing' }, { status: 400 })

    const res = await fetch(`${BASE}/AddOrder/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'UserName': apiKey,
        'ApiKey': apiSecret,
      },
      body: JSON.stringify({
        OrderId:          payload.invoice,
        RecipientName:    payload.recipientName,
        RecipientMobile:  payload.recipientPhone,
        RecipientAddress: payload.recipientAddress,
        CODAmount:        payload.codAmount ?? 0,
        ProductDetails:   payload.note ?? '',
        Weight:           payload.weight ?? 0.5,
        PackageType:      'parcel',
      }),
    })

    const data = await res.json()
    if (!res.ok || data.success === false) {
      return NextResponse.json({ error: data.message ?? 'Paperfly error' }, { status: 400 })
    }

    return NextResponse.json({
      consignmentId: data.tracking_code ?? data.TrackingCode,
      trackingCode:  data.tracking_code ?? data.TrackingCode,
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
    const res = await fetch(`${BASE}/TrackOrder/?tracking_code=${code}`, {
      headers: {
        'UserName': apiKey,
        'ApiKey':   apiSecret,
      },
    })
    const data = await res.json()
    const raw  = data?.data ?? data
    const status = raw?.delivery_status ?? raw?.status ?? 'pending'
    return NextResponse.json({ status, raw })
  } catch {
    return NextResponse.json({ status: 'pending' })
  }
}
