import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  let event: Stripe.Event
  try { event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!) }
  catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }) }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.metadata?.order_id) {
      await supabaseAdmin.from('orders').update({ status:'Confirmed', payment_status:'Paid', stripe_payment_intent: session.payment_intent as string, paid_at: new Date().toISOString(), confirmed_at: new Date().toISOString() }).eq('order_id', session.metadata.order_id)
    }
  }
  return NextResponse.json({ received: true })
}
