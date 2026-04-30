'use client'
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, X, ChevronDown, ChevronUp, Download,
  Factory, Package, Truck, CheckCircle, Clock, FileText,
  Phone, Mail, MapPin, Edit2, Send, Eye, AlertCircle,
  CalendarDays, Hash, DollarSign, ShoppingCart, RotateCcw
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ── Types ─────────────────────────────────────────────────── */
type POStatus = 'Draft' | 'Sent' | 'Confirmed' | 'In Production' | 'Shipped' | 'Received' | 'Cancelled'

interface POItem {
  id: string
  product_name: string
  sku: string
  category: string
  qty_ordered: number
  qty_received: number
  unit_cost: number
  colors: string[]
  sizes: string[]
}

interface PurchaseOrder {
  id: string
  po_number: string
  supplier_id: string
  supplier_name: string
  status: POStatus
  order_date: string
  expected_date: string
  received_date: string | null
  items: POItem[]
  notes: string
  shipping_cost: number
  discount: number
}

interface Supplier {
  id: string
  name: string
  contact_person: string
  phone: string
  email: string
  address: string
  city: string
  speciality: string[]
  lead_days: number
  rating: number
  total_orders: number
}

/* ── Mock data ─────────────────────────────────────────────── */
const SUPPLIERS: Supplier[] = [
  { id:'S1', name:'Dhaka Garments Ltd.',      contact_person:'Md. Karim',    phone:'01711-001122', email:'karim@dhakagarments.com',  address:'Mirpur DOHS', city:'Dhaka',      speciality:['Dress','Kurti'],        lead_days:14, rating:4.8, total_orders:32 },
  { id:'S2', name:'Fashion Weave Industries', contact_person:'Ms. Layla',    phone:'01812-223344', email:'layla@fashionweave.com',    address:'Gazipur',     city:'Gazipur',    speciality:['Dress','Bag'],          lead_days:21, rating:4.5, total_orders:18 },
  { id:'S3', name:'Royal Accessories BD',     contact_person:'Rahim Uddin',  phone:'01913-334455', email:'rahim@royalacc.com',        address:'Narayanganj', city:'Narayanganj',speciality:['Accessory','Jewelry'],  lead_days:10, rating:4.7, total_orders:27 },
  { id:'S4', name:'Star Bag Manufacturing',   contact_person:'Ms. Shirin',   phone:'01614-445566', email:'shirin@starbag.com',        address:'Ashulia',     city:'Dhaka',      speciality:['Bag'],                  lead_days:18, rating:4.3, total_orders:12 },
  { id:'S5', name:'Chic Apparel Factory',     contact_person:'Anwar Hossain',phone:'01515-556677', email:'anwar@chicapparel.com',     address:'Savar',       city:'Dhaka',      speciality:['Dress','Footwear'],     lead_days:25, rating:4.6, total_orders:22 },
]

