'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Download, ChevronDown, ChevronUp,
  User, Mail, Phone, MapPin, ShoppingBag, TrendingUp,
  Eye, MoreHorizontal, Star, Package, Loader2, RefreshCw
} from 'lucide-react'

interface Customer {
  id: string; email: string; full_name: string; phone: string
  total_orders: number; total_spent: number; loyalty_points: number
  created_at: string; shipping_address?: { city?: string }
}

function statusOf(c: Customer): 'VIP' | 'Regular' | 'New' {
  if (c.total_spent >= 20000) return 'VIP'
  if (c.total_orders >= 2)   return 'Regular'
  return 'New'
}

const STATUS_STYLES: Record<string, string> = {
  VIP:     'bg-amber-50 text-amber-700 border border-amber-200',
  Regular: 'bg-blue-50 text-blue-700 border border-blue-200',
  New:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

type SortKey = 'full_name' | 'total_orders' | 'total_spent' | 'created_at'

export default function CustomersPage() {
  const [customers,  setCustomers]  = useState<Customer[]>([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState<'All'|'VIP'|'Regular'|'New'>('All')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortKey,    setSortKey]    = useState<SortKey>('total_spent')
  const [sortDesc,   setSortDesc]   = useState(true)
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [page,       setPage]       = useState(1)

  const load = useCallback(async (q = search) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/customers?search=${encodeURIComponent(q)}&page=${page}&per_page=20`)
      const json = await res.json()
      if (json.data) { setCustomers(json.data); setTotal(json.count ?? 0) }
    } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [page])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => load(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(v => !v)
    else { setSortKey(key); setSortDesc(true) }
  }

  const list = [...customers]
    .filter(c => filter === 'All' || statusOf(c) === filter)
    .sort((a, b) => {
      const av = (a as any)[sortKey], bv = (b as any)[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return sortDesc ? bv - av : av - bv
      return sortDesc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv))
    })

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k
      ? sortDesc ? <ChevronDown size={13} className="text-[#C2185B]" /> : <ChevronUp size={13} className="text-[#C2185B]" />
      : <ChevronDown size={13} className="text-gray-300" />
  )

  const vipCount     = customers.filter(c => statusOf(c) === 'VIP').length
  const totalSpent   = customers.reduce((s, c) => s + (c.total_spent || 0), 0)
  const totalOrders  = customers.reduce((s, c) => s + (c.total_orders || 0), 0)
  const avgOrderVal  = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0
  const repeatCount  = customers.filter(c => c.total_orders >= 2).length
  const repeatRate   = customers.length > 0 ? Math.round((repeatCount / customers.length) * 100) : 0

  const KPI = [
    { label:'Total Customers', value: total.toString(),        sub:'All registered',        color:'#7C3AED' },
    { label:'VIP Customers',   value: vipCount.toString(),     sub:'৳20k+ spent',           color:'#C2185B' },
    { label:'Avg. Order Value',value:`৳${avgOrderVal.toLocaleString()}`, sub:'Per order',   color:'#0891B2' },
    { label:'Repeat Rate',     value:`${repeatRate}%`,         sub:'Bought 2+ times',       color:'#059669' },
  ]

  return (
    <div className="space-y-6">

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.color + '15' }}>
              <User size={18} style={{ color: k.color }} />
            </div>
            <div>
              <p className="text-[20px] font-black text-gray-900 leading-none">{k.value}</p>
              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{k.label}</p>
              <p className="text-[10px] text-gray-400">{k.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-[15px] shrink-0">All Customers</h2>

          <div className="flex items-center gap-2 flex-1 flex-wrap sm:justify-end">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, phone…"
                className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-gray-300 w-52 transition-all" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <button onClick={() => setFilterOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Filter size={12} /> {filter} <ChevronDown size={11} />
              </button>
              <AnimatePresence>
                {filterOpen && (
                  <motion.div className="absolute right-0 top-[calc(100%+4px)] bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[130px]"
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}>
                    {(['All','VIP','Regular','New'] as const).map(s => (
                      <button key={s} onClick={() => { setFilter(s); setFilterOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${filter === s ? 'bg-gray-50 text-[#C2185B]' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {s === 'All' ? 'All Customers' : s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export */}
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={12} /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('full_name')}>Customer <SortIcon k="full_name" /></button>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('total_orders')}>Orders <SortIcon k="total_orders" /></button>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('total_spent')}>Total Spent <SortIcon k="total_spent" /></button>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('created_at')}>Joined <SortIcon k="created_at" /></button>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Loader2 size={24} className="animate-spin text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-400 mt-2">Loading customers…</p>
                </td></tr>
              )}
              {!loading && list.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-gray-400 text-sm">No customers found</td></tr>
              )}
              {!loading && list.map(c => {
                const st = statusOf(c)
                const initials = (c.full_name || c.email).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                const city = c.shipping_address?.city || '—'
                return (
                  <React.Fragment key={c.id}>
                    <tr onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                      className="hover:bg-gray-50/70 cursor-pointer transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: st === 'VIP' ? '#C2185B' : st === 'Regular' ? '#1565C0' : '#059669' }}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-[13px]">{c.full_name || 'No name'}</p>
                            <p className="text-[11px] text-gray-400">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-[12px] text-gray-600">{c.email}</p>
                        <p className="text-[11px] text-gray-400">{c.phone || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-[13px] font-semibold text-gray-700">
                          <Package size={12} className="text-gray-300" /> {c.total_orders}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] font-bold text-gray-900">৳{(c.total_spent || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-[12px] text-gray-500">
                          {new Date(c.created_at).toLocaleDateString('en-BD', { day:'numeric', month:'short', year:'2-digit' })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_STYLES[st]}`}>
                          {st === 'VIP' && <Star size={9} className="inline mr-0.5 -mt-0.5" />}
                          {st}
                        </span>
                      </td>
                    </tr>

                    <AnimatePresence>
                      {expanded === c.id && (
                        <motion.tr key={`${c.id}-exp`}>
                          <td colSpan={6} className="p-0 bg-gray-50/80">
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                              <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-5 border-t border-gray-100">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Contact Info</p>
                                  <div className="space-y-1.5 text-[12px]">
                                    <p className="flex items-center gap-1.5 text-gray-600"><Mail size={11} className="text-gray-300" /> {c.email}</p>
                                    <p className="flex items-center gap-1.5 text-gray-600"><Phone size={11} className="text-gray-300" /> {c.phone || '—'}</p>
                                    <p className="flex items-center gap-1.5 text-gray-600"><MapPin size={11} className="text-gray-300" /> {city}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Order Stats</p>
                                  <div className="space-y-1.5 text-[12px]">
                                    <p className="flex items-center gap-1.5 text-gray-600"><ShoppingBag size={11} className="text-gray-300" /> {c.total_orders} orders placed</p>
                                    <p className="flex items-center gap-1.5 text-gray-600"><TrendingUp size={11} className="text-gray-300" /> ৳{(c.total_spent || 0).toLocaleString()} total</p>
                                    <p className="flex items-center gap-1.5 text-gray-600"><Star size={11} className="text-gray-300" /> {c.loyalty_points} points</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Joined</p>
                                  <p className="text-[12px] text-gray-600">{new Date(c.created_at).toLocaleDateString('en-BD', { day:'numeric', month:'long', year:'numeric' })}</p>
                                </div>
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

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">Showing {list.length} of {total} customers</p>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded text-[11px] font-semibold text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors">← Prev</button>
            <span className="text-[11px] text-gray-500 px-2">Page {page}</span>
            <button disabled={list.length < 20} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded text-[11px] font-semibold text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors">Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
