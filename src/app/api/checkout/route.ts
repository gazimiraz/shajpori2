import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: NextRequest) {
  const { cartItems, userId, guestEmail, shippingAddress } = await req.json()
  if (!cartItems?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

  const subtotal: number = cartItems.reduce((s: number, i: { qty: number; price: number }) => s + i.qty * i.price, 0)
  const delivery_charge = subtotal >= 2000 ? 0 : 80

  const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
    user_id: userId || null, guest_email: guestEmail || null,
    items_ordered: cartItems.map((i: { product_id:string; name:string; size:string; color?:string; qty:number; price:number }) => ({ product_id:i.product_id, name:i.name, size:i.size, color:i.color, qty:i.qty, unit_price:i.price, total_price:i.qty*i.price })),
    subtotal, delivery_charge, discount_amount:0, tax_amount:0, total_amount: subtotal+delivery_charge,
    shipping_address: shippingAddress||{}, status:'Pending', payment_status:'Unpaid', payment_method:'stripe',
  }).select().single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  const lineItems = cartItems.map((item: { name:string; qty:number; price:number }) => ({
    price_data: { currency:'bdt', product_data:{ name:item.name }, unit_amount: Math.round(item.price*100) }, quantity: item.qty,
  }))
  if (delivery_charge > 0) lineItems.push({ price_data:{ currency:'bdt', product_data:{ name:'Delivery Charge' }, unit_amount:delivery_charge*100 }, quantity:1 })

  const session = await stripe.checkout.sessions.create({
    payment_method_types:['card'], line_items:lineItems, mode:'payment',
    customer_email: guestEmail||undefined,
    success_url:`${process.env.NEXT_PUBLIC_APP_URL}/order/success?order_id=${order.order_id}`,
    cancel_url:`${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    metadata:{ order_id: order.order_id },
  })

  await supabaseAdmin.from('orders').update({ stripe_session_id: session.id }).eq('order_id', order.order_id)
  return NextResponse.json({ url: session.url, order_id: order.order_id })
}
