'use client'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const BRAND = '#C2185B'

function SuccessInner() {
  const params = useSearchParams()
  const orderId = params.get('order_id')
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(d => setOrderNumber(d.data?.order_number || null))
      .catch(() => {})
  }, [orderId])

  return (
    <div className="min-h-screen bg-[#FFF8F9] flex items-center justify-center px-4 py-16">
      <motion.div
        className="bg-white border border-gray-100 shadow-sm p-10 text-center max-w-md w-full"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>

        <motion.div className="w-16 h-16 bg-green-50 flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 18 }}>
          <CheckCircle className="text-green-500" size={32} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-[10px] font-bold tracking-[.25em] uppercase text-gray-400 mb-2">Order Placed</p>
          <h1 className="font-display text-[28px] font-black text-gray-900 mb-3">Thank you!</h1>
          <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
            Your order has been confirmed. We&apos;ll prepare it for shipping within 1–2 business days.
          </p>

          {orderNumber && (
            <div className="flex items-center justify-center gap-2 bg-[#FFF0F4] px-5 py-3 mb-6">
              <Package size={14} style={{ color: BRAND }} />
              <span className="text-[13px] font-bold font-mono text-gray-800">{orderNumber}</span>
            </div>
          )}

          <div className="bg-gray-50 p-4 text-left mb-7 space-y-2.5 text-[12px] text-gray-500">
            <p>📧 Confirmation email sent to your inbox.</p>
            <p>🚚 Delivery in 3–5 days (Dhaka) or 5–7 days nationwide.</p>
            <p>📞 Questions? Call <span className="font-semibold text-gray-700">01700-000000</span></p>
          </div>

          <div className="flex gap-3">
            <Link href="/products" className="flex-1">
              <motion.span className="flex items-center justify-center gap-2 border border-gray-200 py-3 text-[12px] font-bold tracking-widest uppercase text-gray-700 hover:border-gray-400 transition-colors"
                whileTap={{ scale: 0.97 }}>
                Shop More <ArrowRight size={12} />
              </motion.span>
            </Link>
            <Link href="/" className="flex-1">
              <motion.span className="flex items-center justify-center gap-2 py-3 text-[12px] font-bold tracking-widest uppercase text-white transition-opacity hover:opacity-90"
                style={{ background: BRAND }} whileTap={{ scale: 0.97 }}>
                Home
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF8F9] flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-100 animate-pulse" />
      </div>
    }>
      <SuccessInner />
    </Suspense>
  )
}
