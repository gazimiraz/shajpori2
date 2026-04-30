import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]; isOpen: boolean
  addItem: (item: Omit<CartItem,'key'>) => void
  removeItem: (key:string) => void
  updateQty: (key:string, qty:number) => void
  clearCart: () => void
  openCart: () => void; closeCart: () => void; toggleCart: () => void
  totalItems: () => number; subtotal: () => number; delivery: () => number; total: () => number
}

export const useCartStore = create<CartStore>()(persist((set,get) => ({
  items:[], isOpen:false,
  addItem: (item) => {
    const key = `${item.product_id}_${item.size}_${item.color||''}`
    const existing = get().items.find(i=>i.key===key)
    if(existing) set(s=>({items:s.items.map(i=>i.key===key?{...i,qty:i.qty+item.qty}:i)}))
    else set(s=>({items:[...s.items,{...item,key}]}))
  },
  removeItem: (key) => set(s=>({items:s.items.filter(i=>i.key!==key)})),
  updateQty: (key,qty) => { if(qty<=0){get().removeItem(key);return}; set(s=>({items:s.items.map(i=>i.key===key?{...i,qty}:i)})) },
  clearCart: () => set({items:[]}),
  openCart: () => set({isOpen:true}), closeCart: () => set({isOpen:false}), toggleCart: () => set(s=>({isOpen:!s.isOpen})),
  totalItems: () => get().items.reduce((s,i)=>s+i.qty,0),
  subtotal: () => get().items.reduce((s,i)=>s+i.price*i.qty,0),
  delivery: () => get().subtotal()>=2000?0:80,
  total: () => get().subtotal()+get().delivery(),
}), { name:'shajpori-cart', storage:createJSONStorage(()=>localStorage), partialize:(s)=>({items:s.items}) }))
