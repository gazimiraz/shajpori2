'use client'
// src/app/admin/finance/page.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import { Plus, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import toast from 'react-hot-toast'

const LEDGER = [
  { id:'l1', date:'2025-04-22', type:'revenue',  cat:'product_sale',      desc:'Order SJP-2025-00004 — Cotton Candy Mini ×2', amount:4800 },
  { id:'l2', date:'2025-04-21', type:'revenue',  cat:'product_sale',      desc:'Order SJP-2025-00003 — Sunset Ruffle Maxi ×1', amount:4100 },
  { id:'l3', date:'2025-04-18', type:'revenue',  cat:'product_sale',      desc:'Order SJP-2025-00002 — Pearl Bag + Bracelet',  amount:8200 },
  { id:'l4', date:'2025-04-10', type:'expense',  cat:'overhead',          desc:'Monthly rent — Showroom, Gulshan',             amount:35000 },
  { id:'l5', date:'2025-04-08', type:'revenue',  cat:'product_sale',      desc:'Order SJP-2025-00001 — Bloom Garden Midi ×1',  amount:3200 },
  { id:'l6', date:'2025-04-05', type:'expense',  cat:'marketing',         desc:'Facebook & Instagram Ads — April campaign',    amount:12000 },
  { id:'l7', date:'2025-04-03', type:'revenue',  cat:'delivery_fee',      desc:'Delivery — Order SJP-2025-00005',              amount:80 },
  { id:'l8', date:'2025-04-03', type:'revenue',  cat:'product_sale',      desc:'Order SJP-2025-00005 — Hot Pink Mini Tote ×1', amount:3500 },
  { id:'l9', date:'2025-04-01', type:'expense',  cat:'overhead',          desc:'Staff salaries — April 2025',                  amount:85000 },
  { id:'l10',date:'2025-03-30', type:'expense',  cat:'supplier_payment',  desc:'Payment — Dhaka Fashion House, March batch',   amount:45000 },
  { id:'l11',date:'2025-03-28', type:'expense',  cat:'packaging',         desc:'Packaging materials restock',                  amount:8500 },
  { id:'l12',date:'2025-03-15', type:'expense',  cat:'overhead',          desc:'Monthly rent — Showroom, March',               amount:35000 },
]

const MONTHLY_CASHFLOW = [
  { month:'Jan', inflow:12000,  outflow:135000 },
  { month:'Feb', inflow:14500,  outflow:140000 },
  { month:'Mar', inflow:15500,  outflow:175000 },
  { month:'Apr', inflow:19080,  outflow:185500 },
]

const EXPENSE_BREAKDOWN = [
  { name:'Salaries',   value:85000, color:'#EF4444' },
  { name:'Rent',       value:35000, color:'#F59E0B' },
  { name:'Suppliers',  value:45000, color:'#8B5CF6' },
  { name:'Marketing',  value:12000, color:'#3B82F6' },
  { name:'Packaging',  value:8500,  color:'#22C55E' },
]
const totalExpenses = EXPENSE_BREAKDOWN.reduce((s, e) => s + e.value, 0)

const TYPE_CONFIG: Record<string, { bg: string; text: string; sign: string; label: string }> = {
  revenue:    { bg:'#F0FDF4', text:'#15803D', sign:'+', label:'Revenue'    },
  expense:    { bg:'#FEF2F2', text:'#B91C1C', sign:'-', label:'Expense'    },
  refund:     { bg:'#FFFBEB', text:'#B45309', sign:'-', label:'Refund'     },
  adjustment: { bg:'#F5F3FF', text:'#6D28D9', sign:'±', label:'Adjustment' },
}

const CAT_LABEL: Record<string, string> = {
  product_sale:'Product Sale', delivery_fee:'Delivery', supplier_payment:'Supplier', overhead:'Overhead', marketing:'Marketing', packaging:'Packaging', other:'Other'
}

