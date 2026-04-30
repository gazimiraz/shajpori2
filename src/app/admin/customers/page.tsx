'use client'
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Download, ChevronDown, ChevronUp,
  User, Mail, Phone, MapPin, ShoppingBag, TrendingUp,
  Eye, MoreHorizontal, Star, Package
} from 'lucide-react'

/* ── Mock customer data ─────────────────────────────────── */
const CUSTOMERS = [
  { id:'C001', name:'Nadia Rahman',     email:'nadia.rahman@gmail.com',  phone:'01711-223344', city:'Dhaka',      orders:14, spent:42800, last_order:'2025-04-22', status:'VIP',      joined:'2024-01-15', tags:['VIP','Repeat'] },
  { id:'C002', name:'Sumaiya Islam',    email:'sumaiya@yahoo.com',       phone:'01812-334455', city:'Chittagong', orders:7,  spent:19200, last_order:'2025-04-18', status:'Regular',  joined:'2024-03-08', tags:['Regular'] },
  { id:'C003', name:'Farida Begum',     email:'farida.b@gmail.com',      phone:'01913-445566', city:'Sylhet',     orders:3,  spent:7400,  last_order:'2025-04-10', status:'New',      joined:'2025-02-20', tags:['New'] },
  { id:'C004', name:'Tasnim Akter',     email:'tasnim.a@hotmail.com',    phone:'01614-556677', city:'Dhaka',      orders:21, spent:78500, last_order:'2025-04-25', status:'VIP',      joined:'2023-11-05', tags:['VIP','Top Spender'] },
  { id:'C005', name:'Rifat Jahan',      email:'rifat.j@gmail.com',       phone:'01515-667788', city:'Rajshahi',   orders:2,  spent:4800,  last_order:'2025-03-30', status:'New',      joined:'2025-03-15', tags:['New'] },
  { id:'C006', name:'Mehrin Sultana',   email:'mehrin.s@gmail.com',      phone:'01716-778899', city:'Dhaka',      orders:9,  spent:28900, last_order:'2025-04-20', status:'Regular',  joined:'2024-06-12', tags:['Regular','Repeat'] },
  { id:'C007', name:'Ayesha Khanam',    email:'ayesha.k@gmail.com',      phone:'01817-889900', city:'Comilla',    orders:5,  spent:13200, last_order:'2025-04-05', status:'Regular',  joined:'2024-09-01', tags:['Regular'] },
  { id:'C008', name:'Sabrina Hossain',  email:'sabrina.h@gmail.com',     phone:'01918-990011', city:'Dhaka',      orders:18, spent:61300, last_order:'2025-04-26', status:'VIP',      joined:'2024-02-28', tags:['VIP','Repeat'] },
  { id:'C009', name:'Lamia Chowdhury',  email:'lamia.c@outlook.com',     phone:'01619-001122', city:'Khulna',     orders:1,  spent:2400,  last_order:'2025-04-01', status:'New',      joined:'2025-04-01', tags:['New'] },
  { id:'C010', name:'Shahnaz Parvin',   email:'shahnaz.p@gmail.com',     phone:'01520-112233', city:'Dhaka',      orders:11, spent:35600, last_order:'2025-04-23', status:'Regular',  joined:'2024-04-18', tags:['Regular','Repeat'] },
  { id:'C011', name:'Maliha Akter',     email:'maliha.a@gmail.com',      phone:'01721-223344', city:'Narayanganj',orders:6,  spent:16700, last_order:'2025-04-12', status:'Regular',  joined:'2024-07-22', tags:['Regular'] },
  { id:'C012', name:'Roksana Begum',    email:'roksana.b@gmail.com',     phone:'01822-334455', city:'Dhaka',      orders:25, spent:92100, last_order:'2025-04-27', status:'VIP',      joined:'2023-08-14', tags:['VIP','Top Spender'] },
]

