'use client'
// src/app/(store)/checkout/page.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Lock, ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const BRAND = '#D81B60'
const BRAND_GRADIENT = 'linear-gradient(135deg, #D81B60, #F06292)'

interface AddressForm {
  full_name: string; phone: string; street: string
  city: string; district: string; postal_code: string
}

const DISTRICTS = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh']

export default function CheckoutPage() {
  const { items, subtotal, delivery, total, clearCart } = useCartStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState<AddressForm>({
    full_name: '', phone: '', street: '', city: 'Dhaka', district: 'Dhaka', postal_code: ''
  })

  const sub = subtotal()
  const del = delivery()
  const tot = total()

  const set = (k: keyof AddressForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress(a => ({ ...a, [k]: e.target.value }))

  const handleCheckout = async () => {
    const { full_name, phone, street, city, district, postal_code } = address
    if (!full_name || !phone || !street || !city || !postal_code) {
      toast.error('Please fill in all required fields')
      return
    }
    if (items.length === 0) { toast.error('Your bag is empty'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items.map(i => ({
            product_id: i.product_id,
            variant_id: i.variant_id,
            name: i.name,
            size: i.size,
            color: i.color,
            qty: i.qty,
            price: i.price,
          })),
          shippingAddress: { name: full_name, street, city, district, postal_code, phone },
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Redirect to Stripe Checkout
      if (data.url) {
        clearCart()
        window.location.href = data.url
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed. Please try again.')
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand">
        <ShoppingBag size={32} />
      </div>
      <h2 className="font-display text-3xl font-black text-gray-900 mb-4">Your bag is empty</h2>
      <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
      <Link href="/products">
        <motion.span className="inline-flex items-center gap-2 text-white rounded-full px-8 py-3.5 text-[13px] font-bold tracking-widest uppercase shadow-md hover:shadow-lg transition-shadow"
          style={{ backgroundImage: BRAND_GRADIENT }}
          whileTap={{ scale: 0.98 }}>
          Continue Shopping
        </motion.span>
      </Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/products" className="inline-flex items-center gap-2 text-[13px] font-bold tracking-widest uppercase text-gray-400 hover:text-brand transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <h1 className="font-display text-4xl font-black text-gray-900 mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Address Form */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="font-display text-2xl font-black text-gray-900 mb-6">Delivery Address</h2>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Full Name *</label>
                  <input type="text" value={address.full_name} onChange={set('full_name')} placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-[13px] focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Phone *</label>
                  <input type="tel" value={address.phone} onChange={set('phone')} placeholder="+880 17XX XXXXXX"
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-[13px] focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Street Address *</label>
                <input type="text" value={address.street} onChange={set('street')} placeholder="House no., road, area"
                  className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-[13px] focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all" />
              </div>
              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">City *</label>
                  <input type="text" value={address.city} onChange={set('city')} placeholder="City"
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-[13px] focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">District *</label>
                  <select value={address.district} onChange={set('district')}
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-[13px] focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all">
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Postal Code</label>
                  <input type="text" value={address.postal_code} onChange={set('postal_code')} placeholder="1207"
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-[13px] focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="font-display text-2xl font-black text-gray-900 mb-3">Payment</h2>
            <p className="text-[13px] text-gray-500 mb-5">You will be redirected to Stripe's secure checkout page.</p>
            <div className="flex flex-wrap gap-2.5">
              {['Visa', 'Mastercard', 'bKash', 'Nagad', 'Cash on Delivery'].map(m => (
                <span key={m} className="text-[11px] font-bold tracking-widest uppercase bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-gray-600">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sticky top-32">
            <h2 className="font-display text-2xl font-black text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-5 mb-8">
              {items.map(item => (
                <div key={item.key} className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                    {item.name.includes('Dress') ? '👗' : item.name.includes('Bag') || item.name.includes('Tote') ? '👜' : '💎'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 leading-tight truncate mb-0.5">{item.name}</p>
                    <p className="text-[12px] text-gray-500">{item.size}{item.color ? ` · ${item.color}` : ''} <span className="text-brand font-semibold mx-1">×</span> {item.qty}</p>
                  </div>
                  <span className="text-[14px] font-black text-gray-900 shrink-0">৳{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-3 text-[13px] font-medium">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="text-gray-900">৳{sub.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span className={del === 0 ? 'text-brand font-bold' : 'text-gray-900'}>{del === 0 ? 'FREE' : `৳${del}`}</span>
              </div>
              <div className="flex justify-between font-black text-[16px] pt-4 border-t border-gray-100 mt-2">
                <span className="text-gray-900">Total</span>
                <span className="font-display text-2xl text-transparent bg-clip-text" style={{ backgroundImage: BRAND_GRADIENT }}>৳{tot.toLocaleString()}</span>
              </div>
            </div>

            <motion.button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full mt-8 text-white rounded-full py-4 text-[13px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-60 shadow-md hover:shadow-lg transition-shadow"
              style={{ backgroundImage: BRAND_GRADIENT }}
              whileTap={{ scale:0.98 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={15} />
                  Pay ৳{tot.toLocaleString()}
                </>
              )}
            </motion.button>

            <p className="text-center text-[11px] font-medium tracking-wide text-gray-400 mt-5 flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-brand" /> Secured by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
