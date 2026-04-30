'use client'
// src/app/admin/inventory/page.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, AlertTriangle, Package, RefreshCw, Search, Filter, ArrowDown, ArrowUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface Variant {
  id: string; sku: string; product_id: string; size: string; color: string
  color_hex: string; stock_quantity: number; reserved_qty: number
  product: { name: string; sku: string; category: string; low_stock_alert: number }
}

interface Movement {
  id: string; movement_type: string; quantity: number
  quantity_before: number; quantity_after: number
  reference_id?: string; reference_type?: string; notes?: string; created_at: string
  product: { name: string; sku: string }; variant: { size: string; color: string }
}

// Mock data
const MOCK_VARIANTS: Variant[] = [
  { id:'v1', sku:'SJP-DR-002-L-BURG', product_id:'p2', size:'L', color:'Deep Burgundy', color_hex:'#800020', stock_quantity:0, reserved_qty:0, product:{ name:'Sunset Ruffle Maxi Dress', sku:'SJP-DR-002', category:'Dress', low_stock_alert:5 } },
  { id:'v2', sku:'SJP-DR-002-S-CORAL', product_id:'p2', size:'S', color:'Coral Orange', color_hex:'#FF7F50', stock_quantity:3, reserved_qty:0, product:{ name:'Sunset Ruffle Maxi Dress', sku:'SJP-DR-002', category:'Dress', low_stock_alert:5 } },
  { id:'v3', sku:'SJP-BG-001-OS-RSE', product_id:'p4', size:'One Size', color:'Dusty Rose', color_hex:'#DCAE96', stock_quantity:4, reserved_qty:0, product:{ name:'Pearl Quilted Shoulder Bag', sku:'SJP-BG-001', category:'Bag', low_stock_alert:3 } },
  { id:'v4', sku:'SJP-DR-001-XS-PINK', product_id:'p1', size:'XS', color:'Blush Pink', color_hex:'#FFB6C1', stock_quantity:5, reserved_qty:0, product:{ name:'Bloom Garden Midi Dress', sku:'SJP-DR-001', category:'Dress', low_stock_alert:5 } },
  { id:'v5', sku:'SJP-DR-001-S-PINK', product_id:'p1', size:'S', color:'Blush Pink', color_hex:'#FFB6C1', stock_quantity:8, reserved_qty:0, product:{ name:'Bloom Garden Midi Dress', sku:'SJP-DR-001', category:'Dress', low_stock_alert:5 } },
  { id:'v6', sku:'SJP-BG-001-OS-BLK', product_id:'p4', size:'One Size', color:'Black Onyx', color_hex:'#0A0A0A', stock_quantity:6, reserved_qty:0, product:{ name:'Pearl Quilted Shoulder Bag', sku:'SJP-BG-001', category:'Bag', low_stock_alert:3 } },
  { id:'v7', sku:'SJP-DR-001-M-PINK', product_id:'p1', size:'M', color:'Blush Pink', color_hex:'#FFB6C1', stock_quantity:6, reserved_qty:1, product:{ name:'Bloom Garden Midi Dress', sku:'SJP-DR-001', category:'Dress', low_stock_alert:5 } },
  { id:'v8', sku:'SJP-BG-002-OS-PINK', product_id:'p5', size:'One Size', color:'Bubblegum Pink', color_hex:'#FF69B4', stock_quantity:12, reserved_qty:0, product:{ name:'Hot Pink Mini Tote', sku:'SJP-BG-002', category:'Bag', low_stock_alert:5 } },
  { id:'v9', sku:'SJP-DR-003-S-CPINK', product_id:'p3', size:'S', color:'Cotton Candy Pink', color_hex:'#FFB7D5', stock_quantity:18, reserved_qty:2, product:{ name:'Cotton Candy Mini Dress', sku:'SJP-DR-003', category:'Dress', low_stock_alert:10 } },
  { id:'v10', sku:'SJP-AC-001-OS-RG', product_id:'p6', size:'One Size', color:'Rose Gold', color_hex:'#B76E79', stock_quantity:35, reserved_qty:0, product:{ name:'Crystal Charm Bracelet Set', sku:'SJP-AC-001', category:'Accessory', low_stock_alert:10 } },
]

