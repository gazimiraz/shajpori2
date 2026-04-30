'use client'
// src/app/admin/reports/page.tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import { Download, RefreshCw } from 'lucide-react'

// Mock data — replace with /api/admin/reports?type=xxx calls
const SIZE_DATA = [
  { size: 'XS', sold: 17, pct: 10 },
  { size: 'S',  sold: 32, pct: 19 },
  { size: 'M',  sold: 41, pct: 24 },
  { size: 'L',  sold: 28, pct: 17 },
  { size: 'XL', sold: 19, pct: 11 },
  { size: 'XXL',sold: 9,  pct: 5  },
  { size: 'One Size', sold: 24, pct: 14 },
]

const COLOR_DATA = [
  { color: 'Blush Pink',       hex: '#FFB6C1', sold: 22, revenue: 70400 },
  { color: 'Bubblegum Pink',   hex: '#FF69B4', sold: 18, revenue: 63000 },
  { color: 'Coral Orange',     hex: '#FF7F50', sold: 15, revenue: 61500 },
  { color: 'Ivory White',      hex: '#FFFFF0', sold: 12, revenue: 69600 },
  { color: 'Sage Green',       hex: '#B2C9AD', sold: 10, revenue: 32000 },
  { color: 'Deep Burgundy',    hex: '#800020', sold: 8,  revenue: 32800 },
  { color: 'Cotton Candy Pink',hex: '#FFB7D5', sold: 18, revenue: 43200 },
  { color: 'Rose Gold',        hex: '#B76E79', sold: 14, revenue: 16800 },
]

const STYLE_DATA = [
  { style: 'Midi / A-Line',    sold: 1, revenue: 3200,  margin: 56, stock: 45 },
  { style: 'Maxi / Ruffle',    sold: 1, revenue: 4100,  margin: 56, stock: 24 },
  { style: 'Mini / Smocked',   sold: 2, revenue: 4800,  margin: 60, stock: 88 },
  { style: 'Shoulder Bag',     sold: 1, revenue: 5800,  margin: 62, stock: 18 },
  { style: 'Structured Tote',  sold: 1, revenue: 3500,  margin: 63, stock: 33 },
  { style: 'Bracelet Set',     sold: 2, revenue: 2400,  margin: 68, stock: 95 },
]

const PRODUCT_PERF = [
  { sku:'SJP-BG-001', name:'Pearl Quilted Bag',        cat:'Bag',       price:5800, cost:2200, sold:1, revenue:5800,  profit:3600, margin:62, stock:18,  views:187 },
  { sku:'SJP-DR-003', name:'Cotton Candy Mini Dress',  cat:'Dress',     price:2400, cost:950,  sold:2, revenue:4800,  profit:2900, margin:60, stock:88,  views:210 },
  { sku:'SJP-DR-002', name:'Sunset Ruffle Maxi Dress', cat:'Dress',     price:4100, cost:1800, sold:1, revenue:4100,  profit:2300, margin:56, stock:24,  views:98  },
  { sku:'SJP-BG-002', name:'Hot Pink Mini Tote',       cat:'Bag',       price:3500, cost:1300, sold:1, revenue:3500,  profit:2200, margin:63, stock:33,  views:156 },
  { sku:'SJP-DR-001', name:'Bloom Garden Midi Dress',  cat:'Dress',     price:3200, cost:1400, sold:1, revenue:3200,  profit:1800, margin:56, stock:45,  views:142 },
  { sku:'SJP-AC-001', name:'Crystal Charm Bracelet',   cat:'Accessory', price:1200, cost:380,  sold:2, revenue:2400,  profit:1640, margin:68, stock:95,  views:89  },
]

