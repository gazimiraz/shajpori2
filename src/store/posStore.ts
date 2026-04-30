// src/store/posStore.ts
import { create } from 'zustand'
import type { POSCartItem, POSCart, PaymentMethod, POSSession } from '@/types/pos'
import toast from 'react-hot-toast'

interface POSStore {
  cart: POSCartItem[]
  customer_name: string
  customer_phone: string
  discount_pct: number
  payment_method: PaymentMethod
  amount_tendered: number
  session: POSSession | null
  isSessionOpen: boolean

  // Cart actions
  addItem: (item: Omit<POSCartItem, 'total_price'>) => void
  removeItem: (key: string) => void
  updateQty: (key: string, qty: number) => void
  updateItemDiscount: (key: string, discount_pct: number) => void
  clearCart: () => void

  // Order-level
  setCustomer: (name: string, phone: string) => void
  setDiscount: (pct: number) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setAmountTendered: (amount: number) => void

  // Session
  setSession: (session: POSSession | null) => void

  // Computed
  subtotal: () => number
  discountAmt: () => number
  deliveryCharge: () => number
  taxAmount: () => number
  total: () => number
  change: () => number
  cartKey: (item: { product_id: string; size: string; colour: string }) => string
}

export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  customer_name: '',
  customer_phone: '',
  discount_pct: 0,
  payment_method: 'cash',
  amount_tendered: 0,
  session: null,
  isSessionOpen: false,

  cartKey: (item) => `${item.product_id}_${item.size}_${item.colour}`,

  addItem: (item) => {
    const key = get().cartKey(item)
    const existing = get().cart.find(i => get().cartKey(i) === key)

    if (existing) {
      if (existing.qty >= existing.max_stock) {
        toast.error('Maximum stock reached for this item')
        return
      }
      set(state => ({
        cart: state.cart.map(i =>
          get().cartKey(i) === key
            ? { ...i, qty: i.qty + item.qty, total_price: (i.qty + item.qty) * i.unit_price }
            : i
        )
      }))
    } else {
      const newItem: POSCartItem = {
        ...item,
        total_price: item.qty * item.unit_price,
      }
      set(state => ({ cart: [...state.cart, newItem] }))
    }
    toast.success(`${item.name} added`, { duration: 1200 })
  },

  removeItem: (key) => set(state => ({ cart: state.cart.filter(i => state.cartKey(i) !== key) })),

  updateQty: (key, qty) => {
    if (qty <= 0) { get().removeItem(key); return }
    set(state => ({
      cart: state.cart.map(i => {
        if (state.cartKey(i) !== key) return i
        const newQty = Math.min(qty, i.max_stock)
        return { ...i, qty: newQty, total_price: newQty * i.unit_price }
      })
    }))
  },

  updateItemDiscount: (key, discount_pct) => {
    set(state => ({
      cart: state.cart.map(i => {
        if (state.cartKey(i) !== key) return i
        const discounted = i.unit_price * (1 - discount_pct / 100)
        return { ...i, discount_pct, total_price: Math.round(i.qty * discounted) }
      })
    }))
  },

  clearCart: () => set({
    cart: [], customer_name: '', customer_phone: '',
    discount_pct: 0, amount_tendered: 0, payment_method: 'cash'
  }),

  setCustomer: (name, phone) => set({ customer_name: name, customer_phone: phone }),
  setDiscount: (pct) => set({ discount_pct: Math.min(100, Math.max(0, pct)) }),
  setPaymentMethod: (method) => set({ payment_method: method }),
  setAmountTendered: (amount) => set({ amount_tendered: amount }),
  setSession: (session) => set({ session, isSessionOpen: !!session }),

  subtotal: () => get().cart.reduce((s, i) => s + i.unit_price * i.qty, 0),
  discountAmt: () => {
    const sub = get().subtotal()
    const disc = get().discount_pct
    return Math.round(sub * disc / 100)
  },
  deliveryCharge: () => 0, // POS sales have no delivery
  taxAmount: () => 0,      // Tax included in price for Bangladesh
  total: () => {
    const sub = get().subtotal()
    const disc = get().discountAmt()
    return sub - disc
  },
  change: () => {
    const tendered = get().amount_tendered
    const total = get().total()
    return Math.max(0, tendered - total)
  },
}))
