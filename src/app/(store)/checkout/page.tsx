'use client'
// src/app/(store)/checkout/page.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

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
      <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
      <h2 className="font-display text-2xl font-bold text-charcoal mb-3">Your bag is empty</h2>
      <Link href="/products">
        <motion.span className="inline-flex items-center gap-2 bg-pink text-white rounded-full px-6 py-3 text-sm font-semibold"
          whileHover={{ backgroundColor:'#FF1493' }}>
          Continue Shopping
        </motion.span>
      </Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted hover:text-pink transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <h1 className="font-display text-3xl font-black text-charcoal mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Address Form */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-display text-lg font-bold text-charcoal mb-5">Delivery Address</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Full Name *</label>
                  <input type="text" value={address.full_name} onChange={set('full_name')} placeholder="Your full name"
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-pink focus:ring-2 focus:ring-pink/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Phone *</label>
                  <input type="tel" value={address.phone} onChange={set('phone')} placeholder="+880 17XX XXXXXX"
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-pink focus:ring-2 focus:ring-pink/10 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Street Address *</label>
                <input type="text" value={address.street} onChange={set('street')} placeholder="House no., road, area"
                  className="w-full border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-pink focus:ring-2 focus:ring-pink/10 transition-all" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">City *</label>
                  <input type="text" value={address.city} onChange={set('city')} placeholder="City"
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-pink focus:ring-2 focus:ring-pink/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">District *</label>
                  <select value={address.district} onChange={set('district')}
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-pink transition-all">
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Postal Code</label>
                  <input type="text" value={address.postal_code} onChange={set('postal_code')} placeholder="1207"
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-pink focus:ring-2 focus:ring-pink/10 transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-display text-lg font-bold text-charcoal mb-2">Payment</h2>
            <p className="text-sm text-muted mb-4">You will be redirected to Stripe's secure checkout page.</p>
            <div className="flex flex-wrap gap-3">
              {['Visa', 'Mastercard', 'bKash', 'Nagad', 'Cash on Delivery'].map(m => (
                <span key={m} className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 font-medium text-muted">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-border p-6 sticky top-24">
            <h2 className="font-display text-lg font-bold text-charcoal mb-4">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {items.map(item => (
                <div key={item.key} className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-pale-pink rounded-xl flex items-center justify-center text-xl shrink-0">
                    {item.name.includes('Dress') ? '👗' : item.name.includes('Bag') || item.name.includes('Tote') ? '👜' : '💎'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal leading-tight truncate">{item.name}</p>
                    <p className="text-xs text-muted">{item.size}{item.color ? ` · ${item.color}` : ''} · ×{item.qty}</p>
                  </div>
                  <span className="text-sm font-bold text-charcoal shrink-0">৳{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>৳{sub.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery</span>
                <span className={del === 0 ? 'text-green-600 font-semibold' : ''}>{del === 0 ? 'FREE ✓' : `৳${del}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span className="font-display text-xl">৳{tot.toLocaleString()}</span>
              </div>
            </div>

            <motion.button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full mt-5 bg-pink text-white rounded-full py-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              whileHover={{ backgroundColor:'#FF1493' }}
              whileTap={{ scale:0.98 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={15} />
                  Pay ৳{tot.toLocaleString()} Securely
                </>
              )}
            </motion.button>

            <p className="text-center text-xs text-muted mt-3">
              🔒 Secured by Stripe · Your data is never shared
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
