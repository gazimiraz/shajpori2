import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api-hermes.pathao.com/aladdin/api/v1'

/* POST /api/courier/pathao — create order */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apiKey, apiSecret, storeId, ...payload } = body

    if (!apiKey || !apiSecret) return NextResponse.json({ error: 'Pathao credentials missing' }, { status: 400 })

    // Step 1: get access token
    const tokenRes = await fetch(`${BASE}/issue-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: apiKey, client_secret: apiSecret, grant_type: 'client_credentials' }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) return NextResponse.json({ error: tokenData.message ?? 'Auth failed' }, { status: 401 })

    const accessToken = tokenData.access_token

    // Step 2: create order
    const orderRes = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        store_id:          storeId,
        merchant_order_id: payload.invoice,
        recipient_name:    payload.recipientName,
        recipient_phone:   payload.recipientPhone,
        recipient_address: payload.recipientAddress,
        recipient_city:    1,      // 1 = Dhaka (update per city)
        recipient_zone:    1,
        delivery_type:     48,     // 48h standard
        item_type:         2,      // clothing
        special_instruction: payload.note ?? '',
        item_quantity:     1,
        item_weight:       payload.weight ?? 0.5,
        amount_to_collect: payload.codAmount ?? 0,
        item_description:  payload.note ?? '',
      }),
    })
    const orderData = await orderRes.json()
    if (!orderRes.ok) return NextResponse.json({ error: orderData.message ?? 'Pathao order error' }, { status: orderRes.status })

    return NextResponse.json({
      consignmentId: orderData.data?.order_id,
      trackingCode:  orderData.data?.consignment_id,
      status:        'pending',
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/* GET /api/courier/pathao/track */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const consignmentId = searchParams.get('consignment')
  // Pathao tracking requires re-auth — return pending for now
  return NextResponse.json({ status: 'pending', trackingCode: consignmentId })
}
