'use client'
import React, { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Minus, X, ShoppingCart, User, Phone,
  Printer, CheckCircle, Tag, Percent, ChevronDown,
  Facebook, Instagram, MessageCircle, Store, Bike,
  CreditCard, Banknote, Smartphone, RotateCcw, Clock,
  Package, Hash
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ── Types ─────────────────────────────────────────────────── */
const BRAND = '#C2185B'

type OrderSource = 'Walk-in' | 'Facebook' | 'Instagram' | 'WhatsApp' | 'Phone'
type PayMethod   = 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Card' | 'COD'
type DeliveryType = 'Walk-in' | 'Home Delivery'

interface POSProduct {
  id: string; name: string; sku: string; category: string
  price: number; stock: number; colors: string[]; sizes: string[]
  emoji: string
}
interface CartItem extends POSProduct {
  qty: number; selectedColor: string; selectedSize: string
}
interface CompletedOrder {
  id: string; orderNo: string; customer: string; phone: string
  source: OrderSource; items: CartItem[]; subtotal: number
  discount: number; deliveryCharge: number; total: number
  payment: PayMethod; delivery: DeliveryType; address: string
  note: string; time: string; status: 'Completed' | 'Held'
}

/* ── Mock products ─────────────────────────────────────────── */
const PRODUCTS: POSProduct[] = [
  { id:'p1', name:'Bloom Garden Midi Dress',     sku:'SJP-DR-001', category:'Dress',     price:3200, stock:45, colors:['Blush Pink','Sage Green','Sky Blue'],   sizes:['S','M','L','XL'],       emoji:'👗' },
  { id:'p2', name:'Sunset Ruffle Maxi',           sku:'SJP-DR-002', category:'Dress',     price:4100, stock:24, colors:['Coral Orange','Deep Burgundy'],          sizes:['S','M','L'],            emoji:'👗' },
  { id:'p3', name:'Cotton Candy Mini Dress',      sku:'SJP-DR-003', category:'Dress',     price:2400, stock:88, colors:['Cotton Candy Pink','Lavender Mist'],     sizes:['XS','S','M','L','XL'],  emoji:'👗' },
  { id:'p4', name:'Embroidered Kurti Set',        sku:'SJP-DR-004', category:'Dress',     price:3200, stock:35, colors:['Dusty Rose','Sage Green'],               sizes:['S','M','L','XL','XXL'], emoji:'👗' },
  { id:'p5', name:'Pearl Quilted Shoulder Bag',   sku:'SJP-BG-001', category:'Bag',       price:5800, stock:18, colors:['Ivory White','Black Onyx','Dusty Rose'], sizes:['One Size'],             emoji:'👜' },
  { id:'p6', name:'Hot Pink Mini Tote',           sku:'SJP-BG-002', category:'Bag',       price:3500, stock:33, colors:['Bubblegum Pink','Black Onyx'],           sizes:['One Size'],             emoji:'👜' },
  { id:'p7', name:'Woven Straw Beach Bag',        sku:'SJP-BG-003', category:'Bag',       price:2800, stock:22, colors:['Natural','Black'],                       sizes:['One Size'],             emoji:'👜' },
  { id:'p8', name:'Leather Crossbody Sling',      sku:'SJP-BG-004', category:'Bag',       price:4200, stock:15, colors:['Black','Caramel'],                       sizes:['One Size'],             emoji:'👜' },
  { id:'p9', name:'Pearl Drop Earrings',          sku:'SJP-JWL-001',category:'Jewelry',   price:890,  stock:60, colors:['Gold','Silver'],                         sizes:['One Size'],             emoji:'💍' },
  { id:'p10',name:'Gold Chain Necklace',          sku:'SJP-JWL-002',category:'Jewelry',   price:1400, stock:45, colors:['Gold'],                                  sizes:['One Size'],             emoji:'💍' },
  { id:'p11',name:'Crystal Charm Bracelet Set',   sku:'SJP-JWL-003',category:'Jewelry',   price:1200, stock:95, colors:['Rose Gold','Silver','Gold'],             sizes:['One Size'],             emoji:'💍' },
  { id:'p12',name:'Silk Scarf — Floral Print',    sku:'SJP-AC-001', category:'Accessory', price:1800, stock:40, colors:['Multicolor','Blush Pink'],               sizes:['One Size'],             emoji:'🧣' },
  { id:'p13',name:'Beaded Hair Clip Set',         sku:'SJP-AC-002', category:'Accessory', price:650,  stock:70, colors:['Multicolor'],                            sizes:['One Size'],             emoji:'✨' },
  { id:'p14',name:'Embroidered Clutch Wallet',    sku:'SJP-AC-003', category:'Accessory', price:2200, stock:28, colors:['Blush Pink','Ivory','Black'],            sizes:['One Size'],             emoji:'👛' },
]

const SOURCE_CONFIG: Record<OrderSource,{ icon: React.ElementType; color: string; bg: string }> = {
  'Walk-in':  { icon: Store,          color:'#059669', bg:'#ECFDF5' },
  'Facebook': { icon: Facebook,       color:'#1877F2', bg:'#EFF6FF' },
  'Instagram':{ icon: Instagram,      color:'#E1306C', bg:'#FFF0F4' },
  'WhatsApp': { icon: MessageCircle,  color:'#25D366', bg:'#F0FDF4' },
  'Phone':    { icon: Phone,          color:'#7C3AED', bg:'#F5F3FF' },
}
const PAY_CONFIG: Record<PayMethod,{ icon: React.ElementType; color: string }> = {
  Cash:   { icon: Banknote,    color:'#059669' },
  bKash:  { icon: Smartphone,  color:'#E2136E' },
  Nagad:  { icon: Smartphone,  color:'#F7941D' },
  Rocket: { icon: Smartphone,  color:'#8B2FC9' },
  Card:   { icon: CreditCard,  color:'#1565C0' },
  COD:    { icon: Bike,        color:'#D97706' },
}

const CATEGORIES = ['All', 'Dress', 'Bag', 'Jewelry', 'Accessory']

const TODAY_ORDERS_MOCK: CompletedOrder[] = [
  { id:'t1', orderNo:'POS-001', customer:'Nadia Rahman',   phone:'01711-223344', source:'Facebook', items:[], subtotal:6400, discount:200, deliveryCharge:0,   total:6200, payment:'bKash', delivery:'Walk-in',      address:'', note:'FB inbox order', time:'09:15 AM', status:'Completed' },
  { id:'t2', orderNo:'POS-002', customer:'Walk-in Customer',phone:'',            source:'Walk-in',  items:[], subtotal:3200, discount:0,   deliveryCharge:0,   total:3200, payment:'Cash',  delivery:'Walk-in',      address:'', note:'',              time:'10:40 AM', status:'Completed' },
  { id:'t3', orderNo:'POS-003', customer:'Tasnim Akter',   phone:'01812-334455', source:'Instagram',items:[], subtotal:5800, discount:500, deliveryCharge:100, total:5400, payment:'bKash', delivery:'Home Delivery',address:'Mirpur, Dhaka', note:'', time:'11:55 AM', status:'Completed' },
]

function ReceiptModal({ order, onClose }: { order: CompletedOrder; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}>
      <motion.div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden"
        initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9 }}
        onClick={e => e.stopPropagation()}>
        <div className="p-6 font-mono text-[12px]">
          {/* Header */}
          <div className="text-center mb-4 pb-4 border-b border-dashed border-gray-300">
            <p className="text-[18px] font-black tracking-tight" style={{ color: BRAND }}>Shajpori</p>
            <p className="text-gray-500 text-[10px] mt-0.5">beautiful · everytime</p>
            <p className="text-gray-400 text-[10px] mt-1">Dhaka, Bangladesh · 01700-000000</p>
          </div>
          <div className="space-y-0.5 mb-3 text-[11px]">
            <p className="flex justify-between"><span className="text-gray-500">Order #</span><span className="font-bold">{order.orderNo}</span></p>
            <p className="flex justify-between"><span className="text-gray-500">Date</span><span>{new Date().toLocaleDateString('en-BD')} {order.time}</span></p>
            <p className="flex justify-between"><span className="text-gray-500">Customer</span><span>{order.customer}</span></p>
            {order.phone && <p className="flex justify-between"><span className="text-gray-500">Phone</span><span>{order.phone}</span></p>}
            <p className="flex justify-between"><span className="text-gray-500">Source</span><span>{order.source}</span></p>
          </div>
          <div className="border-t border-dashed border-gray-300 my-3 pt-3 space-y-1.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-[11px]">
                <span className="flex-1 pr-2 text-gray-700">{item.name} <span className="text-gray-400">x{item.qty}</span></span>
                <span className="font-semibold">৳{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-300 mt-3 pt-3 space-y-1 text-[11px]">
            <p className="flex justify-between text-gray-500"><span>Subtotal</span><span>৳{order.subtotal.toLocaleString()}</span></p>
            {order.discount > 0 && <p className="flex justify-between text-emerald-600"><span>Discount</span><span>-৳{order.discount.toLocaleString()}</span></p>}
            {order.deliveryCharge > 0 && <p className="flex justify-between text-gray-500"><span>Delivery</span><span>৳{order.deliveryCharge.toLocaleString()}</span></p>}
            <p className="flex justify-between font-black text-[14px] border-t border-dashed border-gray-300 pt-2 mt-1">
              <span>TOTAL</span><span style={{ color: BRAND }}>৳{order.total.toLocaleString()}</span>
            </p>
            <p className="flex justify-between text-gray-500"><span>Payment</span><span>{order.payment}</span></p>
          </div>
          <div className="text-center mt-4 pt-4 border-t border-dashed border-gray-300 text-[10px] text-gray-400">
            <p>Thank you for shopping with Shajpori!</p>
            <p className="mt-0.5">Exchange within 3 days with receipt.</p>
          </div>
        </div>
        <div className="flex gap-2 px-6 pb-5">
          <button onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-600 hover:bg-gray-50">
            <Printer size={14} /> Print
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 text-[12px] font-bold tracking-wide text-white rounded-lg"
            style={{ background: BRAND }}>
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function POSPage() {
  const [cat,         setCat]         = useState('All')
  const [search,      setSearch]      = useState('')
  const [cart,        setCart]        = useState<CartItem[]>([])
  const [customer,    setCustomer]    = useState('')
  const [phone,       setPhone]       = useState('')
  const [source,      setSource]      = useState<OrderSource>('Walk-in')
  const [delivery,    setDelivery]    = useState<DeliveryType>('Walk-in')
  const [address,     setAddress]     = useState('')
  const [deliveryCh,  setDeliveryCh]  = useState(0)
  const [discountType,setDiscountType]= useState<'flat'|'percent'>('flat')
  const [discountVal, setDiscountVal] = useState(0)
  const [payment,     setPayment]     = useState<PayMethod>('Cash')
  const [note,        setNote]        = useState('')
  const [todayOrders, setTodayOrders] = useState<CompletedOrder[]>(TODAY_ORDERS_MOCK)
  const [receipt,     setReceipt]     = useState<CompletedOrder|null>(null)
  const [activeTab,   setActiveTab]   = useState<'pos'|'orders'>('pos')
  const [colorPick,   setColorPick]   = useState<{id:string;color:string;size:string}|null>(null)
  const orderCount = useRef(TODAY_ORDERS_MOCK.length + 1)

  const filtered = useMemo(() =>
    PRODUCTS.filter(p =>
      (cat === 'All' || p.category === cat) &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search))
    ), [cat, search])

  const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0)
  const discountAmt = discountType === 'flat' ? discountVal : Math.round(subtotal * discountVal / 100)
  const total = Math.max(0, subtotal - discountAmt + deliveryCh)

  const addToCart = (p: POSProduct) => {
    if (p.sizes.length > 1 || p.colors.length > 1) {
      setColorPick({ id: p.id, color: p.colors[0], size: p.sizes[0] })
      return
    }
    doAdd(p, p.colors[0] ?? '', p.sizes[0] ?? 'One Size')
  }

  const doAdd = (p: POSProduct, color: string, size: string) => {
    setCart(c => {
      const key = `${p.id}-${color}-${size}`
      const ex = c.find(i => `${i.id}-${i.selectedColor}-${i.selectedSize}` === key)
      if (ex) return c.map(i => `${i.id}-${i.selectedColor}-${i.selectedSize}` === key ? { ...i, qty: i.qty+1 } : i)
      return [...c, { ...p, qty:1, selectedColor:color, selectedSize:size }]
    })
    setColorPick(null)
    toast.success(`${p.name} added`)
  }

  const changeQty = (key: string, delta: number) => {
    setCart(c => c.map(i => `${i.id}-${i.selectedColor}-${i.selectedSize}` === key
      ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }
  const removeItem = (key: string) => setCart(c => c.filter(i => `${i.id}-${i.selectedColor}-${i.selectedSize}` !== key))
  const clearCart  = () => { setCart([]); setDiscountVal(0); setNote(''); setCustomer(''); setPhone('') }

  const placeOrder = (hold = false) => {
    if (cart.length === 0) { toast.error('Cart is empty'); return }
    const orderNo = `POS-${String(orderCount.current).padStart(3,'0')}`
    orderCount.current++
    const order: CompletedOrder = {
      id: 'o'+Date.now(), orderNo,
      customer: customer || 'Walk-in Customer', phone, source,
      items: [...cart], subtotal, discount: discountAmt,
      deliveryCharge: deliveryCh, total, payment, delivery, address, note,
      time: new Date().toLocaleTimeString('en-BD',{hour:'2-digit',minute:'2-digit'}),
      status: hold ? 'Held' : 'Completed',
    }
    setTodayOrders(os => [order, ...os])
    if (!hold) setReceipt(order)
    toast.success(hold ? `Order ${orderNo} held` : `Order ${orderNo} completed — ৳${total.toLocaleString()}`)
    clearCart()
  }

  const todaySales = todayOrders.filter(o => o.status==='Completed').reduce((s,o) => s+o.total, 0)

  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6 bg-[#F4F6F9]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ background: BRAND }}>
            <ShoppingCart size={16} />
          </div>
          <div>
            <p className="font-bold text-[14px] text-gray-900 leading-none">POS Terminal</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Walk-in & Social Orders</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-gray-400">Today&apos;s Sales</p>
            <p className="text-[16px] font-black" style={{ color: BRAND }}>৳{todaySales.toLocaleString()}</p>
          </div>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-[11px] font-semibold">
            <button onClick={() => setActiveTab('pos')}
              className={`px-4 py-2 transition-colors ${activeTab==='pos'?'text-white':'text-gray-500 hover:bg-gray-50'}`}
              style={activeTab==='pos'?{background:BRAND}:{}}>
              New Order
            </button>
            <button onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 transition-colors ${activeTab==='orders'?'text-white':'text-gray-500 hover:bg-gray-50'}`}
              style={activeTab==='orders'?{background:BRAND}:{}}>
              Today ({todayOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════ POS TAB ══════════════ */}
      {activeTab === 'pos' && (
        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT: Product browser ── */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 bg-white">
            {/* Search + category */}
            <div className="px-4 py-3 border-b border-gray-100 space-y-2 shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search product or SKU…"
                  className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-gray-50 focus:bg-white" />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-full whitespace-nowrap shrink-0 transition-all ${
                      cat===c ? 'text-white' : 'border border-gray-200 text-gray-500 hover:border-gray-400 bg-white'
                    }`}
                    style={cat===c ? { background: BRAND } : {}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {filtered.map(p => (
                  <motion.button key={p.id} onClick={() => addToCart(p)}
                    whileTap={{ scale: 0.96 }}
                    disabled={p.stock === 0}
                    className={`text-left rounded-xl border p-3 transition-all hover:shadow-sm hover:border-gray-300 group ${
                      p.stock === 0 ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'bg-white border-gray-200 hover:bg-gray-50/50'
                    }`}>
                    <div className="text-2xl mb-2 leading-none">{p.emoji}</div>
                    <p className="text-[11px] font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mb-1.5">{p.sku}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-black" style={{ color: BRAND }}>৳{p.price.toLocaleString()}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'}`}>
                        {p.stock}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Order panel ── */}
          <div className="w-[340px] xl:w-[380px] shrink-0 flex flex-col bg-white overflow-hidden">

            {/* Customer + source */}
            <div className="px-4 py-3 border-b border-gray-100 space-y-2.5 shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input value={customer} onChange={e => setCustomer(e.target.value)}
                    placeholder="Name (optional)"
                    className="w-full pl-7 pr-2 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                </div>
                <div className="relative flex-1">
                  <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full pl-7 pr-2 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                </div>
              </div>

              {/* Order source */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Order Source</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(Object.keys(SOURCE_CONFIG) as OrderSource[]).map(s => {
                    const cfg = SOURCE_CONFIG[s]
                    const Icon = cfg.icon
                    return (
                      <button key={s} onClick={() => setSource(s)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                          source===s ? 'border-transparent text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                        }`}
                        style={source===s ? { background: cfg.color } : {}}>
                        <Icon size={11} /> {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Delivery type */}
              <div className="flex gap-2">
                {(['Walk-in','Home Delivery'] as const).map(d => (
                  <button key={d} onClick={() => setDelivery(d)}
                    className={`flex-1 py-1.5 text-[11px] font-semibold border rounded-lg transition-all ${
                      delivery===d ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                    style={delivery===d ? { background: BRAND } : {}}>
                    {d}
                  </button>
                ))}
              </div>
              {delivery === 'Home Delivery' && (
                <div className="space-y-1.5">
                  <input value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="Delivery address"
                    className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500">Delivery charge:</span>
                    <input type="number" value={deliveryCh} onChange={e => setDeliveryCh(parseFloat(e.target.value)||0)}
                      className="w-24 px-2 py-1 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <ShoppingCart size={32} className="text-gray-200 mb-3" />
                  <p className="text-[13px] font-semibold text-gray-300">Cart is empty</p>
                  <p className="text-[11px] text-gray-300 mt-1">Click a product to add</p>
                </div>
              ) : (
                <div className="space-y-2 py-1">
                  {cart.map(item => {
                    const key = `${item.id}-${item.selectedColor}-${item.selectedSize}`
                    return (
                      <div key={key} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
                        <div className="text-lg leading-none shrink-0">{item.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-gray-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400">{item.selectedColor} · {item.selectedSize}</p>
                          <p className="text-[12px] font-bold mt-0.5" style={{ color: BRAND }}>৳{(item.price*item.qty).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => changeQty(key,-1)} className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
                            <Minus size={10} />
                          </button>
                          <span className="w-6 text-center text-[12px] font-bold text-gray-800">{item.qty}</span>
                          <button onClick={() => changeQty(key,1)} className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
                            <Plus size={10} />
                          </button>
                          <button onClick={() => removeItem(key)} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors ml-0.5">
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Order summary + payment ── */}
            <div className="border-t border-gray-100 px-4 pt-3 pb-4 space-y-3 shrink-0">
              {/* Discount */}
              <div className="flex items-center gap-2">
                <div className="flex border border-gray-200 rounded-lg overflow-hidden text-[10px] font-bold shrink-0">
                  <button onClick={() => setDiscountType('flat')}
                    className={`px-2 py-1.5 transition-colors ${discountType==='flat'?'text-white':'text-gray-400'}`}
                    style={discountType==='flat'?{background:BRAND}:{}}>
                    <Tag size={10} />
                  </button>
                  <button onClick={() => setDiscountType('percent')}
                    className={`px-2 py-1.5 transition-colors ${discountType==='percent'?'text-white':'text-gray-400'}`}
                    style={discountType==='percent'?{background:BRAND}:{}}>
                    <Percent size={10} />
                  </button>
                </div>
                <input type="number" value={discountVal || ''} onChange={e => setDiscountVal(parseFloat(e.target.value)||0)}
                  placeholder={discountType==='flat'?'Discount ৳':'Discount %'}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-gray-400" />
                <input value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Note"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-gray-400" />
              </div>

              {/* Totals */}
              <div className="space-y-1 text-[12px]">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({cart.reduce((s,i)=>s+i.qty,0)} items)</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span><span>-৳{discountAmt.toLocaleString()}</span>
                  </div>
                )}
                {deliveryCh > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span><span>৳{deliveryCh.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-[16px] pt-1 border-t border-gray-100">
                  <span className="text-gray-900">Total</span>
                  <span style={{ color: BRAND }}>৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Payment</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(PAY_CONFIG) as PayMethod[]).map(m => {
                    const cfg = PAY_CONFIG[m]
                    const Icon = cfg.icon
                    return (
                      <button key={m} onClick={() => setPayment(m)}
                        className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                          payment===m ? 'border-transparent text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                        }`}
                        style={payment===m ? { background: cfg.color } : {}}>
                        <Icon size={13} />
                        {m}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button onClick={() => placeOrder(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  <Clock size={13} /> Hold
                </button>
                <button onClick={clearCart}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  <RotateCcw size={13} /> Clear
                </button>
                <button onClick={() => placeOrder(false)} disabled={cart.length===0}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ background: BRAND }}>
                  <CheckCircle size={15} /> Complete ৳{total.toLocaleString()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TODAY'S ORDERS TAB ══════════════ */}
      {activeTab === 'orders' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label:'Total Orders', val: todayOrders.length, color:'#7C3AED' },
              { label:'Total Sales',  val:`৳${todaySales.toLocaleString()}`, color:BRAND },
              { label:'Held Orders',  val: todayOrders.filter(o=>o.status==='Held').length, color:'#D97706' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-[20px] font-black" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Orders list */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-[14px] text-gray-800">Today&apos;s Orders</p>
              <p className="text-[11px] text-gray-400">{new Date().toLocaleDateString('en-BD',{weekday:'long',day:'numeric',month:'long'})}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {todayOrders.map(o => {
                const srcCfg = SOURCE_CONFIG[o.source]
                const SrcIcon = srcCfg.icon
                return (
                  <div key={o.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: srcCfg.bg }}>
                      <SrcIcon size={16} style={{ color: srcCfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[13px] text-gray-900 font-mono">{o.orderNo}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.status==='Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>{o.status}</span>
                      </div>
                      <p className="text-[12px] text-gray-600 mt-0.5">{o.customer} {o.phone && `· ${o.phone}`}</p>
                      <p className="text-[11px] text-gray-400">{o.source} · {o.payment} · {o.time}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-black" style={{ color: BRAND }}>৳{o.total.toLocaleString()}</p>
                      {o.discount > 0 && <p className="text-[10px] text-emerald-600">-৳{o.discount}</p>}
                    </div>
                    <button onClick={() => setReceipt(o)}
                      className="p-2 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                      <Printer size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Color/Size picker modal ── */}
      <AnimatePresence>
        {colorPick && (() => {
          const prod = PRODUCTS.find(p => p.id === colorPick.id)!
          return (
            <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setColorPick(null)}>
              <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-5"
                initial={{ y:30, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:30, opacity:0 }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-[14px] text-gray-900">Select Variant</p>
                  <button onClick={() => setColorPick(null)}><X size={18} className="text-gray-400" /></button>
                </div>
                <p className="text-[12px] font-semibold text-gray-600 mb-3">{prod.name}</p>
                {prod.colors.length > 1 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {prod.colors.map(c => (
                        <button key={c} onClick={() => setColorPick(cp => cp ? {...cp, color:c} : cp)}
                          className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all ${
                            colorPick.color===c ? 'border-[#C2185B] bg-[#FFF0F4] text-[#C2185B]' : 'border-gray-200 text-gray-600'
                          }`}>{c}</button>
                      ))}
                    </div>
                  </div>
                )}
                {prod.sizes.length > 1 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Size</p>
                    <div className="flex flex-wrap gap-2">
                      {prod.sizes.map(s => (
                        <button key={s} onClick={() => setColorPick(cp => cp ? {...cp, size:s} : cp)}
                          className={`px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all ${
                            colorPick.size===s ? 'border-[#C2185B] bg-[#FFF0F4] text-[#C2185B]' : 'border-gray-200 text-gray-600'
                          }`}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => doAdd(prod, colorPick.color, colorPick.size)}
                  className="w-full py-3 rounded-xl text-[13px] font-bold text-white mt-2"
                  style={{ background: BRAND }}>
                  Add to Cart — ৳{prod.price.toLocaleString()}
                </button>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* ── Receipt modal ── */}
      <AnimatePresence>
        {receipt && <ReceiptModal order={receipt} onClose={() => setReceipt(null)} />}
      </AnimatePresence>
    </div>
  )
}
