'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, Settings2, Package, Save, Eye, EyeOff, Copy,
  CheckCircle2, Clock, XCircle, RotateCcw, ExternalLink,
  Search, Trash2, RefreshCw, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCourierStore, type CourierSlug, type Shipment, type ShipmentStatus } from '@/lib/courierStore'

const BRAND = '#D81B60'

/* ── Courier metadata ───────────────────────────────────────────────────── */
const COURIERS: {
  slug: CourierSlug; name: string; logo: string; color: string
  trackUrl: string; hasApi: boolean; fields: string[]
}[] = [
  { slug:'steadfast', name:'Steadfast Courier', logo:'🚚', color:'#E53935', trackUrl:'https://steadfast.com.bd/t/', hasApi:true,  fields:['apiKey','apiSecret'] },
  { slug:'pathao',    name:'Pathao',            logo:'🟠', color:'#FF6B00', trackUrl:'https://pathao.com/track/',  hasApi:true,  fields:['apiKey','apiSecret','storeId'] },
  { slug:'paperfly',  name:'Paperfly',          logo:'✈️', color:'#1565C0', trackUrl:'https://paperfly.com.bd/',   hasApi:true,  fields:['apiKey','apiSecret'] },
  { slug:'redx',      name:'RedX',              logo:'🔴', color:'#C62828', trackUrl:'https://redx.com.bd/track/',hasApi:true,  fields:['apiKey','storeId'] },
  { slug:'ecourier',  name:'eCourier',          logo:'📦', color:'#2E7D32', trackUrl:'https://ecourier.com.bd/',  hasApi:true,  fields:['apiKey','apiSecret','storeId'] },
  { slug:'sundarban', name:'Sundarban Courier', logo:'🏢', color:'#6A1B9A', trackUrl:'',                          hasApi:false, fields:[] },
]

/* ── Status metadata ────────────────────────────────────────────────────── */
const STATUS_META: Record<ShipmentStatus, { label:string; icon: React.ReactNode; color:string; bg:string }> = {
  pending:              { label:'Pending',            icon:<Clock size={12}/>,       color:'text-amber-600',  bg:'bg-amber-50 border-amber-200'  },
  in_review:            { label:'In Review',          icon:<AlertCircle size={12}/>, color:'text-blue-600',   bg:'bg-blue-50 border-blue-200'    },
  partially_dispatched: { label:'Part. Dispatched',   icon:<Truck size={12}/>,       color:'text-violet-600', bg:'bg-violet-50 border-violet-200'},
  dispatched:           { label:'Dispatched',         icon:<Truck size={12}/>,       color:'text-cyan-600',   bg:'bg-cyan-50 border-cyan-200'    },
  partial_delivered:    { label:'Part. Delivered',    icon:<Package size={12}/>,     color:'text-teal-600',   bg:'bg-teal-50 border-teal-200'    },
  delivered:            { label:'Delivered',          icon:<CheckCircle2 size={12}/>,color:'text-green-600',  bg:'bg-green-50 border-green-200'  },
  partial_returned:     { label:'Part. Returned',     icon:<RotateCcw size={12}/>,   color:'text-orange-600', bg:'bg-orange-50 border-orange-200'},
  returned:             { label:'Returned',           icon:<RotateCcw size={12}/>,   color:'text-red-600',    bg:'bg-red-50 border-red-200'      },
  cancelled:            { label:'Cancelled',          icon:<XCircle size={12}/>,     color:'text-gray-500',   bg:'bg-gray-50 border-gray-200'    },
  hold:                 { label:'On Hold',            icon:<AlertCircle size={12}/>, color:'text-yellow-700', bg:'bg-yellow-50 border-yellow-200'},
}

