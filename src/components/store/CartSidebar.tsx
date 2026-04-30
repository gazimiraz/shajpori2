'use client'
// src/components/store/CartSidebar.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function CartSidebar() {
  const { items, isOpen, closeCart, updateQty, removeItem, subtotal, delivery, total } = useCartStore()
  const router = useRouter()
  const sub = subtotal()
  const del = delivery()
  const tot = total()

  const handleCheckout = async () => {
    if (!items.length) return
    closeCart()
    router.push('/checkout')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-[440px] max-w-[95vw] bg-white z-50 flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-pink" size={20} />
                <h2 className="font-display text-xl font-bold text-charcoal">Your Bag</h2>
                {items.length > 0 && (
                  <span className="bg-pink/10 text-pink text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.reduce((s, i) => s + i.qty, 0)} items
                  </span>
                )}
              </div>
              <motion.button
                onClick={closeCart}
                className="text-muted hover:text-charcoal transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-4 text-center py-16"
                  >
                    <div className="w-20 h-20 bg-pale-pink rounded-full flex items-center justify-center text-4xl">🛍️</div>
                    <p className="font-display text-xl font-bold text-charcoal">Your bag is empty</p>
                    <p className="text-sm text-muted">Discover something beautiful</p>
                    <motion.button
                      onClick={closeCart}
                      className="mt-2 bg-pink text-white rounded-full px-6 py-2.5 text-sm font-semibold"
                      whileHover={{ backgroundColor: '#FF1493' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Continue Shopping
                    </motion.button>
                  </motion.div>
                ) : (
                  items.map(item => (
                    <motion.div
                      key={item.key}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-4 py-4 border-b border-border last:border-0"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-2xl bg-pale-pink flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                        {item.image_url
                          ? <Image src={item.image_url} alt={item.name} width={80} height={80} className="object-cover w-full h-full" />
                          : <span>👗</span>
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-charcoal leading-tight line-clamp-2">{item.name}</p>
                        <p className="text-xs text-muted mt-0.5">
                          Size: {item.size}
                          {item.color && ` · ${item.color}`}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty controls */}
                          <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1">
                            <motion.button
                              onClick={() => updateQty(item.key, item.qty - 1)}
                              className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-pink hover:bg-pink hover:text-white transition-colors"
                              whileTap={{ scale: 0.85 }}
                            >
                              <Minus size={12} />
                            </motion.button>
                            <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                            <motion.button
                              onClick={() => updateQty(item.key, item.qty + 1)}
                              className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-pink hover:bg-pink hover:text-white transition-colors"
                              whileTap={{ scale: 0.85 }}
                            >
                              <Plus size={12} />
                            </motion.button>
                          </div>

                          {/* Price + Remove */}
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-charcoal">
                              ৳{(item.price * item.qty).toLocaleString()}
                            </span>
                            <motion.button
                              onClick={() => { removeItem(item.key); toast.success('Item removed') }}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                              whileTap={{ scale: 0.85 }}
                            >
                              <Trash2 size={15} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-border bg-gray-50/50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-medium">৳{sub.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Delivery</span>
                    <span className={del === 0 ? 'text-green-600 font-semibold' : 'font-medium'}>
                      {del === 0 ? 'FREE ✓' : `৳${del}`}
                    </span>
                  </div>
                  {del > 0 && (
                    <p className="text-xs text-muted">Add ৳{(2000 - sub).toLocaleString()} more for free delivery</p>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="font-display text-lg">৳{tot.toLocaleString()}</span>
                  </div>
                </div>

                <motion.button
                  onClick={handleCheckout}
                  className="w-full bg-pink text-white rounded-full py-3.5 font-semibold text-sm flex items-center justify-center gap-2"
                  whileHover={{ backgroundColor: '#FF1493' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </motion.button>
                <p className="text-center text-xs text-muted mt-3">🔒 Secured by Stripe · bKash · Nagad · COD</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
