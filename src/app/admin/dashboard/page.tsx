'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, ShoppingCart, Package,
  Users, DollarSign, ArrowRight, Clock, Truck, AlertCircle, Star
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const BRAND = '#C2185B'

const REVENUE_DATA = [
  { month:'Nov', revenue:58000 },{ month:'Dec', revenue:74000 },
  { month:'Jan', revenue:62000 },{ month:'Feb', revenue:81000 },
  { month:'Mar', revenue:95000 },{ month:'Apr', revenue:112000 },
]
const CATEGORY_DATA = [
  { name:'Dresses',     value:48, color:'#C2185B' },
  { name:'Bags',        value:27, color:'#1565C0' },
  { name:'Jewelry',     value:15, color:'#B8860B' },
  { name:'Accessories', value:10, color:'#2E7D32' },
]
const RECENT_ORDERS = [
  { id:'ORD-1052', customer:'Nadia Rahman',    amount:4800,  status:'Delivered',  time:'2h ago', items:2 },
  { id:'ORD-1051', customer:'Tasnim Akter',    amount:12400, status:'Processing', time:'4h ago', items:3 },
  { id:'ORD-1050', customer:'Sumaiya Islam',   amount:3200,  status:'Shipped',    time:'6h ago', items:1 },
  { id:'ORD-1049', customer:'Mehrin Sultana',  amount:7600,  status:'Confirmed',  time:'9h ago', items:4 },
  { id:'ORD-1048', customer:'Sabrina Hossain', amount:5100,  status:'Delivered',  time:'1d ago', items:2 },
]
const TOP_PRODUCTS = [
  { name:'Bloom Garden Midi Dress',    sold:12, revenue:38400, stock:45 },
  { name:'Pearl Quilted Shoulder Bag', sold:9,  revenue:52200, stock:18 },
  { name:'Pearl Drop Earrings',        sold:38, revenue:33820, stock:60 },
  { name:'Sunset Ruffle Maxi',         sold:8,  revenue:32800, stock:24 },
]
const STATUS_STYLE: Record<string,{color:string;bg:string}> = {
  Delivered:{color:'#059669',bg:'#ECFDF5'},Shipped:{color:'#7C3AED',bg:'#F5F3FF'},
  Processing:{color:'#D97706',bg:'#FFFBEB'},Confirmed:{color:'#0891B2',bg:'#ECFEFF'},
  Pending:{color:'#6B7280',bg:'#F3F4F6'},
}