export default function FinancePage() {
  const [tab, setTab] = useState<'overview' | 'ledger' | 'add'>('overview')
  const [ledger, setLedger] = useState(LEDGER)
  const [newEntry, setNewEntry] = useState({ type:'expense', cat:'overhead', desc:'', amount:'', date: new Date().toISOString().split('T')[0] })

  const revenue = ledger.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0)
  const expenses = ledger.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const refunds = ledger.filter(e => e.type === 'refund').reduce((s, e) => s + e.amount, 0)
  const netProfit = revenue - expenses - refunds
  const margin = revenue > 0 ? Math.round((netProfit / revenue) * 1000) / 10 : 0

  const handleAddEntry = () => {
    if (!newEntry.desc || !newEntry.amount) { toast.error('Please fill all fields'); return }
    const entry = { id: 'l' + Date.now(), date: newEntry.date, type: newEntry.type, cat: newEntry.cat, desc: newEntry.desc, amount: parseFloat(newEntry.amount) }
    setLedger(prev => [entry, ...prev])
    setNewEntry({ type:'expense', cat:'overhead', desc:'', amount:'', date: new Date().toISOString().split('T')[0] })
    toast.success('Entry added to ledger')
    setTab('ledger')
  }

  return (
    <div className="space-y-6">
      {/* Summary KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Revenue', value:`৳${revenue.toLocaleString()}`, icon:TrendingUp, color:'#22C55E', bg:'#F0FDF4', trend:'+23%', up:true },
          { label:'Total Expenses', value:`৳${expenses.toLocaleString()}`, icon:TrendingDown, color:'#EF4444', bg:'#FEF2F2', trend:'+12%', up:false },
          { label:'Net Profit', value:`৳${Math.abs(netProfit).toLocaleString()}`, icon:DollarSign, color: netProfit >= 0 ? '#22C55E' : '#EF4444', bg: netProfit >= 0 ? '#F0FDF4' : '#FEF2F2', trend:`${margin}%`, up: netProfit >= 0 },
          { label:'Total Refunds', value:`৳${refunds.toLocaleString()}`, icon:ArrowDownRight, color:'#F59E0B', bg:'#FFFBEB', trend:'0%', up:true },
        ].map(({ label, value, icon: Icon, color, bg, trend, up }) => (
          <motion.div key={label} className="bg-white rounded-2xl border border-gray-100 p-5" whileHover={{ y:-3 }} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={16} style={{ color }} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{trend}
              </span>
            </div>
            <p className="text-xl font-bold text-[#1A1A2E]">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {(['overview','ledger','add'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-white shadow-sm text-[#1A1A2E]' : 'text-gray-400 hover:text-gray-600'}`}>
            {t === 'add' ? '+ Add Entry' : t === 'overview' ? 'Overview' : 'Ledger'}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cashflow area chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
              <div className="mb-4">
                <h3 className="font-display text-base font-bold text-[#1A1A2E]">Monthly Cashflow</h3>
                <p className="text-xs text-gray-400 mt-0.5">Inflow vs Outflow · BDT ৳</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_CASHFLOW} barSize={24} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:'#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number, name: string) => [`৳${v.toLocaleString()}`, name === 'inflow' ? 'Revenue' : 'Expenses']} contentStyle={{ borderRadius:12, fontSize:12 }} />
                  <Bar dataKey="inflow"   name="Revenue"  fill="#22C55E" radius={[5,5,0,0]} />
                  <Bar dataKey="outflow"  name="Expenses" fill="#FCA5A5" radius={[5,5,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Donut */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-display text-base font-bold text-[#1A1A2E] mb-1">Expense Breakdown</h3>
              <p className="text-xs text-gray-400 mb-3">April 2025</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={EXPENSE_BREAKDOWN} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                    {EXPENSE_BREAKDOWN.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`৳${v.toLocaleString()}`, '']} contentStyle={{ borderRadius:10, fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {EXPENSE_BREAKDOWN.map(e => (
                  <div key={e.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                      {e.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1A1A2E]">৳{e.value.toLocaleString()}</span>
                      <span className="text-gray-400">{Math.round(e.value / totalExpenses * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* P&L Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-display text-base font-bold text-[#1A1A2E] mb-4">Profit & Loss Summary — April 2025</h3>
            <div className="space-y-3">
              {[
                { label:'Gross Revenue',          value: revenue,    color:'text-green-700',   bg:'bg-green-50',  sign:'+' },
                { label:'Less: Cost of Goods',    value:-36630,      color:'text-red-600',     bg:'bg-red-50',    sign:'-' },
                { label:'Gross Profit',            value: revenue - 36630, color:'text-blue-700', bg:'bg-blue-50', sign:'=' },
                { label:'Less: Operating Expenses',value:-expenses,  color:'text-red-600',     bg:'bg-red-50',    sign:'-' },
                { label:'Net Profit / (Loss)',     value: netProfit,  color: netProfit >= 0 ? 'text-green-700' : 'text-red-600', bg: netProfit >= 0 ? 'bg-green-50' : 'bg-red-50', sign:'=' },
              ].map(({ label, value, color, bg, sign }) => (
                <div key={label} className={`flex items-center justify-between px-4 py-3 rounded-xl ${bg}`}>
                  <span className={`text-sm font-medium ${color}`}>{label}</span>
                  <span className={`text-base font-bold ${color}`}>
                    {value < 0 ? '(৳' + Math.abs(value).toLocaleString() + ')' : '৳' + value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LEDGER */}
      {tab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Date','Type','Category','Description','Amount'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {ledger.map((e, i) => {
                    const cfg = TYPE_CONFIG[e.type] || TYPE_CONFIG.adjustment
                    return (
                      <motion.tr
                        key={e.id}
                        layout
                        initial={{ opacity:0, backgroundColor:'#FFF0F7' }}
                        animate={{ opacity:1, backgroundColor:'transparent' }}
                        exit={{ opacity:0, height:0 }}
                        transition={{ duration:0.3, delay: i * 0.02 }}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                      >
                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">{e.date}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">{CAT_LABEL[e.cat] || e.cat}</td>
                        <td className="px-5 py-3.5 text-sm text-[#1A1A2E] max-w-[280px]">
                          <p className="truncate">{e.desc}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-sm font-bold ${e.type === 'revenue' ? 'text-green-600' : 'text-red-500'}`}>
                            {e.type === 'revenue' ? '+' : '-'}৳{e.amount.toLocaleString()}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {/* Running total footer */}
          <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-end gap-8 text-xs font-semibold">
            <span className="text-green-600">Revenue: ৳{revenue.toLocaleString()}</span>
            <span className="text-red-500">Expenses: ৳{expenses.toLocaleString()}</span>
            <span className={netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}>Net: {netProfit >= 0 ? '+' : '-'}৳{Math.abs(netProfit).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* ADD ENTRY */}
      {tab === 'add' && (
        <motion.div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
          <h3 className="font-display text-lg font-bold text-[#1A1A2E] mb-6">Add Ledger Entry</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Entry Type</label>
              <div className="flex gap-2">
                {(['revenue','expense','refund','adjustment'] as const).map(t => (
                  <button key={t} onClick={() => setNewEntry(p => ({ ...p, type: t }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${newEntry.type === t ? 'bg-[#FF69B4] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
              <select value={newEntry.cat} onChange={e => setNewEntry(p => ({ ...p, cat: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF69B4]">
                <option value="product_sale">Product Sale</option>
                <option value="delivery_fee">Delivery Fee</option>
                <option value="supplier_payment">Supplier Payment</option>
                <option value="overhead">Overhead</option>
                <option value="marketing">Marketing</option>
                <option value="packaging">Packaging</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
              <input type="text" value={newEntry.desc} onChange={e => setNewEntry(p => ({ ...p, desc: e.target.value }))}
                placeholder="e.g. Staff salary — May 2025"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF69B4]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amount (BDT ৳)</label>
                <input type="number" value={newEntry.amount} onChange={e => setNewEntry(p => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00" min="0" step="0.01"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF69B4]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                <input type="date" value={newEntry.date} onChange={e => setNewEntry(p => ({ ...p, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF69B4]" />
              </div>
            </div>
            <motion.button onClick={handleAddEntry}
              className="w-full bg-[#FF69B4] text-white rounded-xl py-3 text-sm font-semibold mt-2"
              whileHover={{ backgroundColor:'#FF1493' }} whileTap={{ scale:0.98 }}>
              <Plus size={14} className="inline mr-1.5" />Add to Ledger
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
