'use client'
import { useState } from 'react'
import { ArrowLeft, Check, Eye, X, Printer } from 'lucide-react'
import Link from 'next/link'
import { useSettingsStore } from '@/store/settingsStore'

/* ─── Template definitions ───────────────────────────────────────────────── */
interface Template {
  id:    string
  name:  string
  style: string
  preview: React.FC<{ scale?: number }>
}

/* ── Shared mock data for previews ── */
const MOCK = {
  store:    'Shajpori',
  address:  'Dhaka, Bangladesh',
  invoice:  'INV-2025-001',
  date:     '30 Apr 2025',
  customer: 'Fatema Khatun',
  items:    [
    { name: 'Floral Maxi Dress', qty: 1, price: 1490 },
    { name: 'Gold Earring Set',  qty: 2, price:  650 },
  ],
  subtotal: 2790,
  shipping:   60,
  total:    2850,
}

/* ── Mini preview primitives ── */
const Row = ({ label, val, bold }: { label: string; val: string; bold?: boolean }) => (
  <div style={{ display:'flex', justifyContent:'space-between', fontSize:3.5, marginBottom:1, fontWeight: bold ? 700 : 400 }}>
    <span style={{ color:'#555' }}>{label}</span>
    <span>{val}</span>
  </div>
)
const HR = ({ color = '#e5e7eb' }: { color?: string }) => (
  <div style={{ height:0.5, background:color, margin:'2px 0' }} />
)
const ItemRow = ({ name, qty, price }: { name:string; qty:number; price:number }) => (
  <div style={{ display:'flex', justifyContent:'space-between', fontSize:3, marginBottom:1 }}>
    <span style={{ flex:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{name}</span>
    <span style={{ color:'#888', marginLeft:3 }}>×{qty}</span>
    <span style={{ marginLeft:4, fontWeight:600 }}>৳{price}</span>
  </div>
)

/* ════════════════════════════════════════════════════════
   TEMPLATE PREVIEWS
════════════════════════════════════════════════════════ */

/* 1 — Classic */
const Classic: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ width:160*scale, height:210*scale, background:'#fff', padding:10*scale, fontFamily:'sans-serif', fontSize:4*scale, border:'1px solid #e5e7eb', overflow:'hidden', transform:`scale(${scale})`, transformOrigin:'top left' }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
      <div>
        <div style={{ fontSize:8, fontWeight:800, color:'#111' }}>{MOCK.store}</div>
        <div style={{ fontSize:3.5, color:'#888', marginTop:1 }}>{MOCK.address}</div>
      </div>
      <div style={{ fontSize:7, fontWeight:700, color:'#C2185B', letterSpacing:1 }}>INVOICE</div>
    </div>
    <HR />
    <div style={{ display:'flex', justifyContent:'space-between', marginTop:3, marginBottom:3 }}>
      <div><div style={{ fontSize:3, color:'#888' }}>Invoice #</div><div style={{ fontSize:4, fontWeight:600 }}>{MOCK.invoice}</div></div>
      <div><div style={{ fontSize:3, color:'#888' }}>Date</div><div style={{ fontSize:4, fontWeight:600 }}>{MOCK.date}</div></div>
      <div><div style={{ fontSize:3, color:'#888' }}>Bill To</div><div style={{ fontSize:4, fontWeight:600 }}>{MOCK.customer}</div></div>
    </div>
    <HR />
    <div style={{ marginTop:3 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:3, fontWeight:700, color:'#888', marginBottom:2 }}>
        <span>Item</span><span>Total</span>
      </div>
      {MOCK.items.map(i => <ItemRow key={i.name} {...i} />)}
    </div>
    <HR />
    <div style={{ marginTop:3 }}>
      <Row label="Subtotal"  val={`৳${MOCK.subtotal}`} />
      <Row label="Shipping"  val={`৳${MOCK.shipping}`} />
      <Row label="Total"     val={`৳${MOCK.total}`}    bold />
    </div>
    <div style={{ marginTop:6, fontSize:3, color:'#aaa', textAlign:'center' }}>Thank you for shopping with us!</div>
  </div>
)