function KPICard({ label,value,sub,trend,icon:Icon,color,href }:{
  label:string;value:string;sub:string;trend:number;
  icon:React.ElementType;color:string;href?:string
}) {
  const up = trend >= 0
  const inner = (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
      className="bg-white rounded-xl border border-gray-100 p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
        <p className="text-[26px] font-black text-gray-900 leading-none mb-1.5">{value}</p>
        <div className="flex items-center gap-1.5">
          {up?<TrendingUp size={12} className="text-emerald-500"/>:<TrendingDown size={12} className="text-red-400"/>}
          <span className={`text-[11px] font-semibold ${up?'text-emerald-600':'text-red-500'}`}>{up?'+':''}{trend}%</span>
          <span className="text-[11px] text-gray-400">{sub}</span>
        </div>
      </div>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{background:color+'18'}}>
        <Icon size={20} style={{color}}/>
      </div>
    </motion.div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default function DashboardPage() {
  const [period,setPeriod] = useState<'7d'|'30d'|'90d'>('30d')
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-black text-gray-900">Dashboard</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">{new Date().toLocaleDateString('en-BD',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden text-[11px] font-semibold">
          {(['7d','30d','90d'] as const).map(p => (
            <button key={p} onClick={()=>setPeriod(p)}
              className={`px-4 py-2 transition-colors ${period===p?'text-white':'text-gray-500 hover:bg-gray-50'}`}
              style={period===p?{background:BRAND}:{}}>
              {p==='7d'?'7 Days':p==='30d'?'30 Days':'90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard label="Total Revenue"   value="৳1,12,000" sub="vs last month" trend={18}  icon={DollarSign}   color="#C2185B" href="/admin/finance"/>
        <KPICard label="Total Orders"    value="35"         sub="vs last month" trend={17}  icon={ShoppingCart} color="#1565C0" href="/admin/orders"/>
        <KPICard label="Total Customers" value="12"         sub="new this month" trend={25} icon={Users}        color="#059669" href="/admin/customers"/>
        <KPICard label="Avg Order Value" value="৳3,200"    sub="vs last month" trend={-4}  icon={Package}      color="#D97706"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div><h3 className="font-bold text-[14px] text-gray-800">Revenue Trend</h3><p className="text-[11px] text-gray-400 mt-0.5">Last 6 months</p></div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+18%</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA} margin={{top:4,right:4,left:0,bottom:0}}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={BRAND} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:11,fill:'#9CA3AF'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:'#9CA3AF'}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(v:number)=>[`৳${v.toLocaleString()}`,'Revenue']} contentStyle={{borderRadius:8,fontSize:12,border:'1px solid #E5E7EB'}}/>
              <Area type="monotone" dataKey="revenue" stroke={BRAND} strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{r:5,fill:BRAND}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-[14px] text-gray-800 mb-1">Sales by Category</h3>
          <p className="text-[11px] text-gray-400 mb-4">Share of revenue</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                {CATEGORY_DATA.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip formatter={(v:number)=>[`${v}%`,'']} contentStyle={{borderRadius:8,fontSize:11}}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {CATEGORY_DATA.map(d=>(
              <div key={d.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:d.color}}/><span className="text-gray-600">{d.name}</span></div>
                <span className="font-bold text-gray-800">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[14px] text-gray-800">Recent Orders</h3>
            <Link href="/admin/orders" className="text-[11px] font-semibold text-[#C2185B] hover:underline flex items-center gap-1">View all <ArrowRight size={11}/></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {RECENT_ORDERS.map(o=>{
              const st=STATUS_STYLE[o.status]??STATUS_STYLE.Pending
              return(
                <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-600 shrink-0">
                      {o.customer.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-gray-800 truncate">{o.customer}</p>
                      <p className="text-[10px] text-gray-400">{o.id} · {o.items} item{o.items>1?'s':''}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[13px] font-bold text-gray-900">৳{o.amount.toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{color:st.color,background:st.bg}}>{o.status}</span>
                      <span className="text-[10px] text-gray-400">{o.time}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[14px] text-gray-800">Top Products</h3>
            <Link href="/admin/products" className="text-[11px] font-semibold text-[#C2185B] hover:underline flex items-center gap-1">View all <ArrowRight size={11}/></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {TOP_PRODUCTS.map((p,i)=>(
              <div key={p.name} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 shrink-0">{i+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{background:BRAND,width:`${Math.min(100,(p.sold/40)*100)}%`}}/>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">{p.sold} sold</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-bold text-gray-900">৳{(p.revenue/1000).toFixed(0)}K</p>
                  <p className="text-[10px] text-gray-400">Stock: {p.stock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          {label:'Orders',   href:'/admin/orders',   icon:ShoppingCart, color:'#C2185B'},
          {label:'Products', href:'/admin/products', icon:Package,      color:'#1565C0'},
          {label:'Purchase', href:'/admin/purchase', icon:Truck,        color:'#D97706'},
          {label:'Reports',  href:'/admin/reports',  icon:Star,         color:'#059669'},
        ] as const).map(a=>{const Icon=a.icon;return(
          <Link key={a.label} href={a.href}>
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:shadow-md hover:border-gray-200 transition-all group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{background:a.color+'15'}}><Icon size={16} style={{color:a.color}}/></div>
              <span className="text-[13px] font-semibold text-gray-700 group-hover:text-gray-900">{a.label}</span>
              <ArrowRight size={13} className="ml-auto text-gray-300 group-hover:text-gray-500"/>
            </div>
          </Link>
        )})}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([
          {icon:AlertCircle,color:'#D97706',bg:'#FFFBEB',text:'3 products low on stock',       href:'/admin/inventory'},
          {icon:Clock,      color:'#7C3AED',bg:'#F5F3FF',text:'2 orders pending confirmation', href:'/admin/orders'},
          {icon:Truck,      color:'#0891B2',bg:'#ECFEFF',text:'1 purchase order to receive',   href:'/admin/purchase'},
        ] as const).map(a=>{const Icon=a.icon;return(
          <Link key={a.text} href={a.href}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm" style={{background:a.bg,borderColor:a.color+'30'}}>
              <Icon size={15} style={{color:a.color}} className="shrink-0"/>
              <p className="text-[12px] font-medium" style={{color:a.color}}>{a.text}</p>
              <ArrowRight size={11} className="ml-auto shrink-0" style={{color:a.color}}/>
            </div>
          </Link>
        )})}
      </div>
    </div>
  )
}
