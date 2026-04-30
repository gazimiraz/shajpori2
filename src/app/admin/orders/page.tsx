'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Truck, CheckCircle, XCircle, Package, ChevronDown, ChevronRight, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import type { OrderStatus } from '@/types'

const MOCK_ORDERS = [
  { order_id:'o1', order_number:'SJP-2025-00001', guest_email:'fatima@example.com', items_ordered:[{ name:'Bloom Garden Midi Dress', size:'M', color:'Blush Pink', qty:1, unit_price:3200, total_price:3200 }], subtotal:3200, delivery_charge:0, discount_amount:0, total_amount:3200, payment_status:'Paid', payment_method:'stripe', status:'Delivered' as OrderStatus, shipping_address:{ name:'Fatima Rahman', street:'House 12, Road 5, Dhanmondi', city:'Dhaka', district:'Dhaka', postal_code:'1209' }, tracking_number:'BD123456789', created_at:'2025-04-08T10:00:00' },
  { order_id:'o2', order_number:'SJP-2025-00002', guest_email:'nadia@example.com', items_ordered:[{ name:'Pearl Quilted Shoulder Bag', size:'One Size', color:'Ivory White', qty:1, unit_price:5800, total_price:5800 },{ name:'Crystal Charm Bracelet Set', size:'One Size', color:'Rose Gold', qty:2, unit_price:1200, total_price:2400 }], subtotal:8200, delivery_charge:0, discount_amount:0, total_amount:8200, payment_status:'Paid', payment_method:'stripe', status:'Shipped' as OrderStatus, shipping_address:{ name:'Nadia Islam', street:'Apt 4B, Gulshan 2', city:'Dhaka', district:'Dhaka', postal_code:'1212' }, tracking_number:'BD987654321', created_at:'2025-04-18T14:20:00' },
  { order_id:'o3', order_number:'SJP-2025-00003', guest_email:'sumaya@example.com', items_ordered:[{ name:'Sunset Ruffle Maxi Dress', size:'M', color:'Coral Orange', qty:1, unit_price:4100, total_price:4100 }], subtotal:4100, delivery_charge:0, discount_amount:0, total_amount:4100, payment_status:'Paid', payment_method:'bkash', status:'Confirmed' as OrderStatus, shipping_address:{ name:'Sumaya Khatun', street:'Road 3, Block C, Mirpur', city:'Dhaka', district:'Dhaka', postal_code:'1216' }, tracking_number:undefined, created_at:'2025-04-21T11:30:00' },
  { order_id:'o4', order_number:'SJP-2025-00004', guest_email:'reshma@example.com', items_ordered:[{ name:'Cotton Candy Mini Dress', size:'S', color:'Cotton Candy Pink', qty:2, unit_price:2400, total_price:4800 }], subtotal:4800, delivery_charge:0, discount_amount:0, total_amount:4800, payment_status:'Unpaid', payment_method:'cod', status:'Pending' as OrderStatus, shipping_address:{ name:'Reshma Akter', street:'Banani Road 11', city:'Dhaka', district:'Dhaka', postal_code:'1213' }, tracking_number:undefined, created_at:'2025-04-22T09:15:00' },
  { order_id:'o5', order_number:'SJP-2025-00005', guest_email:'tasnim@example.com', items_ordered:[{ name:'Hot Pink Mini Tote', size:'One Size', color:'Bubblegum Pink', qty:1, unit_price:3500, total_price:3500 }], subtotal:3500, delivery_charge:80, discount_amount:0, total_amount:3580, payment_status:'Paid', payment_method:'nagad', status:'Delivered' as OrderStatus, shipping_address:{ name:'Tasnim Jahan', street:'House 7, Uttara Sector 4', city:'Dhaka', district:'Dhaka', postal_code:'1230' }, tracking_number:'BD111222333', created_at:'2025-04-03T16:45:00' },
]

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  Pending:    ['Confirmed', 'Cancelled'],
  Confirmed:  ['Processing', 'Cancelled'],
  Processing: ['Shipped'],
  Shipped:    ['Delivered'],
  Delivered:  [],
  Cancelled:  [],
  Refunded:   [],
}