/* 2 — Modern Blue */
const ModernBlue: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ width:160*scale, height:210*scale, background:'#fff', fontFamily:'sans-serif', overflow:'hidden', border:'1px solid #e5e7eb' }}>
    <div style={{ background:'#1D4ED8', padding:`${8*scale}px ${10*scale}px`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <div style={{ fontSize:7*scale, fontWeight:800, color:'#fff' }}>{MOCK.store}</div>
      <div style={{ fontSize:5*scale, fontWeight:700, color:'#93C5FD', letterSpacing:1 }}>INVOICE</div>
    </div>
    <div style={{ padding:`${6*scale}px ${10*scale}px` }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4*scale }}>
        <div><div style={{ fontSize:3*scale, color:'#6B7280' }}>To</div><div style={{ fontSize:4*scale, fontWeight:600 }}>{MOCK.customer}</div></div>
        <div style={{ textAlign:'right' }}><div style={{ fontSize:3*scale, color:'#6B7280' }}>{MOCK.invoice}</div><div style={{ fontSize:3*scale, color:'#6B7280' }}>{MOCK.date}</div></div>
      </div>
      <div style={{ background:'#EFF6FF', borderRadius:3*scale, padding:`${3*scale}px ${5*scale}px`, marginBottom:3*scale }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:3*scale, fontWeight:700, color:'#1D4ED8', marginBottom:1.5*scale }}>
          <span>Product</span><span>Amount</span>
        </div>
        {MOCK.items.map(i => <ItemRow key={i.name} {...i} />)}
      </div>
      <div style={{ background:'#1D4ED8', borderRadius:3*scale, padding:`${3*scale}px ${5*scale}px` }}>
        <Row label="Total" val={`৳${MOCK.total}`} bold />
      </div>
    </div>
  </div>
)

/* 3 — Elegant Dark */
const ElegantDark: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ width:160*scale, height:210*scale, background:'#fff', fontFamily:'sans-serif', overflow:'hidden', border:'1px solid #e5e7eb' }}>
    <div style={{ background:'#111827', padding:`${10*scale}px ${12*scale}px` }}>
      <div style={{ fontSize:8*scale, fontWeight:900, color:'#fff', letterSpacing:2 }}>{MOCK.store.toUpperCase()}</div>
      <div style={{ fontSize:3.5*scale, color:'#9CA3AF', marginTop:1*scale }}>{MOCK.address}</div>
    </div>
    <div style={{ background:'#C2185B', padding:`${2*scale}px ${12*scale}px`, display:'flex', justifyContent:'space-between' }}>
      <span style={{ fontSize:3.5*scale, color:'#fff', fontWeight:700 }}>INVOICE</span>
      <span style={{ fontSize:3.5*scale, color:'#FFB3C8' }}>{MOCK.invoice}</span>
    </div>
    <div style={{ padding:`${6*scale}px ${10*scale}px` }}>
      <div style={{ marginBottom:4*scale }}>
        <div style={{ fontSize:3*scale, color:'#9CA3AF' }}>BILL TO</div>
        <div style={{ fontSize:5*scale, fontWeight:700 }}>{MOCK.customer}</div>
        <div style={{ fontSize:3*scale, color:'#9CA3AF' }}>{MOCK.date}</div>
      </div>
      {MOCK.items.map(i => (
        <div key={i.name} style={{ display:'flex', justifyContent:'space-between', borderBottom:'0.5px solid #F3F4F6', padding:`${1.5*scale}px 0`, fontSize:3.5*scale }}>
          <span>{i.name}</span><span style={{ fontWeight:700 }}>৳{i.price}</span>
        </div>
      ))}
      <div style={{ marginTop:4*scale, background:'#111827', borderRadius:2*scale, padding:`${3*scale}px ${5*scale}px`, display:'flex', justifyContent:'space-between' }}>
        <span style={{ color:'#fff', fontSize:4*scale, fontWeight:700 }}>TOTAL</span>
        <span style={{ color:'#C2185B', fontSize:4*scale, fontWeight:700 }}>৳{MOCK.total}</span>
      </div>
    </div>
  </div>
)