const CAT_COLORS: Record<string, string> = { Dress: '#FF69B4', Bag: '#3B82F6', Accessory: '#F59E0B' }

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-lg font-bold text-[#1A1A2E] mb-4">{children}</h2>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('month')
  const [sortBy, setSortBy] = useState<'revenue' | 'margin' | 'sold'>('revenue')

  const sorted = [...PRODUCT_PERF].sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <div className="space-y-8">
      {/* Period filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
                period === p
                  ? 'bg-[#FF69B4] text-white'
                  : 'border border-gray-200 text-gray-500 hover:border-[#FF69B4] hover:text-[#FF69B4]'
              }`}
            >
              This {p}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#FF69B4] border border-gray-200 rounded-full px-4 py-1.5 transition-colors">
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* ── SIZE-WISE ── */}
      <section>
        <SectionTitle>Size-wise Sales Distribution</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={SIZE_DATA} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                <XAxis dataKey="size" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [v + ' units', 'Sold']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="sold" radius={[6, 6, 0, 0]}>
                  {SIZE_DATA.map((_, i) => (
                    <Cell key={i} fill={i === 2 ? '#FF69B4' : i === 1 ? '#FF94CC' : '#FFD6EC'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="grid grid-cols-3 gap-3 h-full content-start">
              {SIZE_DATA.map(s => (
                <motion.div
                  key={s.size}
                  className={`rounded-xl p-4 text-center ${s.size === 'M' ? 'bg-[#FFE4F1] border-2 border-[#FF69B4]' : 'bg-gray-50'}`}
                  whileHover={{ scale: 1.03 }}
                >
                  <p className="text-xs text-gray-400 mb-1 font-medium">{s.size}</p>
                  <p className={`text-2xl font-bold ${s.size === 'M' ? 'text-[#C2185B]' : 'text-[#1A1A2E]'}`}>{s.sold}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.pct}%</p>
                  {s.size === 'M' && <p className="text-xs text-[#FF69B4] font-bold mt-1">Best seller ⭑</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COLOR-WISE ── */}
      <section>
        <SectionTitle>Color-wise Sales Performance</SectionTitle>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="space-y-3">
            {COLOR_DATA.sort((a, b) => b.sold - a.sold).map((c, i) => (
              <div key={c.color} className="flex items-center gap-4">
                <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                <span className="w-4 h-4 rounded-full border border-gray-200 shrink-0" style={{ background: c.hex }} />
                <span className="text-sm font-medium text-[#1A1A2E] w-44">{c.color}</span>
                <div className="flex-1 h-6 bg-gray-50 rounded-lg overflow-hidden">
                  <motion.div
                    className="h-full rounded-lg flex items-center justify-end pr-2"
                    style={{ background: c.hex + '60' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.sold / COLOR_DATA[0].sold) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                  />
                </div>
                <span className="text-sm font-bold text-[#1A1A2E] w-16 text-right">{c.sold} sold</span>
                <span className="text-xs text-gray-400 w-24 text-right">৳{c.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STYLE-WISE ── */}
      <section>
        <SectionTitle>Style-wise Performance</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {STYLE_DATA.map(s => (
            <motion.div
              key={s.style}
              className="bg-white rounded-2xl border border-gray-100 p-5"
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,.07)' }}
            >
              <p className="text-xs text-gray-400 font-medium mb-1">{s.style}</p>
              <p className="font-display text-2xl font-bold text-[#1A1A2E] mb-3">৳{s.revenue.toLocaleString()}</p>
              <div className="space-y-1.5 text-xs text-gray-400">
                <div className="flex justify-between"><span>Units sold</span><span className="font-semibold text-[#1A1A2E]">{s.sold}</span></div>
                <div className="flex justify-between"><span>Gross margin</span><span className="font-semibold text-green-600">{s.margin}%</span></div>
                <div className="flex justify-between"><span>Stock remaining</span><span className="font-semibold text-[#1A1A2E]">{s.stock}</span></div>
              </div>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF69B4] rounded-full" style={{ width: `${s.margin}%` }} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRODUCT PERFORMANCE TABLE ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Product Performance</SectionTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort by:</span>
            {(['revenue', 'margin', 'sold'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  sortBy === s ? 'bg-[#FF69B4] text-white' : 'border border-gray-200 text-gray-500 hover:border-[#FF69B4]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-5 py-3">Product</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3">Category</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3">Price</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3">Sold</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3">Revenue</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3">Profit</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3">Margin</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3">Stock</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-3">Views</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <motion.tr
                  key={p.sku}
                  className="border-b border-gray-50 last:border-0 hover:bg-pink-50/30 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#1A1A2E] text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: CAT_COLORS[p.cat] + '18', color: CAT_COLORS[p.cat] }}>{p.cat}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-medium text-[#1A1A2E]">৳{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold text-[#1A1A2E]">{p.sold}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold text-[#1A1A2E]">৳{p.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold text-green-600">৳{p.profit.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.margin >= 65 ? 'bg-green-50 text-green-700' :
                      p.margin >= 55 ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>{p.margin}%</span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm text-[#1A1A2E]">{p.stock}</td>
                  <td className="px-4 py-3.5 text-right text-xs text-gray-400">{p.views}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