const MOCK_MOVEMENTS: Movement[] = [
  { id:'m1', movement_type:'sale', quantity:-2, quantity_before:20, quantity_after:18, reference_id:'SJP-2025-00004', reference_type:'order', created_at:'2025-04-22T10:30:00', product:{ name:'Cotton Candy Mini', sku:'SJP-DR-003' }, variant:{ size:'S', color:'Cotton Candy Pink' } },
  { id:'m2', movement_type:'sale', quantity:-1, quantity_before:8, quantity_after:7, reference_id:'SJP-2025-00002', reference_type:'order', created_at:'2025-04-18T14:20:00', product:{ name:'Pearl Quilted Bag', sku:'SJP-BG-001' }, variant:{ size:'One Size', color:'Ivory White' } },
  { id:'m3', movement_type:'purchase', quantity:15, quantity_before:30, quantity_after:45, reference_id:'PO-2025-0001', reference_type:'purchase_order', created_at:'2025-04-10T09:00:00', product:{ name:'Bloom Garden Midi', sku:'SJP-DR-001' }, variant:{ size:'M', color:'Blush Pink' } },
  { id:'m4', movement_type:'damage', quantity:-2, quantity_before:26, quantity_after:24, notes:'Water damage during storage', created_at:'2025-03-28T11:00:00', product:{ name:'Sunset Ruffle Maxi', sku:'SJP-DR-002' }, variant:{ size:'L', color:'Coral Orange' } },
  { id:'m5', movement_type:'adjustment', quantity:5, quantity_before:30, quantity_after:35, notes:'Annual stocktake correction', created_at:'2025-03-15T16:00:00', product:{ name:'Crystal Bracelet Set', sku:'SJP-AC-001' }, variant:{ size:'One Size', color:'Rose Gold' } },
]

const MOVEMENT_CONFIG: Record<string, { label: string; color: string; bg: string; sign: string }> = {
  sale:       { label: 'Sale',       color: '#EF4444', bg: '#FEF2F2', sign: '−' },
  purchase:   { label: 'Purchase',   color: '#22C55E', bg: '#F0FDF4', sign: '+' },
  return:     { label: 'Return',     color: '#3B82F6', bg: '#EFF6FF', sign: '+' },
  adjustment: { label: 'Adjustment', color: '#8B5CF6', bg: '#F5F3FF', sign: '±' },
  damage:     { label: 'Damage',     color: '#F59E0B', bg: '#FFFBEB', sign: '−' },
}

const CAT_COLORS: Record<string, string> = { Dress: '#FF69B4', Bag: '#3B82F6', Accessory: '#F59E0B' }

function StockStatus({ qty, threshold }: { qty: number; threshold: number }) {
  if (qty === 0) return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600">Out of Stock</span>
  if (qty <= threshold) return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Low Stock</span>
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600">In Stock</span>
}