/* 4 — Minimal */
const Minimal: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ width:160*scale, height:210*scale, background:'#FAFAFA', fontFamily:'sans-serif', overflow:'hidden', border:'1px solid #e5e7eb', padding:`${10*scale}px ${12*scale}px` }}>
    <div style={{ fontSize:5*scale, fontWeight:300, color:'#111', letterSpacing:3, marginBottom:8*scale }}>INVOICE</div>
    <div style={{ display:'flex', justifyContent:'space-between', fontSize:3.5*scale, color:'#6B7280', marginBottom:6*scale }}>
      <div><div>From</div><div style={{ color:'#111', fontWeight:600 }}>{MOCK.store}</div></div>
      <div style={{ textAlign:'right' }}><div>To</div><div style={{ color:'#111', fontWeight:600 }}>{MOCK.customer}</div></div>
    </div>
    <div style={{ height:0.5, background:'#D1D5DB', marginBottom:4*scale }} />
    {MOCK.items.map(i => (
      <div key={i.name} style={{ display:'flex', justifyContent:'space-between', fontSize:3.5*scale, marginBottom:2*scale }}>
        <span>{i.name}</span><span>৳{i.price}</span>
      </div>
    ))}
    <div style={{ height:0.5, background:'#D1D5DB', margin:`${4*scale}px 0` }} />
    <div style={{ display:'flex', justifyContent:'space-between', fontSize:5*scale, fontWeight:700 }}>
      <span>Total</span><span>৳{MOCK.total}</span>
    </div>
    <div style={{ marginTop:8*scale, fontSize:3*scale, color:'#9CA3AF', textAlign:'center' }}>{MOCK.invoice} · {MOCK.date}</div>
  </div>
)

/* 5 — Pink Brand */
const PinkBrand: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ width:160*scale, height:210*scale, background:'#fff', fontFamily:'sans-serif', overflow:'hidden', border:'1px solid #e5e7eb' }}>
    <div style={{ background:'linear-gradient(135deg,#C2185B,#E91E8C)', padding:`${10*scale}px ${12*scale}px` }}>
      <div style={{ fontSize:8*scale, fontWeight:900, color:'#fff' }}>{MOCK.store}</div>
      <div style={{ fontSize:3*scale, color:'rgba(255,255,255,0.7)', marginTop:1*scale }}>Your Fashion Destination</div>
    </div>
    <div style={{ padding:`${6*scale}px ${10*scale}px` }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4*scale, fontSize:3.5*scale }}>
        <span style={{ color:'#C2185B', fontWeight:600 }}>{MOCK.invoice}</span>
        <span style={{ color:'#9CA3AF' }}>{MOCK.date}</span>
      </div>
      <div style={{ fontSize:3.5*scale, marginBottom:4*scale }}>
        <span style={{ color:'#9CA3AF' }}>To: </span>
        <span style={{ fontWeight:700 }}>{MOCK.customer}</span>
      </div>
      {MOCK.items.map(i => (
        <div key={i.name} style={{ display:'flex', justifyContent:'space-between', fontSize:3.5*scale, padding:`${1.5*scale}px 0`, borderBottom:`0.5px solid #FCE4EC` }}>
          <span>{i.name}</span><span style={{ color:'#C2185B', fontWeight:700 }}>৳{i.price}</span>
        </div>
      ))}
      <div style={{ marginTop:4*scale, borderRadius:3*scale, background:'#FFF0F5', padding:`${4*scale}px ${6*scale}px`, display:'flex', justifyContent:'space-between', fontSize:4.5*scale, fontWeight:800 }}>
        <span style={{ color:'#C2185B' }}>TOTAL</span>
        <span style={{ color:'#C2185B' }}>৳{MOCK.total}</span>
      </div>
    </div>
  </div>
)