function StatusBadge({ status }: { status: ShipmentStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.pending
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${m.bg} ${m.color}`}>
      {m.icon}{m.label}
    </span>
  )
}

/* ── Shared widgets ─────────────────────────────────────────────────────── */
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white ${props.className ?? ''}`} />
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function CourierPage() {
  const [tab, setTab] = useState<'settings' | 'shipments'>('settings')
  const { shipments } = useCourierStore()

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-black text-gray-900">Courier Integration</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Connect local courier APIs and manage shipments for all orders.</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-500">
          <span className="bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-xl">
            {shipments.filter(s => s.status === 'dispatched' || s.status === 'partially_dispatched').length} In Transit
          </span>
          <span className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
            {shipments.length} Total Shipments
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1">
        {([
          { id:'settings',  label:'Courier Settings', icon:<Settings2 size={15}/> },
          { id:'shipments', label:'Shipments',        icon:<Package size={15}/>   },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
              tab === t.id ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
            }`}
            style={tab === t.id ? { background: BRAND } : {}}>
            {t.icon}{t.label}
            {t.id === 'shipments' && shipments.length > 0 && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {shipments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
          transition={{ duration:0.15 }}>
          {tab === 'settings'  && <SettingsTab />}
          {tab === 'shipments' && <ShipmentsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SETTINGS TAB
══════════════════════════════════════════════════════════════════════════ */
function SettingsTab() {
  const { configs, setConfig } = useCourierStore()
  const [show, setShow] = useState<Record<string, boolean>>({})

  function save(slug: CourierSlug) {
    toast.success(`${COURIERS.find(c => c.slug === slug)?.name} settings saved`)
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-start gap-3">
        <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[12px] text-amber-800">
          API credentials are stored locally. For production use, store them as Vercel environment variables and use the server-side API routes.
        </p>
      </div>

      {COURIERS.map(({ slug, name, logo, color, trackUrl, hasApi, fields }) => {
        const cfg = configs[slug]
        return (
          <div key={slug}
            className={`bg-white rounded-2xl border transition-all ${cfg.enabled ? 'border-green-200' : 'border-gray-100'}`}>
            {/* Header row */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gray-50 border border-gray-100 shrink-0">{logo}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-bold text-gray-900">{name}</p>
                  {cfg.enabled && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">ACTIVE</span>}
                  {!hasApi && <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">Manual tracking only</span>}
                </div>
                {trackUrl && (
                  <a href={trackUrl} target="_blank" rel="noreferrer"
                    className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-0.5 w-fit">
                    <ExternalLink size={10} />{trackUrl}
                  </a>
                )}
              </div>
              {/* Toggle */}
              <button onClick={() => setConfig(slug, { enabled: !cfg.enabled })}
                className="w-12 h-6 rounded-full relative shrink-0 transition-colors"
                style={{ background: cfg.enabled ? color : '#E5E7EB' }}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${cfg.enabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* API fields — only when enabled + has API */}
            {cfg.enabled && hasApi && (
              <div className="border-t border-gray-50 px-5 pb-5 pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.includes('apiKey') && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">API Key</label>
                      <div className="relative">
                        <Input
                          type={show[slug + '_key'] ? 'text' : 'password'}
                          value={cfg.apiKey}
                          placeholder="Enter API key…"
                          onChange={e => setConfig(slug, { apiKey: e.target.value })}
                          className="pr-9 font-mono text-[12px]"
                        />
                        <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShow(s => ({ ...s, [slug+'_key']: !s[slug+'_key'] }))}>
                          {show[slug+'_key'] ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </div>
                    </div>
                  )}
                  {fields.includes('apiSecret') && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Secret Key</label>
                      <div className="relative">
                        <Input
                          type={show[slug + '_secret'] ? 'text' : 'password'}
                          value={cfg.apiSecret}
                          placeholder="Enter secret key…"
                          onChange={e => setConfig(slug, { apiSecret: e.target.value })}
                          className="pr-9 font-mono text-[12px]"
                        />
                        <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShow(s => ({ ...s, [slug+'_secret']: !s[slug+'_secret'] }))}>
                          {show[slug+'_secret'] ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </div>
                    </div>
                  )}
                  {fields.includes('storeId') && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Store ID / Client ID</label>
                      <Input value={cfg.storeId} placeholder="Enter store ID…"
                        onChange={e => setConfig(slug, { storeId: e.target.value })} className="font-mono text-[12px]" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => save(slug)}
                    className="flex items-center gap-2 text-white px-5 py-2 rounded-xl text-[13px] font-bold hover:opacity-90"
                    style={{ background: BRAND }}>
                    <Save size={13}/> Save Credentials
                  </button>
                  {cfg.apiKey && (
                    <button onClick={() => { navigator.clipboard.writeText(cfg.apiKey); toast.success('API key copied') }}
                      className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-xl transition-colors">
                      <Copy size={12}/> Copy Key
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SHIPMENTS TAB
══════════════════════════════════════════════════════════════════════════ */
function ShipmentsTab() {
  const { shipments, updateShipment, deleteShipment, configs } = useCourierStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'All'>('All')
  const [tracking, setTracking] = useState<Record<string, boolean>>({})

  const filtered = shipments.filter(s => {
    const q = search.toLowerCase()
    const matchQ = s.orderNumber.toLowerCase().includes(q) || s.trackingCode.toLowerCase().includes(q) || s.recipientName.toLowerCase().includes(q)
    return matchQ && (statusFilter === 'All' || s.status === statusFilter)
  })

  async function refreshStatus(s: Shipment) {
    setTracking(t => ({ ...t, [s.id]: true }))
    try {
      const res = await fetch(`/api/courier/${s.courier}/track?code=${s.trackingCode}&consignment=${s.consignmentId}`)
      if (res.ok) {
        const data = await res.json()
        updateShipment(s.id, { status: data.status, updatedAt: new Date().toISOString() })
        toast.success('Status updated')
      } else {
        toast.error('Could not fetch status')
      }
    } catch {
      toast.error('Network error')
    }
    setTracking(t => ({ ...t, [s.id]: false }))
  }

  const courierMeta = Object.fromEntries(COURIERS.map(c => [c.slug, c]))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order, tracking, name…" className="pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ShipmentStatus | 'All')}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white">
          <option value="All">All Statuses</option>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Package size={32} className="mx-auto text-gray-200 mb-3" />
          <p className="text-[14px] font-semibold text-gray-400">No shipments yet</p>
          <p className="text-[12px] text-gray-300 mt-1">Book a courier from the Orders page to create shipments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const cm = courierMeta[s.courier]
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Courier logo */}
                  <div className="text-2xl shrink-0 mt-0.5">{cm?.logo ?? '📦'}</div>

                  {/* Main info */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[13px] font-black text-gray-900">{s.orderNumber}</span>
                      <StatusBadge status={s.status} />
                      <span className="text-[11px] text-gray-400 font-medium">{cm?.name}</span>
                    </div>
                    <p className="text-[12px] text-gray-600 font-semibold">{s.recipientName}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{s.recipientAddress}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {s.trackingCode && (
                        <span className="flex items-center gap-1.5 text-[11px] font-mono bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                          {s.trackingCode}
                          <button onClick={() => { navigator.clipboard.writeText(s.trackingCode); toast.success('Copied') }}
                            className="text-gray-400 hover:text-gray-600 ml-0.5">
                            <Copy size={10}/>
                          </button>
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">COD: ৳{s.codAmount}</span>
                      <span className="text-[11px] text-gray-400">{s.weight}kg</span>
                      <span className="text-[11px] text-gray-400">{new Date(s.createdAt).toLocaleDateString('en-BD')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {configs[s.courier]?.enabled && configs[s.courier]?.apiKey && (
                      <button onClick={() => refreshStatus(s)} disabled={tracking[s.id]}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-2 rounded-xl transition-colors disabled:opacity-40">
                        <RefreshCw size={12} className={tracking[s.id] ? 'animate-spin' : ''} />
                        Track
                      </button>
                    )}
                    {cm?.trackUrl && s.trackingCode && (
                      <a href={cm.trackUrl + s.trackingCode} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-500 hover:text-blue-700 border border-blue-100 bg-blue-50 px-3 py-2 rounded-xl transition-colors">
                        <ExternalLink size={12}/>Live Track
                      </a>
                    )}
                    <button onClick={() => { if(confirm('Delete shipment record?')) deleteShipment(s.id) }}
                      className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 border border-gray-100 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