const STATUS_META: Record<string, { dot: string; text: string; bg: string }> = {
  Pending:    { dot:'bg-amber-400',  text:'text-amber-700',  bg:'bg-amber-50'  },
  Confirmed:  { dot:'bg-blue-400',   text:'text-blue-700',   bg:'bg-blue-50'   },
  Processing: { dot:'bg-violet-400', text:'text-violet-700', bg:'bg-violet-50' },
  Shipped:    { dot:'bg-cyan-400',   text:'text-cyan-700',   bg:'bg-cyan-50'   },
  Delivered:  { dot:'bg-emerald-400',text:'text-emerald-700',bg:'bg-emerald-50'},
  Cancelled:  { dot:'bg-red-400',    text:'text-red-600',    bg:'bg-red-50'    },
  Refunded:   { dot:'bg-gray-400',   text:'text-gray-600',   bg:'bg-gray-100'  },
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.Pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {status}
    </span>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({})

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchSearch = o.order_number.toLowerCase().includes(q) || o.guest_email.toLowerCase().includes(q) || o.shipping_address.name.toLowerCase().includes(q)
    return matchSearch && (statusFilter === 'All' || o.status === statusFilter)
  })

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o))
    toast.success(`Marked as ${newStatus}`)
  }

  const counts = MOCK_ORDERS.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {} as Record<string, number>)
  const totalAmt = filtered.reduce((s, o) => s + o.total_amount, 0)

  return (
    <div className="space-y-4 max-w-[1400px]">

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input type="text" placeholder="Order number, customer, email…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 w-64 bg-gray-50 focus:bg-white transition-colors" />
        </div>

        <div className="flex items-center gap-1.5">
          {['All','Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-[#C2185B] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {s}
              {s !== 'All' && counts[s] ? ` (${counts[s]})` : s === 'All' ? ` (${MOCK_ORDERS.length})` : ''}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-400">{filtered.length} orders · <span className="font-semibold text-gray-600">৳{totalAmt.toLocaleString()}</span></span>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
            <Filter size={12} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Table head */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
          {['Order', 'Customer', 'Items', 'Total', 'Status', ''].map(h => (
            <span key={h} className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</span>
          ))}
        </div>

        {/* Rows */}
        <AnimatePresence>
          {filtered.map((order, i) => {
            const isOpen = expandedId === order.order_id
            const nextStatuses = STATUS_FLOW[order.status] || []

            return (
              <motion.div key={order.order_id} layout initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="border-b border-gray-50 last:border-0">
                {/* Row */}
                <div
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3.5 items-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedId(isOpen ? null : order.order_id)}
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-800 font-mono">{order.order_number}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-BD', { day:'numeric', month:'short', year:'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 truncate">{order.shipping_address.name}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{order.guest_email}</p>
                  </div>
                  <span className="text-xs text-gray-500">{order.items_ordered.reduce((s, i) => s + i.qty, 0)} item(s)</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">৳{order.total_amount.toLocaleString()}</p>
                    <span className={`text-[10px] font-semibold ${order.payment_status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {order.payment_status} · {order.payment_method}
                    </span>
                  </div>
                  <StatusBadge status={order.status} />
                  <div className="flex justify-end">
                    <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.18 }}>
                      <ChevronRight size={15} className="text-gray-300" />
                    </motion.span>
                  </div>
                </div>

                {/* Expanded panel */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                      exit={{ height:0, opacity:0 }} transition={{ duration: 0.22 }}
                      className="overflow-hidden bg-[#FAFAFA] border-t border-gray-100"
                    >
                      <div className="px-5 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Items */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Items Ordered</p>
                          <div className="space-y-2">
                            {order.items_ordered.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-100">
                                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-base shrink-0">
                                  {item.name.includes('Dress') ? '👗' : item.name.includes('Bag') || item.name.includes('Tote') ? '👜' : '💎'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 leading-snug">{item.name}</p>
                                  <p className="text-[11px] text-gray-400 mt-0.5">{item.size} · {item.color} · ×{item.qty}</p>
                                </div>
                                <p className="text-xs font-bold text-gray-700 shrink-0">৳{item.total_price.toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-200 space-y-1 text-xs">
                            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>৳{order.subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between text-gray-400"><span>Delivery</span><span>{order.delivery_charge === 0 ? 'Free' : '৳' + order.delivery_charge}</span></div>
                            <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-gray-200"><span>Total</span><span>৳{order.total_amount.toLocaleString()}</span></div>
                          </div>
                        </div>

                        {/* Shipping + tracking */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Delivery</p>
                          <div className="bg-white rounded-lg p-3.5 border border-gray-100 text-xs text-gray-600 space-y-0.5 mb-3">
                            <p className="font-semibold text-gray-800 mb-1">{order.shipping_address.name}</p>
                            <p>{order.shipping_address.street}</p>
                            <p>{order.shipping_address.city}, {order.shipping_address.district} {order.shipping_address.postal_code}</p>
                          </div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Tracking</p>
                          {order.tracking_number ? (
                            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                              <Truck size={13} className="text-blue-500 shrink-0" />
                              <span className="text-xs font-bold text-blue-700 font-mono">{order.tracking_number}</span>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input type="text" placeholder="Enter tracking number"
                                value={trackingInput[order.order_id] || ''}
                                onChange={e => setTrackingInput(p => ({ ...p, [order.order_id]: e.target.value }))}
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-gray-300 bg-white" />
                              <button onClick={() => { const t = trackingInput[order.order_id]; if (!t) return; setOrders(p => p.map(o => o.order_id === order.order_id ? { ...o, tracking_number: t } : o)); setTrackingInput(p => ({ ...p, [order.order_id]: '' })); toast.success('Tracking saved') }}
                                className="px-3 py-2 bg-[#C2185B] text-white rounded-lg text-xs font-semibold hover:bg-[#A0144D] transition-colors">
                                Save
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Update Status</p>
                          {nextStatuses.length > 0 ? (
                            <div className="space-y-2">
                              {nextStatuses.map(ns => (
                                <motion.button key={ns}
                                  onClick={() => handleStatusUpdate(order.order_id, ns)}
                                  className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                                    ns === 'Delivered' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                    ns === 'Shipped'   ? 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100' :
                                    ns === 'Cancelled' ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100' :
                                    'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                  }`}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  {ns === 'Delivered' ? <CheckCircle size={13} /> :
                                   ns === 'Shipped' ? <Truck size={13} /> :
                                   ns === 'Cancelled' ? <XCircle size={13} /> :
                                   <Package size={13} />}
                                  Mark as {ns}
                                </motion.button>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
                              <StatusBadge status={order.status} />
                              <p className="text-xs text-gray-400 mt-2">No further actions</p>
                            </div>
                          )}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Payment method</span>
                              <span className="font-semibold text-gray-700 capitalize">{order.payment_method}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Package size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-500">No orders found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  )
}