/* 6 — Split Corporate */
const SplitCorporate: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ width:160*scale, height:210*scale, background:'#fff', fontFamily:'sans-serif', overflow:'hidden', border:'1px solid #e5e7eb', display:'flex' }}>
    <div style={{ width:50*scale, background:'#111827', padding:`${8*scale}px ${6*scale}px`, display:'flex', flexDirection:'column', gap:4*scale }}>
      <div style={{ fontSize:6*scale, fontWeight:900, color:'#fff', lineHeight:1 }}>{MOCK.store.slice(0,3)}</div>
      <div style={{ width:'100%', height:0.5, background:'#EF4444' }} />
      <div style={{ fontSize:3*scale, color:'#9CA3AF' }}>Invoice</div>
      <div style={{ fontSize:3.5*scale, color:'#fff', fontWeight:600 }}>{MOCK.invoice}</div>
      <div style={{ fontSize:3*scale, color:'#9CA3AF', marginTop:2*scale }}>{MOCK.date}</div>
      <div style={{ marginTop:'auto', fontSize:3*scale, color:'#6B7280' }}>{MOCK.address}</div>
    </div>
    <div style={{ flex:1, padding:`${8*scale}px ${8*scale}px` }}>
      <div style={{ fontSize:3.5*scale, marginBottom:2*scale }}><span style={{ color:'#9CA3AF' }}>To: </span><span style={{ fontWeight:700 }}>{MOCK.customer}</span></div>
      <div style={{ height:0.5, background:'#F3F4F6', marginBottom:3*scale }} />
      {MOCK.items.map(i => (
        <div key={i.name} style={{ fontSize:3.5*scale, marginBottom:2*scale }}>
          <div style={{ fontWeight:600 }}>{i.name}</div>
          <div style={{ display:'flex', justifyContent:'space-between', color:'#6B7280' }}><span>×{i.qty}</span><span>৳{i.price}</span></div>
        </div>
      ))}
      <div style={{ height:0.5, background:'#F3F4F6', margin:`${3*scale}px 0` }} />
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:4.5*scale, fontWeight:800 }}>
        <span>Total</span><span style={{ color:'#EF4444' }}>৳{MOCK.total}</span>
      </div>
    </div>
  </div>
)

