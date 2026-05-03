import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://portal.steadfast.com.bd/public-api/v1'

function headers(apiKey: string, secretKey: string) {
  return { 'Api-Key': apiKey, 'Secret-Key': secretKey, 'Content-Type': 'application/json' }
}

/* POST /api/courier/steadfast — create consignment */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apiKey, secretKey, ...payload } = body

    if (!apiKey || !secretKey) return NextResponse.json({ error: 'API credentials missing' }, { status: 400 })

    const res = await fetch(`${BASE}/create_order`, {
      method: 'POST',
      headers: headers(apiKey, secretKey),
      body: JSON.stringify({
        invoice:           payload.invoice,
        recipient_name:    payload.recipientName,
        recipient_phone:   payload.recipientPhone,
        recipient_address: payload.recipientAddress,
        cod_amount:        payload.codAmount ?? 0,
        note:              payload.note ?? '',
      }),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.message ?? 'Steadfast error' }, { status: res.status })

    return NextResponse.json({
      consignmentId: data.consignment?.id,
      trackingCode:  data.consignment?.tracking_code,
      status:        data.consignment?.status ?? 'pending',
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/* GET /api/courier/steadfast/track?code=XX&consignment=YY */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const consignmentId = searchParams.get('consignment')
    const apiKey        = req.headers.get('x-api-key')    ?? searchParams.get('apiKey') ?? ''
    const secretKey     = req.headers.get('x-secret-key') ?? searchParams.get('secretKey') ?? ''

    if (!consignmentId) return NextResponse.json({ error: 'consignment required' }, { status: 400 })

    const res = await fetch(`${BASE}/status_by_cid/${consignmentId}`, {
      headers: headers(apiKey, secretKey),
    })
    const data = await res.json()

    return NextResponse.json({ status: data.delivery_status ?? 'pending', raw: data })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