const MOCK_POS: PurchaseOrder[] = [
  {
    id:'PO001', po_number:'SJP-PO-2025-001', supplier_id:'S1', supplier_name:'Dhaka Garments Ltd.',
    status:'Received', order_date:'2025-04-01', expected_date:'2025-04-15', received_date:'2025-04-14',
    shipping_cost:1200, discount:500,
    notes:'Rush order for Eid collection. Priority delivery.',
    items:[
      { id:'i1', product_name:'Bloom Garden Midi Dress', sku:'SJP-DR-001', category:'Dress', qty_ordered:60, qty_received:60, unit_cost:1400, colors:['Blush Pink','Sage Green'], sizes:['S','M','L','XL'] },
      { id:'i2', product_name:'Sunset Ruffle Maxi',      sku:'SJP-DR-002', category:'Dress', qty_ordered:40, qty_received:38, unit_cost:1800, colors:['Coral Orange'],           sizes:['S','M','L'] },
    ],
  },
  {
    id:'PO002', po_number:'SJP-PO-2025-002', supplier_id:'S4', supplier_name:'Star Bag Manufacturing',
    status:'Shipped', order_date:'2025-04-10', expected_date:'2025-04-28', received_date:null,
    shipping_cost:800, discount:0,
    notes:'Standard order. Check stitching quality carefully.',
    items:[
      { id:'i3', product_name:'Pearl Quilted Shoulder Bag', sku:'SJP-BG-001', category:'Bag', qty_ordered:30, qty_received:0, unit_cost:2200, colors:['Ivory White','Black Onyx'], sizes:['One Size'] },
      { id:'i4', product_name:'Hot Pink Mini Tote',         sku:'SJP-BG-002', category:'Bag', qty_ordered:40, qty_received:0, unit_cost:1300, colors:['Bubblegum Pink'],          sizes:['One Size'] },
    ],
  },
  {
    id:'PO003', po_number:'SJP-PO-2025-003', supplier_id:'S3', supplier_name:'Royal Accessories BD',
    status:'Confirmed', order_date:'2025-04-18', expected_date:'2025-04-28', received_date:null,
    shipping_cost:400, discount:0,
    notes:'',
    items:[
      { id:'i5', product_name:'Pearl Drop Earrings',      sku:'SJP-JWL-001', category:'Jewelry',   qty_ordered:120, qty_received:0, unit_cost:290, colors:['Gold','Silver'], sizes:['One Size'] },
      { id:'i6', product_name:'Crystal Charm Bracelet',   sku:'SJP-JWL-003', category:'Jewelry',   qty_ordered:80,  qty_received:0, unit_cost:420, colors:['Rose Gold'],    sizes:['One Size'] },
    ],
  },
  {
    id:'PO004', po_number:'SJP-PO-2025-004', supplier_id:'S2', supplier_name:'Fashion Weave Industries',
    status:'Draft', order_date:'2025-04-26', expected_date:'2025-05-17', received_date:null,
    shipping_cost:0, discount:0,
    notes:'Planning for summer collection.',
    items:[
      { id:'i7', product_name:'Cotton Candy Mini Dress', sku:'SJP-DR-003', category:'Dress', qty_ordered:100, qty_received:0, unit_cost:950, colors:['Cotton Candy Pink','Lavender Mist'], sizes:['XS','S','M','L','XL'] },
    ],
  },
  {
    id:'PO005', po_number:'SJP-PO-2025-005', supplier_id:'S5', supplier_name:'Chic Apparel Factory',
    status:'In Production', order_date:'2025-04-20', expected_date:'2025-05-15', received_date:null,
    shipping_cost:600, discount:200,
    notes:'New silhouette — request sample before bulk production.',
    items:[
      { id:'i8', product_name:'Embroidered Kurti Set', sku:'SJP-DR-004', category:'Dress', qty_ordered:50, qty_received:0, unit_cost:1600, colors:['Dusty Rose','Sage Green'], sizes:['S','M','L','XL','XXL'] },
    ],
  },
]

/* ── Status config ─────────────────────────────────────────── */
const STATUS_CFG: Record<POStatus, { color: string; bg: string; icon: React.ElementType }> = {
  Draft:         { color:'#6B7280', bg:'#F3F4F6', icon: FileText },
  Sent:          { color:'#1D4ED8', bg:'#EFF6FF', icon: Send },
  Confirmed:     { color:'#0891B2', bg:'#ECFEFF', icon: CheckCircle },
  'In Production':{ color:'#D97706', bg:'#FFFBEB', icon: Factory },
  Shipped:       { color:'#7C3AED', bg:'#F5F3FF', icon: Truck },
  Received:      { color:'#059669', bg:'#ECFDF5', icon: CheckCircle },
  Cancelled:     { color:'#DC2626', bg:'#FEF2F2', icon: X },
}
const STATUS_FLOW: POStatus[] = ['Draft','Sent','Confirmed','In Production','Shipped','Received']