/* 7 — Teal Professional */
const TealPro: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ width:160*scale, height:210*scale, background:'#fff', fontFamily:'sans-serif', overflow:'hidden', border:'1px solid #e5e7eb' }}>
    <div style={{ background:'#0F766E', padding:`${8*scale}px ${10*scale}px`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <div style={{ fontSize:7*scale, fontWeight:800, color:'#fff' }}>{MOCK.store}</div>
      <div style={{ textAlign:'right' }}>
        <div style={{ fontSize:5*scale, fontWeight:700, color:'#CCFBF1' }}>INVOICE</div>
        <div style={{ fontSize:3*scale, color:'#5EEAD4' }}>{MOCK.invoice}</div>
      </div>
    </div>
    <div style={{ background:'#F0FDFA', padding:`${4*scale}px ${10*scale}px`, display:'flex', justifyContent:'space-between', fontSize:3.5*scale }}>
      <span style={{ color:'#0F766E', fontWeight:600 }}>{MOCK.customer}</span>
      <span style={{ color:'#6B7280' }}>{MOCK.date}</span>
    </div>
    <div style={{ padding:`${5*scale}px ${10*scale}px` }}>
      <div style={{ borderLeft:`2px solid #0F766E`, paddingLeft:4*scale, marginBottom:3*scale }}>
        {MOCK.items.map(i => (
          <div key={i.name} style={{ display:'flex', justifyContent:'space-between', fontSize:3.5*scale, marginBottom:1.5*scale }}>
            <span>{i.name}</span><span style={{ fontWeight:700 }}>৳{i.price}</span>
          </div>
        ))}
      </div>
      <div style={{ background:'#0F766E', borderRadius:2*scale, padding:`${3*scale}px ${6*scale}px`, display:'flex', justifyContent:'space-between', fontSize:4.5*scale, fontWeight:800, color:'#fff' }}>
        <span>Total</span><span>৳{MOCK.total}</span>
      </div>
    </div>
  </div>
)

/* 8 — Indigo Sidebar */
const IndigoSidebar: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ width:160*scale, height:210*scale, background:'#fff', fontFamily:'sans-serif', overflow:'hidden', border:'1px solid #e5e7eb', display:'flex' }}>
    <div style={{ width:45*scale, background:'#312E81', padding:`${10*scale}px ${5*scale}px`, display:'flex', flexDirection:'column', alignItems:'center', gap:3*scale }}>
      <div style={{ width:20*scale, height:20*scale, borderRadius:'50%', background:'#6366F1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:5*scale, fontWeight:900, color:'#fff' }}>S</div>
      <div style={{ fontSize:2.5*scale, color:'#A5B4FC', textAlign:'center', wordBreak:'break-all' }}>{MOCK.store}</div>
      <div style={{ height:0.5, width:'80%', background:'#4F46E5' }} />
      <div style={{ fontSize:2.5*scale, color:'#C7D2FE', textAlign:'center' }}>{MOCK.invoice}</div>
      <div style={{ fontSize:2.5*scale, color:'#818CF8' }}>{MOCK.date}</div>
    </div>
    <div style={{ flex:1, padding:`${8*scale}px ${8*scale}px` }}>
      <div style={{ fontSize:5*scale, fontWeight:700, color:'#312E81', marginBottom:4*scale }}>Invoice</div>
      <div style={{ fontSize:3*scale, color:'#9CA3AF', marginBottom:1*scale }}>Bill to</div>
      <div style={{ fontSize:4*scale, fontWeight:600, marginBottom:4*scale }}>{MOCK.customer}</div>
      {MOCK.items.map(i => (
        <div key={i.name} style={{ display:'flex', justifyContent:'space-between', fontSize:3.5*scale, borderBottom:`0.5px solid #E0E7FF`, padding:`${1.5*scale}px 0` }}>
          <span style={{ overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:'60%' }}>{i.name}</span>
          <span style={{ fontWeight:700, color:'#4F46E5' }}>৳{i.price}</span>
        </div>
      ))}
      <div style={{ marginTop:4*scale, display:'flex', justifyContent:'space-between', fontSize:5*scale, fontWeight:800 }}>
        <span>Total</span><span style={{ color:'#312E81' }}>৳{MOCK.total}</span>
      </div>
    </div>
  </div>
)

/* 9 — Green Badge */
const GreenBadge: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ width:160*scale, height:210*scale, background:'#F0FDF4', fontFamily:'sans-serif', overflow:'hidden', border:'1px solid #e5e7eb', padding:`${10*scale}px ${10*scale}px` }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5*scale }}>
      <div style={{ fontSize:7*scale, fontWeight:900, color:'#14532D' }}>{MOCK.store}</div>
      <div style={{ background:'#16A34A', borderRadius:10*scale, padding:`${1.5*scale}px ${5*scale}px`, fontSize:3.5*scale, color:'#fff', fontWeight:700 }}>PAID</div>
    </div>
    <div style={{ background:'#fff', borderRadius:4*scale, padding:`${5*scale}px ${6*scale}px`, marginBottom:3*scale, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:3*scale, color:'#6B7280', marginBottom:2*scale }}>
        <span>{MOCK.invoice}</span><span>{MOCK.date}</span>
      </div>
      <div style={{ fontSize:4*scale, fontWeight:700, marginBottom:3*scale }}>{MOCK.customer}</div>
      {MOCK.items.map(i => (
        <div key={i.name} style={{ display:'flex', justifyContent:'space-between', fontSize:3.5*scale, padding:`${1*scale}px 0`, borderBottom:`0.5px solid #DCFCE7` }}>
          <span>{i.name}</span><span>৳{i.price}</span>
        </div>
      ))}
    </div>
    <div style={{ background:'#16A34A', borderRadius:4*scale, padding:`${4*scale}px ${6*scale}px`, display:'flex', justifyContent:'space-between', fontSize:5*scale, fontWeight:800, color:'#fff' }}>
      <span>Total</span><span>৳{MOCK.total}</span>
    </div>
  </div>
)

