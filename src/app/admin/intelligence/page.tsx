'use client'
// src/app/admin/intelligence/page.tsx
// Complete sales intelligence dashboard with alerts, bestsellers, size analysis,
// time patterns, restock forecasts and monthly seasonal trends.
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import { AlertTriangle, TrendingUp, Clock, Package, Calendar, Star, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Alert { id:string; severity:'critical'|'warning'|'info'|'success'; type:string; title:string; description:string; action?:string }
interface Forecast { sku:string; product_name:string; size:string; color:string; stock:number; daily_rate:number; days_left:number; reorder_qty:number; estimated_cost:number; priority:string }
interface HourlyData { hour:number; count:number; pct:number; label:string }
interface BestSeller { name:string; sku:string; category:string; units_sold:number; revenue:number; margin:number }
interface SizeRank { size:string; sold:number; pct:number }

// ── Mock data (replace with real API calls) ────────────────────────────────────
const MOCK_ALERTS: Alert[] = [
  { id:'a1', severity:'critical', type:'stock',   title:'OUT OF STOCK — SJP-DR-002-L-BURG (Sunset Ruffle Maxi, L, Deep Burgundy)', description:'0 units remaining. This variant has 2 pending customer enquiries. Sold out 3× faster than forecast. Recommend ordering 20 units from Dhaka Fashion House. Supplier lead time: 5 days.', action:'Place PO now' },
  { id:'a2', severity:'critical', type:'stock',   title:'RESTOCK OVERDUE — Bloom Garden Midi (S, Blush Pink) — 3 days supply left', description:'Only 8 units in stock. Selling at 2.3 units/week. Eid season approaching — demand expected to surge 40–60%. Place purchase order today for at least 25 units.', action:'Order today' },
  { id:'a3', severity:'critical', type:'payment', title:'UNPAID ORDER — SJP-2025-00004 (৳4,800 COD) — 26 hours outstanding', description:'Cash on delivery order from Reshma Akter is unpaid. Auto-cancel policy triggers at 48 hours. Follow up via phone immediately before dispatching stock.', action:'Call customer' },
  { id:'a4', severity:'warning',  type:'stock',   title:'LOW STOCK — Pearl Quilted Bag (Dusty Rose) — 4 units, ~12 days supply', description:'Selling 2.3 units/month. Dusty Rose is your #2 colour for bags. Reorder point reached. Suggest 15 units from Gulshan Leather Works.', action:'Order within 3 days' },
  { id:'a5', severity:'warning',  type:'stock',   title:'LOW STOCK — Sunset Ruffle Maxi (S, Coral Orange) — 3 units', description:'Coral Orange is your best-selling colour this month. Only 3 left in size S. This colour/size combination has the highest repeat demand.', action:'Order within 3 days' },
  { id:'a6', severity:'warning',  type:'slow',    title:'SLOW MOVER — Crystal Bracelet (Gold) — 28 units, 0 sales in 30 days', description:'Gold variant has zero sales in April. Rose Gold sells 5× faster. Consider 10–15% discount or bundle with a dress purchase to clear stock.', action:'Run promotion' },
  { id:'a7', severity:'warning',  type:'stock',   title:'LOW STOCK — Bloom Garden Midi (XS, Blush Pink) — 5 units, ~18 days supply', description:'Running low ahead of Eid season. XS is undersupplied relative to demand share. Include in next purchase order.', action:'Plan reorder' },
  { id:'a8', severity:'info',     type:'season',  title:'EID SEASON in 14 days — increase stock of top sellers by 60–80%', description:'Historical data shows sales spike 3.2× in the 2 weeks before Eid. Prioritise: Cotton Candy Mini (all colours), Bloom Garden Midi (Pink, Green), Hot Pink Mini Tote. Place PO by Thursday.', action:'Review PO list' },
  { id:'a9', severity:'info',     type:'insight', title:'SIZE M is your #1 seller — consistently undersupplied relative to demand', description:'M accounts for 24% of all size sales but only 19% of current stock across dresses. Adjust future order ratios: XS 10% · S 20% · M 30% · L 22% · XL 13% · XXL 5%.', action:'Update order ratios' },
  { id:'a10',severity:'info',     type:'pattern', title:'PEAK SALES HOUR: 8–10 PM daily — 38% of orders placed in this window', description:'Ensure order processing team is available 7–10 PM. Enable automated confirmation emails for late-night orders. Consider scheduling flash sale notifications for 7:30 PM.', action:'Set up automation' },
  { id:'a11',severity:'success',  type:'opportunity', title:'Cotton Candy Mini Dress is your highest volume seller — expand the range', description:'2 units sold in 1 order, 95 page views (highest conversion rate 2.1%). Consider adding 2–3 new colourways before Eid to capitalise on demand momentum.', action:'Plan new colours' },
  { id:'a12',severity:'success',  type:'opportunity', title:'Crystal Bracelet Set has 68% gross margin — your most profitable SKU', description:'Cost ৳380, sells ৳1,200. Best margin in catalogue. High stock (95 units). Increase marketing and bundle with dresses. A "dress + bracelet" combo could boost AOV by ৳800–1,200.', action:'Create bundle' },
  { id:'a13',severity:'success',  type:'opportunity', title:'Free delivery threshold (৳2,000) is driving large baskets — ৳8,200 avg qualifying order', description:'60% of orders clear ৳2,000+ and earn free delivery. Upsell accessories at checkout to push orders past the threshold. Potential AOV increase: ৳400–600 per order.', action:'Set up upsell' },
]

const MOCK_FORECASTS: Forecast[] = [
  { sku:'SJP-DR-002-L-BURG',  product_name:'Sunset Ruffle Maxi', size:'L',        color:'Deep Burgundy',    stock:0,  daily_rate:0.33, days_left:0,   reorder_qty:20, estimated_cost:36000, priority:'critical' },
  { sku:'SJP-DR-001-S-PINK',  product_name:'Bloom Garden Midi',  size:'S',        color:'Blush Pink',       stock:8,  daily_rate:0.33, days_left:3,   reorder_qty:25, estimated_cost:35000, priority:'critical' },
  { sku:'SJP-DR-002-S-CORAL', product_name:'Sunset Ruffle Maxi', size:'S',        color:'Coral Orange',     stock:3,  daily_rate:0.23, days_left:9,   reorder_qty:20, estimated_cost:36000, priority:'high' },
  { sku:'SJP-BG-001-OS-RSE',  product_name:'Pearl Quilted Bag',  size:'One Size', color:'Dusty Rose',       stock:4,  daily_rate:0.27, days_left:12,  reorder_qty:15, estimated_cost:33000, priority:'high' },
  { sku:'SJP-DR-001-XS-PINK', product_name:'Bloom Garden Midi',  size:'XS',       color:'Blush Pink',       stock:5,  daily_rate:0.17, days_left:18,  reorder_qty:15, estimated_cost:21000, priority:'medium' },
  { sku:'SJP-BG-002-OS-PINK', product_name:'Hot Pink Mini Tote', size:'One Size', color:'Bubblegum Pink',   stock:12, daily_rate:0.23, days_left:45,  reorder_qty:15, estimated_cost:19500, priority:'low' },
  { sku:'SJP-DR-003-S-CPINK', product_name:'Cotton Candy Mini',  size:'S',        color:'Cotton Candy Pink',stock:18, daily_rate:0.19, days_left:62,  reorder_qty:20, estimated_cost:19000, priority:'low' },
  { sku:'SJP-AC-001-OS-RG',   product_name:'Crystal Bracelet',   size:'One Size', color:'Rose Gold',        stock:35, daily_rate:0.23, days_left:90,  reorder_qty:0,  estimated_cost:0,     priority:'low' },
  { sku:'SJP-AC-001-OS-GLD',  product_name:'Crystal Bracelet',   size:'One Size', color:'Gold',             stock:28, daily_rate:0,    days_left:999, reorder_qty:0,  estimated_cost:0,     priority:'low' },
]

const MOCK_HOURLY: HourlyData[] = Array.from({length:24}, (_, h) => {
  const counts = [0,0,0,0,0,1,2,4,6,7,5,6,8,9,7,8,10,12,14,20,22,18,14,8]
  return { hour:h, count:counts[h], pct:Math.round(counts[h]/136*1000)/10, label: h===0?'12 AM':h<12?`${h} AM`:h===12?'12 PM':`${h-12} PM` }
})

const MOCK_BESTSELLERS: BestSeller[] = [
  { name:'Pearl Quilted Shoulder Bag',  sku:'SJP-BG-001', category:'Bag',       units_sold:1, revenue:5800, margin:62 },
  { name:'Cotton Candy Mini Dress',     sku:'SJP-DR-003', category:'Dress',     units_sold:2, revenue:4800, margin:60 },
  { name:'Sunset Ruffle Maxi Dress',    sku:'SJP-DR-002', category:'Dress',     units_sold:1, revenue:4100, margin:56 },
  { name:'Hot Pink Mini Tote',          sku:'SJP-BG-002', category:'Bag',       units_sold:1, revenue:3500, margin:63 },
  { name:'Bloom Garden Midi Dress',     sku:'SJP-DR-001', category:'Dress',     units_sold:1, revenue:3200, margin:56 },
  { name:'Crystal Charm Bracelet Set', sku:'SJP-AC-001', category:'Accessory', units_sold:2, revenue:2400, margin:68 },
]

const MOCK_SIZES: SizeRank[] = [
  { size:'M', sold:41, pct:24 }, { size:'S', sold:32, pct:19 }, { size:'L', sold:28, pct:17 },
  { size:'One Size', sold:24, pct:14 }, { size:'XL', sold:19, pct:11 }, { size:'XS', sold:17, pct:10 }, { size:'XXL', sold:9, pct:5 },
]

const MONTHLY_REVENUE = [
  { month:'Jan', actual:12000, forecast: null },
  { month:'Feb', actual:14500, forecast: null },
  { month:'Mar', actual:15500, forecast: null },
  { month:'Apr', actual:19080, forecast: null },
  { month:'May', actual: null, forecast: 24000 },
  { month:'Jun', actual: null, forecast: 14000 },
  { month:'Jul', actual: null, forecast: 11000 },
  { month:'Aug', actual: null, forecast: 12500 },
]

// ── Colors ────────────────────────────────────────────────────────────────────
const PINK='#FF69B4', BLUE='#3B82F6', GREEN='#22C55E', AMBER='#F59E0B', PURPLE='#8B5CF6', RED='#EF4444'
const CAT_COL: Record<string, string> = { Dress:PINK, Bag:BLUE, Accessory:AMBER, Jewelry:PURPLE }
const SEV_STYLE: Record<string, { bg:string; border:string; titleCol:string; iconCol:string }> = {
  critical: { bg:'#FEF2F2', border:'#FECACA', titleCol:'#B91C1C', iconCol:'#EF4444' },
  warning:  { bg:'#FFFBEB', border:'#FDE68A', titleCol:'#B45309', iconCol:'#F59E0B' },
  info:     { bg:'#EFF6FF', border:'#BFDBFE', titleCol:'#1D4ED8', iconCol:'#3B82F6' },
  success:  { bg:'#F0FDF4', border:'#BBF7D0', titleCol:'#15803D', iconCol:'#22C55E' },
}
const PRIORITY_STYLE: Record<string, { bg:string; text:string }> = {
  critical: { bg:'#FEF2F2', text:'#B91C1C' },
  high:     { bg:'#FFFBEB', text:'#B45309' },
  medium:   { bg:'#EFF6FF', text:'#1D4ED8' },
  low:      { bg:'#F0FDF4', text:'#15803D' },
}

// ── Subcomponents ─────────────────────────────────────────────────────────────
function AlertCard({ alert, onAction }: { alert: Alert; onAction?: (a: Alert) => void }) {
  const s = SEV_STYLE[alert.severity]
  const Icon = alert.severity === 'critical' ? AlertTriangle : alert.severity === 'warning' ? AlertTriangle : alert.severity === 'success' ? Star : TrendingUp
  return (
    <motion.div
      layout
      initial={{ opacity:0, y:8 }}
      animate={{ opacity:1, y:0 }}
      className="flex items-start gap-3 p-3 rounded-xl border mb-2"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <Icon size={15} className="shrink-0 mt-0.5" style={{ color: s.iconCol }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold leading-tight" style={{ color: s.titleCol }}>{alert.title}</p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: s.titleCol, opacity: 0.8 }}>{alert.description}</p>
        {alert.action && (
          <button
            onClick={() => onAction?.(alert)}
            className="mt-2 text-xs font-semibold px-3 py-1 rounded-full transition-all"
            style={{ background: s.titleCol + '18', color: s.titleCol }}
          >
            {alert.action} →
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function IntelligencePage() {
  const [tab, setTab] = useState<'alerts'|'bestsellers'|'sizes'|'time'|'restock'|'monthly'>('alerts')
  const [sevFilter, setSevFilter] = useState('all')
  const [sortForecast, setSortForecast] = useState<'days_left'|'stock'|'priority'>('days_left')
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleAlertAction = (alert: Alert) => {
    toast.success(`Action noted: ${alert.action}`, { icon: '✓' })
  }

  const refresh = useCallback(() => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setLastRefresh(new Date()); toast.success('Intelligence refreshed') }, 800)
  }, [])

  const filteredAlerts = sevFilter === 'all' ? MOCK_ALERTS : MOCK_ALERTS.filter(a => a.severity === sevFilter)
  const alertCounts = { critical: MOCK_ALERTS.filter(a => a.severity === 'critical').length, warning: MOCK_ALERTS.filter(a => a.severity === 'warning').length, info: MOCK_ALERTS.filter(a => a.severity === 'info').length, success: MOCK_ALERTS.filter(a => a.severity === 'success').length }

  const sortedForecast = [...MOCK_FORECASTS].sort((a, b) => {
    if (sortForecast === 'days_left') return a.days_left - b.days_left
    if (sortForecast === 'stock') return a.stock - b.stock
    const pOrder = { critical:0, high:1, medium:2, low:3 }
    return (pOrder[a.priority as keyof typeof pOrder] || 0) - (pOrder[b.priority as keyof typeof pOrder] || 0)
  })

  const TABS = [
    { id:'alerts',      label:`Alerts (${alertCounts.critical + alertCounts.warning})`, icon:AlertTriangle },
    { id:'bestsellers', label:'Top Products', icon:TrendingUp },
    { id:'sizes',       label:'Size Intel', icon:Star },
    { id:'time',        label:'Time Patterns', icon:Clock },
    { id:'restock',     label:'Restock Forecast', icon:Package },
    { id:'monthly',     label:'Monthly Trends', icon:Calendar },
  ] as const

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-[#1A1A2E]">Sales Intelligence</h2>
          <p className="text-xs text-gray-400 mt-0.5">Last updated: {lastRefresh.toLocaleTimeString('en-BD', { hour:'2-digit', minute:'2-digit' })}</p>
        </div>
        <motion.button onClick={refresh} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:border-[#FF69B4] hover:text-[#FF69B4] transition-colors disabled:opacity-40"
          whileTap={{ scale:0.95 }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </motion.button>
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4"><div className="text-xs text-red-500 font-semibold mb-1">Critical Alerts</div><div className="text-2xl font-bold text-red-700">{alertCounts.critical}</div><div className="text-xs text-red-400 mt-1">Immediate action needed</div></div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4"><div className="text-xs text-amber-600 font-semibold mb-1">Warnings</div><div className="text-2xl font-bold text-amber-700">{alertCounts.warning}</div><div className="text-xs text-amber-500 mt-1">Act within 7 days</div></div>
        <div className="bg-[#FFF0F7] border border-pink-100 rounded-2xl p-4"><div className="text-xs text-[#C2185B] font-semibold mb-1">Best Size</div><div className="text-2xl font-bold text-[#C2185B]">M</div><div className="text-xs text-pink-400 mt-1">24% of all sales</div></div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4"><div className="text-xs text-green-600 font-semibold mb-1">Peak Hour</div><div className="text-2xl font-bold text-green-700">8–10 PM</div><div className="text-xs text-green-500 mt-1">38% of orders</div></div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(({ id, label, icon:Icon }) => (
          <button key={id} onClick={() => setTab(id as typeof tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${tab === id ? 'bg-[#FF69B4] text-white' : 'border border-gray-200 text-gray-500 hover:border-[#FF69B4] hover:text-[#FF69B4]'}`}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      {/* ── ALERTS ── */}
      {tab === 'alerts' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['all','critical','warning','info','success'] as const).map(s => (
              <button key={s} onClick={() => setSevFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${sevFilter === s ? 'bg-[#FF69B4] text-white' : 'border border-gray-200 text-gray-500 hover:border-[#FF69B4]'}`}>
                {s === 'all' ? `All (${MOCK_ALERTS.length})` : `${s} (${alertCounts[s as keyof typeof alertCounts] || 0})`}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {filteredAlerts.map(a => <AlertCard key={a.id} alert={a} onAction={handleAlertAction} />)}
          </AnimatePresence>
        </div>
      )}

      {/* ── BESTSELLERS ── */}
      {tab === 'bestsellers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-display text-sm font-bold text-[#1A1A2E]">Product ranking — by revenue this month</h3>
            </div>
            <div>
              {MOCK_BESTSELLERS.map((p, i) => {
                const maxRev = MOCK_BESTSELLERS[0].revenue
                return (
                  <motion.div key={p.sku} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.06 }}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-pink-50/20 transition-colors">
                    <span className="text-sm font-bold text-gray-300 w-5">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A2E] truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background:CAT_COL[p.category]+'18', color:CAT_COL[p.category] }}>{p.category}</span>
                        <span className="text-xs text-gray-400 font-mono">{p.sku}</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                        <motion.div className="h-full rounded-full" style={{ background:CAT_COL[p.category] }} initial={{ width:0 }} animate={{ width:`${p.revenue/maxRev*100}%` }} transition={{ duration:.8, delay:i*.08 }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="text-sm font-bold text-[#1A1A2E]">৳{p.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{p.units_sold} sold</p>
                      <p className="text-xs font-semibold text-green-600">{p.margin}% margin</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-display text-sm font-bold text-[#1A1A2E] mb-4">Revenue by category</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart><Pie data={[{name:'Dresses',value:12100},{name:'Bags',value:9300},{name:'Accessories',value:2400}]} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {[PINK,BLUE,AMBER].map((c,i) => <Cell key={i} fill={c} />)}
                </Pie><Tooltip formatter={(v:number) => [`৳${v.toLocaleString()}`,'']} contentStyle={{ borderRadius:10,fontSize:11 }} /></PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-2">
                {[{name:'Dresses',val:12100,col:PINK},{name:'Bags',val:9300,col:BLUE},{name:'Accessories',val:2400,col:AMBER}].map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-1.5 text-gray-500"><span className="w-2 h-2 rounded-full" style={{background:c.col}} />{c.name}</span><span className="font-semibold text-[#1A1A2E]">৳{c.val.toLocaleString()}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-display text-sm font-bold text-[#1A1A2E] mb-4">Gross margin comparison</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[...MOCK_BESTSELLERS].sort((a,b)=>b.margin-a.margin)} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" horizontal={false} />
                  <XAxis type="number" domain={[50,72]} tick={{fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>v+'%'} />
                  <YAxis type="category" dataKey="name" tick={{fontSize:9}} axisLine={false} tickLine={false} width={120} />
                  <Tooltip formatter={(v:number)=>[v+'%','Margin']} contentStyle={{borderRadius:10,fontSize:11}} />
                  <Bar dataKey="margin" radius={[0,4,4,0]}>{MOCK_BESTSELLERS.map((p,i)=><Cell key={i} fill={CAT_COL[p.category]||PINK} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── SIZES ── */}
      {tab === 'sizes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 lg:grid-cols-7 gap-2">
            {MOCK_SIZES.map(s => (
              <motion.div key={s.size} whileHover={{scale:1.04}}
                className={`rounded-xl p-3 text-center ${s.size==='M'?'bg-[#FFE4F1] border-2 border-[#FF69B4]':'bg-gray-50 border border-gray-100'}`}>
                <p className="text-xs font-semibold mb-1" style={{color:s.size==='M'?'#C2185B':'#9CA3AF'}}>{s.size}</p>
                <p className="text-xl font-bold" style={{color:s.size==='M'?'#C2185B':'#1A1A2E'}}>{s.sold}</p>
                <p className="text-xs mt-0.5" style={{color:s.size==='M'?'#FF69B4':'#9CA3AF'}}>{s.pct}%</p>
                {s.size==='M'&&<p className="text-xs text-[#FF69B4] font-bold mt-1">Best ⭑</p>}
              </motion.div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-display text-sm font-bold text-[#1A1A2E] mb-4">Size sales distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_SIZES} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                <XAxis dataKey="size" tick={{fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v:number)=>[v+' units','Sold']} contentStyle={{borderRadius:10,fontSize:11}} />
                <Bar dataKey="sold" radius={[6,6,0,0]}>{MOCK_SIZES.map((s,i)=><Cell key={i} fill={s.size==='M'?PINK:s.size==='S'?'#FF94CC':'#FFD6EC'} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-display text-sm font-bold text-[#1A1A2E] mb-4">Stock vs demand balance — recommended order ratios</h3>
            {[{size:'XS',demand:10,stock:12,status:'ok'},{size:'S',demand:19,stock:14,status:'low'},{size:'M',demand:24,stock:16,status:'critical'},{size:'L',demand:17,stock:19,status:'ok'},{size:'XL',demand:11,stock:14,status:'ok'},{size:'XXL',demand:5,stock:8,status:'excess'}].map(r => {
              const col = r.status==='critical'?RED:r.status==='low'?AMBER:r.status==='ok'?GREEN:BLUE
              const label = r.status==='critical'?'Undersupplied':r.status==='low'?'Low':r.status==='ok'?'Balanced':'Excess'
              return (
                <div key={r.size} className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-gray-500 w-8">{r.size}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="h-full rounded-full transition-all" style={{width:r.stock/24*100+'%',background:col+'40'}} />
                    <div className="absolute inset-y-0 flex items-center px-2 text-xs font-semibold" style={{color:col}}>Demand {r.demand}% · Stock {r.stock}%</div>
                  </div>
                  <span className="text-xs font-bold w-24 text-right" style={{color:col}}>{label}</span>
                </div>
              )
            })}
            <div className="mt-3 p-3 bg-[#FFF0F7] rounded-xl text-xs text-[#C2185B] font-medium">
              Recommended order ratio: XS 10% · S 20% · M 30% · L 22% · XL 13% · XXL 5%
            </div>
          </div>
        </div>
      )}

      {/* ── TIME PATTERNS ── */}
      {tab === 'time' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-display text-sm font-bold text-[#1A1A2E] mb-4">Hourly order volume — 24h average</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MOCK_HOURLY} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                <XAxis dataKey="label" tick={{fontSize:9}} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v:number)=>[v+' orders','Count']} contentStyle={{borderRadius:10,fontSize:11}} />
                <Bar dataKey="count" radius={[4,4,0,0]}>{MOCK_HOURLY.map((h,i)=><Cell key={i} fill={h.count>=18?RED:h.count>=10?AMBER:h.count>=4?PINK:'#E5E7EB'} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-3 mt-3 flex-wrap">
              {[{col:RED,label:'Peak (18+ orders)'},{col:AMBER,label:'High (10–17)'},{col:PINK,label:'Medium (4–9)'},{col:'#E5E7EB',label:'Quiet (0–3)'}].map(l=>(
                <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm" style={{background:l.col}} />{l.label}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-display text-sm font-bold text-[#1A1A2E] mb-4">Orders by day of week</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[{d:'Mon',v:8},{d:'Tue',v:7},{d:'Wed',v:9},{d:'Thu',v:11},{d:'Fri',v:27},{d:'Sat',v:22},{d:'Sun',v:18}]} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                  <XAxis dataKey="d" tick={{fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>v+'%'} />
                  <Tooltip formatter={(v:number)=>[v+'%','Share']} contentStyle={{borderRadius:10,fontSize:11}} />
                  <Bar dataKey="v" radius={[5,5,0,0]}>{[BLUE,BLUE,BLUE,BLUE,PINK,PINK,AMBER].map((c,i)=><Cell key={i} fill={c} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-display text-sm font-bold text-[#1A1A2E] mb-3">Action plan by time</h3>
              <div className="space-y-2.5">
                {[
                  { time:'7–9 PM', action:'Schedule flash sale notifications and push marketing', col:RED, type:'Best time to sell' },
                  { time:'10 AM–1 PM', action:'Process morning orders, update inventory', col:AMBER, type:'Admin window' },
                  { time:'2–5 AM', action:'Run system maintenance, bulk stock imports, DB backups', col:GREEN, type:'Zero-order window' },
                  { time:'Friday 6 PM', action:'Biggest order spike — ensure team is fully staffed', col:PINK, type:'Peak day start' },
                  { time:'Mon–Wed AM', action:'Lowest traffic — good time for supplier calls', col:BLUE, type:'Quiet period' },
                ].map(item => (
                  <div key={item.time} className="flex items-start gap-3 p-3 rounded-xl" style={{background:item.col+'12'}}>
                    <div><p className="text-xs font-bold" style={{color:item.col}}>{item.time}</p><p className="text-xs" style={{color:item.col,opacity:.7}}>{item.type}</p></div>
                    <p className="text-xs text-gray-500 flex-1">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESTOCK FORECAST ── */}
      {tab === 'restock' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4"><p className="text-xs text-red-500 font-semibold">Order today</p><p className="text-2xl font-bold text-red-700">{MOCK_FORECASTS.filter(f=>f.priority==='critical').length}</p><p className="text-xs text-red-400">0–3 days supply</p></div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4"><p className="text-xs text-amber-600 font-semibold">This week</p><p className="text-2xl font-bold text-amber-700">{MOCK_FORECASTS.filter(f=>f.priority==='high').length}</p><p className="text-xs text-amber-500">4–14 days supply</p></div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4"><p className="text-xs text-blue-600 font-semibold">Plan reorder</p><p className="text-2xl font-bold text-blue-700">{MOCK_FORECASTS.filter(f=>f.priority==='medium').length}</p><p className="text-xs text-blue-400">15–30 days supply</p></div>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4"><p className="text-xs text-green-600 font-semibold">Safe stock</p><p className="text-2xl font-bold text-green-700">{MOCK_FORECASTS.filter(f=>f.priority==='low').length}</p><p className="text-xs text-green-400">30+ days supply</p></div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#1A1A2E]">Restock runway — all variants</h3>
              <div className="flex gap-1.5">
                {(['days_left','stock','priority'] as const).map(s=>(
                  <button key={s} onClick={()=>setSortForecast(s)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${sortForecast===s?'bg-[#FF69B4] text-white':'border border-gray-200 text-gray-400 hover:border-[#FF69B4]'}`}>
                    {s.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="border-b border-gray-50">{['SKU','Product','Size / Colour','Stock','Daily rate','Days left','Reorder qty','Est. cost','Action'].map(h=><th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 px-4 py-2.5">{h}</th>)}</tr></thead>
              <tbody>
                {sortedForecast.map((f,i)=>{
                  const ps = PRIORITY_STYLE[f.priority]
                  return (
                    <motion.tr key={f.sku} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*.03}}
                      className="border-b border-gray-50 last:border-0 hover:bg-pink-50/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{f.sku}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#1A1A2E]">{f.product_name}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{f.size} · {f.color}</td>
                      <td className="px-4 py-3 text-sm font-bold" style={{color:f.stock===0?'#B91C1C':f.stock<=5?'#B45309':'#1A1A2E'}}>{f.stock}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{f.daily_rate.toFixed(2)}/day</td>
                      <td className="px-4 py-3 text-sm font-bold" style={{color:f.days_left<=3?'#B91C1C':f.days_left<=14?'#B45309':'#15803D'}}>{f.days_left===999?'90+':f.days_left+'d'}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#1A1A2E]">{f.reorder_qty>0?f.reorder_qty:'—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{f.estimated_cost>0?'৳'+f.estimated_cost.toLocaleString():'—'}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:ps.bg,color:ps.text}}>{f.priority==='critical'?'Order NOW':f.priority==='high'?'Order soon':f.priority==='medium'?'Plan reorder':'Safe'}</span></td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MONTHLY TRENDS ── */}
      {tab === 'monthly' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-display text-sm font-bold text-[#1A1A2E] mb-1">Monthly revenue with Eid season forecast</h3>
            <p className="text-xs text-gray-400 mb-4">Actual data + AI-powered seasonal forecast</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={MONTHLY_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                <XAxis dataKey="month" tick={{fontSize:10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>'৳'+(v/1000).toFixed(0)+'k'} />
                <Tooltip formatter={(v:unknown)=>typeof v==='number'?['৳'+v.toLocaleString(),'']:['N/A','']} contentStyle={{borderRadius:12,fontSize:11}} />
                <Line type="monotone" dataKey="actual" name="Actual" stroke={PINK} strokeWidth={2.5} dot={{r:4,fill:PINK}} activeDot={{r:6}} connectNulls={false} />
                <Line type="monotone" dataKey="forecast" name="Forecast" stroke={PINK} strokeWidth={2} strokeDasharray="6 4" dot={{r:4,fill:'#FFB6C1'}} activeDot={{r:6}} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-display text-sm font-bold text-[#1A1A2E] mb-4">Seasonal restock calendar — when to prepare and when to hold</h3>
            <div className="grid grid-cols-6 gap-2">
              {[
                {m:'Jan',action:'Stock up',col:'#FEE2E2',tc:'#B91C1C',note:'Post-winter demand rising'},
                {m:'Feb',action:'Monitor',col:'#FFFBEB',tc:'#B45309',note:'Steady'},
                {m:'Mar',action:'Max stock',col:'#FEE2E2',tc:'#B91C1C',note:'Pre-Eid build-up'},
                {m:'Apr',action:'Eid peak',col:'#FEE2E2',tc:'#B91C1C',note:'3× demand spike'},
                {m:'May',action:'Post-Eid',col:'#F0FDF4',tc:'#15803D',note:'Gradual slowdown'},
                {m:'Jun',action:'Hold tight',col:'#EFF6FF',tc:'#1D4ED8',note:'Summer slump'},
                {m:'Jul',action:'Low season',col:'#EFF6FF',tc:'#1D4ED8',note:'Minimal orders'},
                {m:'Aug',action:'Low season',col:'#EFF6FF',tc:'#1D4ED8',note:'Do not overstock'},
                {m:'Sep',action:'Prepare',col:'#FFFBEB',tc:'#B45309',note:'Winter prep begins'},
                {m:'Oct',action:'Winter peak',col:'#FEE2E2',tc:'#B91C1C',note:'2× demand'},
                {m:'Nov',action:'Taper',col:'#FFFBEB',tc:'#B45309',note:'Post-peak slowdown'},
                {m:'Dec',action:'New Year',col:'#FEE2E2',tc:'#B91C1C',note:'Holiday demand'},
              ].map(({m,action,col,tc,note})=>(
                <motion.div key={m} whileHover={{scale:1.04}} className="rounded-xl p-3 text-center cursor-pointer" style={{background:col}}>
                  <p className="text-xs font-bold" style={{color:tc}}>{m}</p>
                  <p className="text-xs font-semibold mt-1" style={{color:tc,fontSize:'10px'}}>{action}</p>
                  <p className="text-xs mt-1" style={{color:tc,opacity:.6,fontSize:'9px'}}>{note}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