const STATUS_STYLES: Record<string, string> = {
  VIP:     'bg-amber-50 text-amber-700 border border-amber-200',
  Regular: 'bg-blue-50 text-blue-700 border border-blue-200',
  New:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

const KPI = [
  { label:'Total Customers', value:'12', sub:'+3 this month',   color:'#7C3AED' },
  { label:'VIP Customers',   value:'4',  sub:'৳273K+ spent',    color:'#C2185B' },
  { label:'Avg. Order Value',value:'৳3,180', sub:'Per order',   color:'#0891B2' },
  { label:'Repeat Rate',     value:'67%', sub:'Bought 2+ times',color:'#059669' },
]

type Customer = typeof CUSTOMERS[0]
type SortKey = 'name' | 'orders' | 'spent' | 'last_order'

export default function CustomersPage() {
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState<'All'|'VIP'|'Regular'|'New'>('All')
  const [sortKey,   setSortKey]   = useState<SortKey>('spent')
  const [sortDesc,  setSortDesc]  = useState(true)
  const [expanded,  setExpanded]  = useState<string | null>(null)
  const [filterOpen,setFilterOpen]= useState(false)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(v => !v)
    else { setSortKey(key); setSortDesc(true) }
  }

  const list = useMemo(() => {
    let d = [...CUSTOMERS]
    if (search) d = d.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    )
    if (filter !== 'All') d = d.filter(c => c.status === filter)
    d.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return sortDesc ? bv - av : av - bv
      return sortDesc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv))
    })
    return d
  }, [search, filter, sortKey, sortDesc])

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k
      ? sortDesc ? <ChevronDown size={13} className="text-[#C2185B]" /> : <ChevronUp size={13} className="text-[#C2185B]" />
      : <ChevronDown size={13} className="text-gray-300" />
  )

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
                  <button className="flex items-center gap-1" onClick={() => toggleSort('name')}>Customer <SortIcon k="name" /></button>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Location</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('orders')}>Orders <SortIcon k="orders" /></button>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('spent')}>Total Spent <SortIcon k="spent" /></button>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('last_order')}>Last Order <SortIcon k="last_order" /></button>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map(c => (
                <React.Fragment key={c.id}>
                  <tr
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                    className="hover:bg-gray-50/70 cursor-pointer transition-colors">
                    {/* Customer */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: c.status === 'VIP' ? '#C2185B' : c.status === 'Regular' ? '#1565C0' : '#059669' }}>
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-[13px]">{c.name}</p>
                          <p className="text-[11px] text-gray-400">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-[12px] text-gray-600">{c.email}</p>
                      <p className="text-[11px] text-gray-400">{c.phone}</p>
                    </td>
                    {/* Location */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-[12px] text-gray-500">
                        <MapPin size={11} className="text-gray-300" /> {c.city}
                      </span>
                    </td>
                    {/* Orders */}
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 text-[13px] font-semibold text-gray-700">
                        <Package size={12} className="text-gray-300" /> {c.orders}
                      </span>
                    </td>
                    {/* Spent */}
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-bold text-gray-900">৳{c.spent.toLocaleString()}</span>
                    </td>
                    {/* Last order */}
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-[12px] text-gray-500">
                        {new Date(c.last_order).toLocaleDateString('en-BD', { day:'numeric', month:'short', year:'2-digit' })}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_STYLES[c.status]}`}>
                        {c.status === 'VIP' && <Star size={9} className="inline mr-0.5 -mt-0.5" />}
                        {c.status}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <button className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={e => e.stopPropagation()}>
                        <MoreHorizontal size={15} />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded detail panel */}
                  <AnimatePresence>
                    {expanded === c.id && (
                      <motion.tr key={`${c.id}-exp`}>
                        <td colSpan={8} className="p-0 bg-gray-50/80">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-5 border-t border-gray-100">
                              {/* Customer info */}
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Contact Info</p>
                                <div className="space-y-1.5 text-[12px]">
                                  <p className="flex items-center gap-1.5 text-gray-600"><Mail size={11} className="text-gray-300" /> {c.email}</p>
                                  <p className="flex items-center gap-1.5 text-gray-600"><Phone size={11} className="text-gray-300" /> {c.phone}</p>
                                  <p className="flex items-center gap-1.5 text-gray-600"><MapPin size={11} className="text-gray-300" /> {c.city}</p>
                                </div>
                              </div>

                              {/* Order stats */}
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Order Stats</p>
                                <div className="space-y-1.5 text-[12px]">
                                  <p className="flex items-center gap-1.5 text-gray-600"><ShoppingBag size={11} className="text-gray-300" /> {c.orders} orders placed</p>
                                  <p className="flex items-center gap-1.5 text-gray-600"><TrendingUp size={11} className="text-gray-300" /> Avg ৳{Math.round(c.spent / c.orders).toLocaleString()} / order</p>
                                  <p className="flex items-center gap-1.5 text-gray-600"><Eye size={11} className="text-gray-300" /> Joined {new Date(c.joined).toLocaleDateString('en-BD', { day:'numeric', month:'short', year:'numeric' })}</p>
                                </div>
                              </div>

                              {/* Tags */}
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Tags</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {c.tags.map(t => (
                                    <span key={t} className="text-[10px] font-semibold px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-600">{t}</span>
                                  ))}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Actions</p>
                                <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:border-gray-300 transition-colors">
                                  <Eye size={12} /> View Orders
                                </button>
                                <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:border-gray-300 transition-colors">
                                  <Mail size={12} /> Send Email
                                </button>
                                <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold bg-[#C2185B] text-white rounded-lg hover:bg-[#A01548] transition-colors">
                                  <Star size={12} /> Mark as VIP
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">Showing {list.length} of {CUSTOMERS.length} customers</p>
          <div className="flex items-center gap-1">
            {['1','2','3'].map(p => (
              <button key={p}
                className={`w-7 h-7 rounded text-[11px] font-semibold transition-colors ${p === '1' ? 'bg-[#C2185B] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