/* 10 — Mono Executive */
const MonoExec: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ width:160*scale, height:210*scale, background:'#fff', fontFamily:'Georgia,serif', overflow:'hidden', border:'1px solid #111' }}>
    <div style={{ borderBottom:'2px solid #111', padding:`${8*scale}px ${10*scale}px`, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
      <div style={{ fontSize:9*scale, fontWeight:700, letterSpacing:2, color:'#111' }}>{MOCK.store.toUpperCase()}</div>
      <div style={{ textAlign:'right' }}>
        <div style={{ fontSize:3*scale, color:'#6B7280', letterSpacing:1 }}>INVOICE</div>
        <div style={{ fontSize:3.5*scale, fontWeight:600 }}>{MOCK.invoice}</div>
      </div>
    </div>
    <div style={{ padding:`${6*scale}px ${10*scale}px` }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:3.5*scale, marginBottom:5*scale }}>
        <div><div style={{ fontSize:3*scale, color:'#9CA3AF', letterSpacing:1 }}>BILL TO</div><div style={{ fontWeight:700 }}>{MOCK.customer}</div></div>
        <div style={{ textAlign:'right' }}><div style={{ fontSize:3*scale, color:'#9CA3AF', letterSpacing:1 }}>DATE</div><div style={{ fontWeight:700 }}>{MOCK.date}</div></div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:3.5*scale }}>
        <thead>
          <tr style={{ borderBottom:'0.5px solid #111' }}>
            <th style={{ textAlign:'left', padding:`${1.5*scale}px 0`, fontSize:3*scale, fontWeight:600, color:'#6B7280', letterSpacing:1 }}>DESCRIPTION</th>
            <th style={{ textAlign:'right', padding:`${1.5*scale}px 0`, fontSize:3*scale, fontWeight:600, color:'#6B7280', letterSpacing:1 }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {MOCK.items.map(i => (
            <tr key={i.name} style={{ borderBottom:'0.5px solid #E5E7EB' }}>
              <td style={{ padding:`${2*scale}px 0` }}>{i.name}</td>
              <td style={{ textAlign:'right', padding:`${2*scale}px 0` }}>৳{i.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ borderTop:'2px solid #111', marginTop:2*scale, paddingTop:2*scale, display:'flex', justifyContent:'space-between', fontSize:5*scale, fontWeight:700 }}>
        <span>TOTAL</span><span>৳{MOCK.total}</span>
      </div>
    </div>
  </div>
)

/* ─── Template registry ──────────────────────────────────────────────────── */
const TEMPLATES: Template[] = [
  { id:'classic',    name:'Invoice 1', style:'Default Classic',    preview:Classic        },
  { id:'modern',     name:'Invoice 2', style:'Modern Blue',        preview:ModernBlue     },
  { id:'elegant',    name:'Invoice 3', style:'Elegant Dark',       preview:ElegantDark    },
  { id:'minimal',    name:'Invoice 4', style:'Minimal Style',      preview:Minimal        },
  { id:'pink',       name:'Invoice 5', style:'Pink Brand',         preview:PinkBrand      },
  { id:'corporate',  name:'Invoice 6', style:'Split Corporate',    preview:SplitCorporate },
  { id:'teal',       name:'Invoice 7', style:'Teal Professional',  preview:TealPro        },
  { id:'indigo',     name:'Invoice 8', style:'Indigo Sidebar',     preview:IndigoSidebar  },
  { id:'green',      name:'Invoice 9', style:'Green Badge',        preview:GreenBadge     },
  { id:'mono',       name:'Invoice 10',style:'Mono Executive',     preview:MonoExec       },
]

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function InvoiceTemplatePage() {
  const { invoiceTemplate, setInvoiceTemplate } = useSettingsStore()
  const [preview, setPreview] = useState<Template | null>(null)

  function activate(id: string) {
    setInvoiceTemplate(id)
  }

  const activeTemplate = TEMPLATES.find(t => t.id === invoiceTemplate) ?? TEMPLATES[0]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center gap-4">
        <Link href="/admin/settings"
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-[15px] font-bold text-gray-900">Invoice Template</h1>
          <p className="text-[12px] text-gray-500">Active: <span className="font-semibold text-gray-700">{activeTemplate.name} — {activeTemplate.style}</span></p>
        </div>
      </div>

      {/* Intro */}
      <div className="flex flex-col items-center text-center pb-2">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm" style={{ background:'#ECFDF5' }}>
          <Printer size={24} style={{ color:'#059669' }} />
        </div>
        <h2 className="text-xl font-black text-gray-900">Choose Your Invoice</h2>
        <p className="text-[13px] text-gray-500 mt-1">Preview each invoice design and select the one you like. Click to see full preview.</p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {TEMPLATES.map(t => {
          const isActive = invoiceTemplate === t.id
          const Preview  = t.preview
          return (
            <div key={t.id}
              className={`group flex flex-col rounded-2xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                isActive ? 'border-green-500 shadow-md shadow-green-100' : 'border-gray-200 hover:border-gray-300'
              }`}>
              {/* Active badge */}
              {isActive && (
                <div className="flex items-center justify-center gap-1 py-1 text-[10px] font-bold text-white"
                  style={{ background:'#16A34A' }}>
                  <Check size={10} /> ACTIVE
                </div>
              )}

              {/* Preview thumbnail */}
              <div className="relative bg-gray-50 flex items-center justify-center py-3 overflow-hidden"
                onClick={() => setPreview(t)}>
                <div style={{ transform:'scale(0.65)', transformOrigin:'top center', marginBottom: -55 }}>
                  <Preview scale={1} />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white/90 text-gray-700 text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                    <Eye size={11} /> Preview
                  </span>
                </div>
              </div>

              {/* Info + button */}
              <div className="px-3 py-3 bg-white flex flex-col items-center gap-2 border-t border-gray-100">
                <p className="text-[13px] font-bold text-gray-900 leading-none">{t.name}</p>
                <p className="text-[11px]" style={{ color: isActive ? '#16A34A' : '#9CA3AF' }}>{t.style}</p>
                <button onClick={() => activate(t.id)}
                  className={`w-full py-2 rounded-xl text-[12px] font-bold transition-all ${
                    isActive
                      ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={isActive ? {} : { background:'#16A34A' }}
                  disabled={isActive}>
                  {isActive ? 'Currently Active' : 'Activate This'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Full preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setPreview(null)}>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg"
            onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900 text-[14px]">{preview.name}</p>
                <p className="text-[11px] text-gray-400">{preview.style}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { activate(preview.id); setPreview(null) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                    invoiceTemplate === preview.id
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'text-white'
                  }`}
                  style={invoiceTemplate === preview.id ? {} : { background:'#16A34A' }}>
                  {invoiceTemplate === preview.id ? <><Check size={12} /> Active</> : 'Activate'}
                </button>
                <button onClick={() => setPreview(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* Full-size document preview */}
            <div className="flex items-start justify-center bg-[#F1F5F9] p-8 overflow-auto" style={{ maxHeight: '75vh' }}>
              {/* Container sized to the scaled output so no clipping */}
              <div style={{ width: 400, height: 525, flexShrink: 0, position: 'relative', overflow: 'hidden', borderRadius: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                <div style={{ transform: 'scale(2.5)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                  <preview.preview scale={1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