export default function InventoryPage() {
  const [variants, setVariants] = useState<Variant[]>(MOCK_VARIANTS)
  const [movements] = useState<Movement[]>(MOCK_MOVEMENTS)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'variants' | 'movements' | 'purchase'>('variants')
  const [adjusting, setAdjusting] = useState<string | null>(null)
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjustNote, setAdjustNote] = useState('')
  const [adjustType, setAdjustType] = useState<'add' | 'remove' | 'damage'>('add')

  // PO Form state
  const [poSupplier, setPoSupplier] = useState('Dhaka Fashion House')
  const [poDate, setPoDate] = useState('')
  const [poNotes, setPoNotes] = useState('')

  const filtered = variants.filter(v =>
    v.sku.toLowerCase().includes(search.toLowerCase()) ||
    v.product.name.toLowerCase().includes(search.toLowerCase()) ||
    v.color.toLowerCase().includes(search.toLowerCase())
  )

  const lowStock = variants.filter(v => v.stock_quantity > 0 && v.stock_quantity <= v.product.low_stock_alert).length
  const outOfStock = variants.filter(v => v.stock_quantity === 0).length
  const totalUnits = variants.reduce((s, v) => s + v.stock_quantity, 0)

  const handleAdjust = (variantId: string, delta: number) => {
    setVariants(prev => prev.map(v => {
      if (v.id !== variantId) return v
      const newQty = Math.max(0, v.stock_quantity + delta)
      return { ...v, stock_quantity: newQty }
    }))
    toast.success(`Stock updated`)
  }

  const handleBulkAdjust = () => {
    if (!adjusting) return
    const sign = adjustType === 'add' ? 1 : -1
    handleAdjust(adjusting, sign * adjustQty)
    setAdjusting(null)
    setAdjustQty(0)
    setAdjustNote('')
    toast.success(`Adjustment saved · ${adjustType === 'add' ? '+' : '-'}${adjustQty} units`)
  }

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1A1A2E]">{totalUnits.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Total units in stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1A1A2E]">{lowStock}</p>
              <p className="text-xs text-gray-400">Low stock SKUs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1A1A2E]">{outOfStock}</p>
              <p className="text-xs text-gray-400">Out of stock SKUs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(outOfStock > 0 || lowStock > 0) && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Stock Alert</p>
            <p className="text-xs text-red-600 mt-0.5">
              {outOfStock > 0 && `${outOfStock} SKU(s) are out of stock. `}
              {lowStock > 0 && `${lowStock} SKU(s) are running low.`}
              {' '}Consider creating a purchase order.
            </p>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {(['variants', 'movements', 'purchase'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
              tab === t ? 'bg-white shadow-sm text-[#1A1A2E]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'variants' ? 'Stock by Variant' : t === 'movements' ? 'Movement Log' : 'Purchase Orders'}
          </button>
        ))}
      </div>

      {/* VARIANTS TAB */}
      {tab === 'variants' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input
                type="text"
                placeholder="Search by SKU, product name or colour…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-100 rounded-xl focus:outline-none focus:border-[#FF69B4] bg-gray-50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-50">
                  {['SKU', 'Product', 'Size', 'Colour', 'Stock', 'Reserved', 'Available', 'Status', 'Quick Adjust'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => {
                  const available = v.stock_quantity - v.reserved_qty
                  return (
                    <motion.tr
                      key={v.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-pink-50/20 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.sku}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#1A1A2E] text-xs">{v.product.name}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium mt-0.5 inline-block"
                          style={{ background: CAT_COLORS[v.product.category] + '18', color: CAT_COLORS[v.product.category] }}>
                          {v.product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg font-medium text-gray-600">{v.size}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0" style={{ background: v.color_hex }} />
                          <span className="text-xs text-gray-600">{v.color}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#1A1A2E]">{v.stock_quantity}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{v.reserved_qty}</td>
                      <td className="px-4 py-3 font-semibold text-[#1A1A2E]">{available}</td>
                      <td className="px-4 py-3">
                        <StockStatus qty={v.stock_quantity} threshold={v.product.low_stock_alert} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <motion.button
                            onClick={() => handleAdjust(v.id, -1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                            whileTap={{ scale: 0.85 }}
                          >
                            <Minus size={12} />
                          </motion.button>
                          <span className="w-8 text-center text-sm font-bold text-[#1A1A2E]">{v.stock_quantity}</span>
                          <motion.button
                            onClick={() => handleAdjust(v.id, 1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600 flex items-center justify-center transition-colors"
                            whileTap={{ scale: 0.85 }}
                          >
                            <Plus size={12} />
                          </motion.button>
                          <motion.button
                            onClick={() => setAdjusting(v.id)}
                            className="ml-1 text-xs text-[#FF69B4] hover:text-[#FF1493] font-semibold"
                            whileTap={{ scale: 0.9 }}
                          >
                            Bulk
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MOVEMENTS TAB */}
      {tab === 'movements' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Date & Time', 'Product', 'Variant', 'Type', 'Change', 'Before', 'After', 'Reference', 'Notes'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map((m, i) => {
                  const cfg = MOVEMENT_CONFIG[m.movement_type] || MOVEMENT_CONFIG.adjustment
                  return (
                    <motion.tr
                      key={m.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(m.created_at).toLocaleDateString('en-BD', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-xs text-[#1A1A2E]">{m.product.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{m.product.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{m.variant.size} · {m.variant.color}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${m.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {m.quantity > 0 ? '+' : ''}{m.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{m.quantity_before}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1A1A2E]">{m.quantity_after}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">{m.reference_id || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[140px] truncate">{m.notes || '—'}</td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PURCHASE ORDERS TAB */}
      {tab === 'purchase' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New PO form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-display text-base font-bold text-[#1A1A2E] mb-5">New Purchase Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Supplier</label>
                <select
                  value={poSupplier}
                  onChange={e => setPoSupplier(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF69B4]"
                >
                  <option>Dhaka Fashion House</option>
                  <option>Gulshan Leather Works</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Expected Delivery Date</label>
                <input
                  type="date"
                  value={poDate}
                  onChange={e => setPoDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF69B4]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea
                  value={poNotes}
                  onChange={e => setPoNotes(e.target.value)}
                  placeholder="e.g. Urgently restock Sunset Ruffle Maxi in all sizes"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF69B4] resize-none"
                />
              </div>

              {/* Low stock suggestion */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 mb-2">Suggested items to restock:</p>
                {variants.filter(v => v.stock_quantity <= v.product.low_stock_alert).slice(0, 4).map(v => (
                  <div key={v.id} className="flex items-center justify-between text-xs text-amber-600 py-1">
                    <span>{v.product.name} · {v.size} · {v.color}</span>
                    <span className="font-bold">{v.stock_quantity} left</span>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={() => toast.success('Purchase order PO-2025-0002 created and sent to ' + poSupplier)}
                className="w-full bg-[#FF69B4] text-white rounded-xl py-3 text-sm font-semibold"
                whileHover={{ backgroundColor: '#FF1493' }}
                whileTap={{ scale: 0.98 }}
              >
                Create & Send Purchase Order
              </motion.button>
            </div>
          </div>

          {/* Recent POs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-display text-base font-bold text-[#1A1A2E] mb-5">Recent Purchase Orders</h3>
            <div className="space-y-3">
              {[
                { po: 'PO-2025-0001', supplier: 'Dhaka Fashion House', items: 4, total: 45000, status: 'Received', date: 'Apr 10' },
              ].map(po => (
                <div key={po.po} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-[#1A1A2E] font-mono">{po.po}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{po.supplier}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600">{po.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
                    <span>{po.items} line items</span>
                    <span className="font-semibold text-[#1A1A2E]">৳{po.total.toLocaleString()}</span>
                    <span>{po.date}</span>
                  </div>
                </div>
              ))}
              <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 text-center">
                <p className="text-sm text-gray-300 font-medium">More POs will appear here</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Adjust Modal */}
      <AnimatePresence>
        {adjusting && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAdjusting(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <h3 className="font-display text-lg font-bold text-[#1A1A2E] mb-4">Bulk Stock Adjustment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
                    <div className="flex gap-2">
                      {(['add', 'remove', 'damage'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setAdjustType(t)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                            adjustType === t ? 'bg-[#FF69B4] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {t === 'add' ? '+ Add Stock' : t === 'remove' ? '- Remove' : '⚠ Damage'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={adjustQty || ''}
                      onChange={e => setAdjustQty(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF69B4]"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
                    <input
                      type="text"
                      value={adjustNote}
                      onChange={e => setAdjustNote(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF69B4]"
                      placeholder="e.g. New stock received from supplier"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setAdjusting(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">Cancel</button>
                    <motion.button
                      onClick={handleBulkAdjust}
                      className="flex-1 py-2.5 rounded-xl bg-[#FF69B4] text-white text-sm font-semibold"
                      whileHover={{ backgroundColor: '#FF1493' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Save Adjustment
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