const EMPTY_ITEM = (): POItem => ({ id: String(Date.now()), product_name:'', sku:'', category:'Dress', qty_ordered:1, qty_received:0, unit_cost:0, colors:[], sizes:[] })
const EMPTY_PO = (): Omit<PurchaseOrder,'id'|'po_number'> => ({
  supplier_id:'', supplier_name:'', status:'Draft',
  order_date: new Date().toISOString().slice(0,10),
  expected_date:'', received_date: null,
  items:[EMPTY_ITEM()], notes:'', shipping_cost:0, discount:0,
})

function StatusBadge({ status }: { status: POStatus }) {
  const cfg = STATUS_CFG[status]
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ color: cfg.color, background: cfg.bg }}>
      <Icon size={10} /> {status}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function PurchasePage() {
  const [orders,      setOrders]      = useState<PurchaseOrder[]>(MOCK_POS)
  const [search,      setSearch]      = useState('')
  const [statusFilter,setStatusFilter]= useState<'All'|POStatus>('All')
  const [expanded,    setExpanded]    = useState<string|null>(null)
  const [showForm,    setShowForm]    = useState(false)
  const [showSuppliers,setShowSuppliers] = useState(false)
  const [formData,    setFormData]    = useState<Omit<PurchaseOrder,'id'|'po_number'>>(EMPTY_PO())
  const [editId,      setEditId]      = useState<string|null>(null)

  const filtered = useMemo(() => {
    let d = [...orders]
    if (statusFilter !== 'All') d = d.filter(o => o.status === statusFilter)
    if (search) d = d.filter(o =>
      o.po_number.toLowerCase().includes(search.toLowerCase()) ||
      o.supplier_name.toLowerCase().includes(search.toLowerCase())
    )
    return d.sort((a,b) => b.order_date.localeCompare(a.order_date))
  }, [orders, statusFilter, search])

  const kpi = useMemo(() => ({
    total:      orders.length,
    pending:    orders.filter(o => !['Received','Cancelled'].includes(o.status)).length,
    totalValue: orders.reduce((s,o) => s + o.items.reduce((x,i) => x + i.qty_ordered*i.unit_cost, 0), 0),
    receivable: orders.filter(o => o.status === 'Shipped').length,
  }), [orders])

  const poTotal = (o: PurchaseOrder) =>
    o.items.reduce((s,i) => s + i.qty_ordered * i.unit_cost, 0) + o.shipping_cost - o.discount

  const openNew = () => { setFormData(EMPTY_PO()); setEditId(null); setShowForm(true) }
  const openEdit = (o: PurchaseOrder) => {
    setFormData({ supplier_id:o.supplier_id, supplier_name:o.supplier_name, status:o.status,
      order_date:o.order_date, expected_date:o.expected_date, received_date:o.received_date,
      items:[...o.items], notes:o.notes, shipping_cost:o.shipping_cost, discount:o.discount })
    setEditId(o.id); setShowForm(true)
  }

  const advanceStatus = (id: string) => {
    setOrders(os => os.map(o => {
      if (o.id !== id) return o
      const idx = STATUS_FLOW.indexOf(o.status)
      if (idx < 0 || idx >= STATUS_FLOW.length - 1) return o
      const next = STATUS_FLOW[idx + 1]
      toast.success(`PO moved to "${next}"`)
      return { ...o, status: next, received_date: next === 'Received' ? new Date().toISOString().slice(0,10) : o.received_date }
    }))
  }

  const handleSave = () => {
    if (!formData.supplier_id)          { toast.error('Select a supplier'); return }
    if (!formData.expected_date)        { toast.error('Set expected delivery date'); return }
    if (formData.items.some(i => !i.product_name || !i.qty_ordered))
                                        { toast.error('All line items need a product name and quantity'); return }
    if (editId) {
      setOrders(os => os.map(o => o.id===editId ? { ...o, ...formData } : o))
      toast.success('Purchase order updated')
    } else {
      const num = `SJP-PO-2025-${String(orders.length + 1).padStart(3,'0')}`
      setOrders(os => [{ ...formData, id:'PO'+Date.now(), po_number:num }, ...os])
      toast.success('Purchase order created')
    }
    setShowForm(false)
  }

  const updateItem = (idx: number, key: keyof POItem, val: unknown) =>
    setFormData(f => ({ ...f, items: f.items.map((it,i) => i===idx ? {...it,[key]:val} : it) }))

  const addItem   = () => setFormData(f => ({ ...f, items:[...f.items, EMPTY_ITEM()] }))
  const removeItem = (idx: number) => setFormData(f => ({ ...f, items: f.items.filter((_,i) => i!==idx) }))

  const formTotal = formData.items.reduce((s,i) => s + i.qty_ordered*i.unit_cost, 0) + formData.shipping_cost - formData.discount

  return (
    <div className="space-y-6">

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total POs',        val: kpi.total,                         icon: FileText,     color:'#7C3AED' },
          { label:'Active Orders',    val: kpi.pending,                        icon: Clock,        color:'#D97706' },
          { label:'Ready to Receive', val: kpi.receivable,                     icon: Truck,        color:'#0891B2' },
          { label:'Total Purchased',  val:`৳${(kpi.totalValue/1000).toFixed(0)}K`, icon: DollarSign, color:'#059669' },
        ].map((k,i) => {
          const Icon = k.icon
          return (
            <motion.div key={k.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.color+'15' }}>
                <Icon size={18} style={{ color: k.color }} />
              </div>
              <div>
                <p className="text-[22px] font-black text-gray-900 leading-none">{k.val}</p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{k.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search PO number or supplier…"
            className="w-full pl-8 pr-3 py-2.5 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-400 transition-all" />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {(['All', ...STATUS_FLOW, 'Cancelled'] as const).map(s => {
            const cfg = s !== 'All' ? STATUS_CFG[s as POStatus] : null
            return (
              <button key={s} onClick={() => setStatusFilter(s as typeof statusFilter)}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-full border transition-all ${
                  statusFilter === s
                    ? 'border-transparent text-white'
                    : 'border-gray-200 text-gray-500 hover:border-gray-400 bg-white'
                }`}
                style={statusFilter === s ? { background: cfg?.color ?? '#111' } : {}}>
                {s}
              </button>
            )
          })}
        </div>

        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowSuppliers(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Factory size={13} /> Suppliers
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-bold tracking-widest uppercase text-white hover:opacity-90 transition-opacity"
            style={{ background:'#C2185B' }}>
            <Plus size={14} /> New PO
          </button>
        </div>
      </div>

      {/* ── PO Table ── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">PO #</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Supplier</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Order Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Expected</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Items</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(o => {
                const total = poTotal(o)
                const isExp = expanded === o.id
                const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(o.status)+1]
                return (
                  <React.Fragment key={o.id}>
                    <tr className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                      onClick={() => setExpanded(isExp ? null : o.id)}>
                      {/* PO number */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {isExp ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                          <div>
                            <p className="font-bold text-[13px] text-gray-900 font-mono">{o.po_number}</p>
                            <p className="text-[10px] text-gray-400 sm:hidden">{o.supplier_name}</p>
                          </div>
                        </div>
                      </td>
                      {/* Supplier */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <p className="text-[13px] font-semibold text-gray-700">{o.supplier_name}</p>
                      </td>
                      {/* Order date */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-[12px] text-gray-500">
                          {new Date(o.order_date).toLocaleDateString('en-BD',{day:'numeric',month:'short',year:'2-digit'})}
                        </span>
                      </td>
                      {/* Expected */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-[12px] text-gray-500">
                          {o.received_date
                            ? <span className="text-emerald-600 font-semibold">Received {new Date(o.received_date).toLocaleDateString('en-BD',{day:'numeric',month:'short'})}</span>
                            : new Date(o.expected_date).toLocaleDateString('en-BD',{day:'numeric',month:'short',year:'2-digit'})
                          }
                        </span>
                      </td>
                      {/* Items */}
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-[13px] text-gray-700">
                          <Package size={12} className="text-gray-300" />
                          {o.items.length} line{o.items.length>1?'s':''}
                          <span className="text-[11px] text-gray-400">({o.items.reduce((s,i)=>s+i.qty_ordered,0)} units)</span>
                        </span>
                      </td>
                      {/* Total */}
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] font-bold text-gray-900">৳{total.toLocaleString()}</p>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5"><StatusBadge status={o.status} /></td>
                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => openEdit(o)} title="Edit"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#C2185B] hover:bg-[#FFF0F4] transition-colors">
                            <Edit2 size={13} />
                          </button>
                          {nextStatus && !['Received','Cancelled'].includes(o.status) && (
                            <button onClick={() => advanceStatus(o.id)}
                              title={`Mark as ${nextStatus}`}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                              <Send size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* ── Expanded detail panel ── */}
                    <AnimatePresence>
                      {isExp && (
                        <motion.tr key={`${o.id}-exp`}>
                          <td colSpan={8} className="p-0 bg-gray-50/60">
                            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                              exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}>
                              <div className="px-6 py-4 border-t border-gray-100">

                                {/* Line items table */}
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Line Items</p>
                                <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
                                  <table className="w-full text-[12px]">
                                    <thead className="bg-gray-100/60">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Product</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">SKU</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Colors</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Sizes</th>
                                        <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Qty</th>
                                        <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Unit Cost</th>
                                        <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Subtotal</th>
                                        {o.status === 'Received' && <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Received</th>}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {o.items.map(item => (
                                        <tr key={item.id} className="bg-white">
                                          <td className="px-4 py-2.5 font-medium text-gray-700">{item.product_name}</td>
                                          <td className="px-3 py-2.5 text-gray-400 font-mono">{item.sku}</td>
                                          <td className="px-3 py-2.5 text-gray-500">{item.colors.join(', ') || '—'}</td>
                                          <td className="px-3 py-2.5 text-gray-500">{item.sizes.join(', ') || '—'}</td>
                                          <td className="px-3 py-2.5 text-right font-semibold text-gray-800">{item.qty_ordered}</td>
                                          <td className="px-3 py-2.5 text-right text-gray-600">৳{item.unit_cost.toLocaleString()}</td>
                                          <td className="px-3 py-2.5 text-right font-bold text-gray-900">৳{(item.qty_ordered*item.unit_cost).toLocaleString()}</td>
                                          {o.status === 'Received' && (
                                            <td className="px-3 py-2.5 text-right">
                                              <span className={`font-semibold ${item.qty_received < item.qty_ordered ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {item.qty_received}
                                                {item.qty_received < item.qty_ordered && <AlertCircle size={10} className="inline ml-1" />}
                                              </span>
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Totals + notes */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px]">
                                  <div className="sm:col-span-2">
                                    {o.notes && (
                                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Notes</p>
                                        <p className="text-gray-600">{o.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="sm:col-span-2 space-y-1 text-right">
                                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>৳{o.items.reduce((s,i)=>s+i.qty_ordered*i.unit_cost,0).toLocaleString()}</span></div>
                                    {o.shipping_cost > 0 && <div className="flex justify-between text-gray-500"><span>Shipping</span><span>৳{o.shipping_cost.toLocaleString()}</span></div>}
                                    {o.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-৳{o.discount.toLocaleString()}</span></div>}
                                    <div className="flex justify-between font-bold text-gray-900 text-[14px] border-t border-gray-200 pt-1"><span>Total</span><span>৳{poTotal(o).toLocaleString()}</span></div>
                                  </div>
                                </div>

                                {/* Status advance button */}
                                {!['Received','Cancelled'].includes(o.status) && (() => {
                                  const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.status)+1]
                                  if (!next) return null
                                  return (
                                    <div className="mt-4 flex gap-2">
                                      <button onClick={() => advanceStatus(o.id)}
                                        className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
                                        style={{ background: STATUS_CFG[next].color }}>
                                        <Send size={12} /> Mark as {next}
                                      </button>
                                    </div>
                                  )
                                })()}
                              </div>
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-[11px] text-gray-400">
          {filtered.length} of {orders.length} purchase orders
        </div>
      </div>

      {/* ══════════════════════════════
          NEW / EDIT PO MODAL
      ══════════════════════════════ */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowForm(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <motion.div className="bg-white w-full max-w-3xl max-h-[92vh] flex flex-col rounded-xl shadow-2xl overflow-hidden"
                initial={{ scale:0.94, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.94, y:20 }}
                transition={{ type:'spring', stiffness:320, damping:30 }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                  <h3 className="font-bold text-[15px] text-gray-900">{editId ? 'Edit Purchase Order' : 'New Purchase Order'}</h3>
                  <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={18} /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                  {/* Supplier + dates row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Supplier / Factory *</label>
                      <select value={formData.supplier_id}
                        onChange={e => {
                          const s = SUPPLIERS.find(x => x.id===e.target.value)
                          setFormData(f => ({ ...f, supplier_id: e.target.value, supplier_name: s?.name ?? '' }))
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400">
                        <option value="">— Select supplier —</option>
                        {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      {formData.supplier_id && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          Lead time: {SUPPLIERS.find(s=>s.id===formData.supplier_id)?.lead_days} days
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Order Date</label>
                      <input type="date" value={formData.order_date}
                        onChange={e => setFormData(f=>({...f, order_date:e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Expected Delivery *</label>
                      <input type="date" value={formData.expected_date}
                        onChange={e => setFormData(f=>({...f, expected_date:e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400" />
                    </div>
                  </div>

                  {/* Line items */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Line Items</p>
                      <button onClick={addItem} className="flex items-center gap-1 text-[11px] font-semibold text-[#C2185B] hover:underline">
                        <Plus size={12} /> Add Item
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.items.map((item, idx) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                          <div className="grid grid-cols-12 gap-2 items-start">
                            {/* Product name */}
                            <div className="col-span-12 sm:col-span-4">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Product Name</label>
                              <input value={item.product_name}
                                onChange={e => updateItem(idx,'product_name',e.target.value)}
                                placeholder="e.g. Bloom Midi Dress"
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] text-gray-700 focus:outline-none focus:border-gray-400 bg-white" />
                            </div>
                            {/* SKU */}
                            <div className="col-span-6 sm:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">SKU</label>
                              <input value={item.sku}
                                onChange={e => updateItem(idx,'sku',e.target.value)}
                                placeholder="SJP-DR-001"
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] font-mono text-gray-700 focus:outline-none focus:border-gray-400 bg-white" />
                            </div>
                            {/* Qty */}
                            <div className="col-span-3 sm:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Qty</label>
                              <input type="number" min={1} value={item.qty_ordered}
                                onChange={e => updateItem(idx,'qty_ordered',parseInt(e.target.value)||1)}
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] text-gray-700 focus:outline-none focus:border-gray-400 bg-white" />
                            </div>
                            {/* Unit cost */}
                            <div className="col-span-3 sm:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Unit Cost (৳)</label>
                              <input type="number" min={0} value={item.unit_cost}
                                onChange={e => updateItem(idx,'unit_cost',parseFloat(e.target.value)||0)}
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] text-gray-700 focus:outline-none focus:border-gray-400 bg-white" />
                            </div>
                            {/* Subtotal + delete */}
                            <div className="col-span-12 sm:col-span-2 flex items-end justify-between sm:flex-col sm:items-end gap-1">
                              <div className="text-right">
                                <p className="text-[10px] text-gray-400">Subtotal</p>
                                <p className="text-[13px] font-bold text-gray-800">৳{(item.qty_ordered*item.unit_cost).toLocaleString()}</p>
                              </div>
                              {formData.items.length > 1 && (
                                <button onClick={() => removeItem(idx)} className="p-1 text-gray-300 hover:text-red-400 transition-colors"><X size={14} /></button>
                              )}
                            </div>
                          </div>
                          {/* Colors + Sizes */}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Colors (comma-separated)</label>
                              <input value={item.colors.join(', ')}
                                onChange={e => updateItem(idx,'colors', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                                placeholder="e.g. Blush Pink, Sage Green"
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] text-gray-700 focus:outline-none focus:border-gray-400 bg-white" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Sizes (comma-separated)</label>
                              <input value={item.sizes.join(', ')}
                                onChange={e => updateItem(idx,'sizes', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                                placeholder="e.g. S, M, L, XL"
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-[12px] text-gray-700 focus:outline-none focus:border-gray-400 bg-white" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping, discount, notes */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Shipping Cost (৳)</label>
                      <input type="number" min={0} value={formData.shipping_cost}
                        onChange={e => setFormData(f=>({...f,shipping_cost:parseFloat(e.target.value)||0}))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Discount (৳)</label>
                      <input type="number" min={0} value={formData.discount}
                        onChange={e => setFormData(f=>({...f,discount:parseFloat(e.target.value)||0}))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Status</label>
                      <select value={formData.status}
                        onChange={e => setFormData(f=>({...f,status:e.target.value as POStatus}))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400">
                        {STATUS_FLOW.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Notes / Instructions</label>
                    <textarea value={formData.notes} onChange={e => setFormData(f=>({...f,notes:e.target.value}))}
                      rows={3} placeholder="Quality requirements, packaging instructions, priority notes…"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400 resize-none" />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                  <p className="text-[13px] font-bold text-gray-900">
                    Total: <span style={{ color:'#C2185B' }}>৳{formTotal.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-400 font-normal ml-2">({formData.items.reduce((s,i)=>s+i.qty_ordered,0)} units)</span>
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowForm(false)}
                      className="px-5 py-2.5 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-500 hover:bg-gray-100 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSave}
                      className="px-6 py-2.5 text-[12px] font-bold tracking-widest uppercase text-white hover:opacity-90 transition-opacity"
                      style={{ background:'#C2185B' }}>
                      {editId ? 'Save Changes' : 'Create PO'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════
          SUPPLIERS MODAL
      ══════════════════════════════ */}
      <AnimatePresence>
        {showSuppliers && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowSuppliers(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <motion.div className="bg-white w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl shadow-2xl overflow-hidden"
                initial={{ scale:0.94, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.94, y:20 }}
                transition={{ type:'spring', stiffness:320, damping:30 }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                  <h3 className="font-bold text-[15px] text-gray-900">Suppliers & Factories</h3>
                  <button onClick={() => setShowSuppliers(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {SUPPLIERS.map(s => (
                    <div key={s.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FFF0F4] flex items-center justify-center shrink-0">
                            <Factory size={16} style={{ color:'#C2185B' }} />
                          </div>
                          <div>
                            <p className="font-bold text-[13px] text-gray-900">{s.name}</p>
                            <p className="text-[11px] text-gray-400">{s.contact_person}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] font-bold text-amber-600">{'★'.repeat(Math.round(s.rating))} {s.rating}</p>
                          <p className="text-[10px] text-gray-400">{s.total_orders} orders</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
                        <p className="flex items-center gap-1 text-gray-500"><Phone size={10} className="text-gray-300" /> {s.phone}</p>
                        <p className="flex items-center gap-1 text-gray-500"><Mail size={10} className="text-gray-300" /> {s.email}</p>
                        <p className="flex items-center gap-1 text-gray-500"><MapPin size={10} className="text-gray-300" /> {s.city}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-semibold text-gray-400">Speciality:</span>
                        {s.speciality.map(sp => <span key={sp} className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{sp}</span>)}
                        <span className="ml-auto text-[10px] font-semibold text-gray-400">Lead: {s.lead_days} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
