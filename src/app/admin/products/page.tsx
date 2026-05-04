'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Search,
  Upload, X, Tag, Star, Package, ChevronDown,
  ImagePlus, Palette, Ruler, Layers, Info, DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { ProductCategory } from '@/types'

/* ── Constants ─────────────────────────────────────────────── */
const ALL_SIZES    = ['XS','S','M','L','XL','XXL','XXXL','Free Size','One Size']
const ALL_COLORS   = ['Blush Pink','Bubblegum Pink','Coral Orange','Sage Green','Sky Blue','Cobalt Blue','Deep Burgundy','Ivory White','Black Onyx','Cream','Dusty Rose','Lavender Mist','Butter Yellow','Cotton Candy Pink','Rose Gold','Gold','Silver','Black','White','Navy Blue','Olive Green','Rust Orange','Teal','Caramel','Tan','Multicolor']
const ALL_MATERIALS= ['Cotton','Chiffon','Silk','Satin','Linen','Polyester','Viscose','Georgette','Net','Velvet','Denim','Leather','Vegan Leather','Canvas','Organza','Jacquard']
const ALL_BADGES   = ['','New','Trending','Sale','Limited','Popular','Best Seller']
const CATEGORIES: ProductCategory[] = ['Dress','Bag','Jewelry','Accessory','Footwear']

const SWATCH: Record<string,string> = {
  'Blush Pink':'#FFB6C1','Bubblegum Pink':'#FF69B4','Coral Orange':'#FF7F50',
  'Sage Green':'#B2C9AD','Sky Blue':'#87CEEB','Cobalt Blue':'#0047AB',
  'Deep Burgundy':'#800020','Ivory White':'#F5F5DC','Black Onyx':'#111111',
  'Cream':'#FFFDD0','Dusty Rose':'#DCAE96','Lavender Mist':'#C4A8E1',
  'Butter Yellow':'#FFFACD','Cotton Candy Pink':'#FFB7D5','Rose Gold':'#B76E79',
  'Gold':'#D4AF37','Silver':'#AAAAAA','Black':'#111111','White':'#FFFFFF',
  'Navy Blue':'#001F5B','Olive Green':'#556B2F','Rust Orange':'#B7410E',
  'Teal':'#008080','Caramel':'#C68642','Tan':'#D2B48C','Multicolor':'linear-gradient(135deg,#FF69B4,#87CEEB,#FFD700)',
}

const CAT_COLOR: Record<string,string> = {
  Dress:'#C2185B', Bag:'#1565C0', Jewelry:'#B8860B', Accessory:'#2E7D32', Footwear:'#6A1B9A',
}

/* ── Mock data ─────────────────────────────────────────────── */
type MockProduct = {
  id:string; sku:string; barcode:string; name:string; category:ProductCategory; price:number;
  cost_price:number; compare_at_price:number; total_stock:number; total_sold:number;
  badge:string; is_active:boolean; is_featured:boolean; colors:string[];
  available_sizes:string[]; materials:string[]; tags:string[];
  short_description:string; description:string; image_urls:string[];
}

/* ── Auto-generators ─────────────────────────────────────────── */
const CAT_CODE: Record<string, string> = {
  Dress:'DR', Bag:'BG', Jewelry:'JWL', Accessory:'AC', Footwear:'FW',
}

function generateSKU(category: string, existing: MockProduct[]): string {
  const code = CAT_CODE[category] ?? 'XX'
  const same  = existing.filter(p => p.category === category)
  const seq   = String(same.length + 1).padStart(3, '0')
  return `SJP-${code}-${seq}`
}

function generateBarcode(): string {
  // EAN-13: country prefix 880 (Bangladesh) + 9 random digits + check digit
  const body = '880' + Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('')
  let sum = 0
  for (let i = 0; i < 12; i++) sum += parseInt(body[i]) * (i % 2 === 0 ? 1 : 3)
  const check = (10 - (sum % 10)) % 10
  return body + check
}
const MOCK: MockProduct[] = [
  { id:'p1', sku:'SJP-DR-001', barcode:'8801234567890', name:'Bloom Garden Midi Dress', category:'Dress', price:3200, cost_price:1400, compare_at_price:3900, total_stock:45, total_sold:12, badge:'New', is_active:true, is_featured:true, colors:['Blush Pink','Sage Green','Sky Blue'], available_sizes:['XS','S','M','L','XL'], materials:['Chiffon','Cotton'], tags:['floral','summer','midi'], short_description:'Floral chiffon midi with puff sleeves.', description:'', image_urls:[] },
  { id:'p2', sku:'SJP-DR-002', barcode:'8801234567891', name:'Sunset Ruffle Maxi Dress', category:'Dress', price:4100, cost_price:1800, compare_at_price:5200, total_stock:24, total_sold:8, badge:'Trending', is_active:true, is_featured:true, colors:['Coral Orange','Deep Burgundy','Ivory White'], available_sizes:['S','M','L'], materials:['Satin'], tags:['formal','maxi','evening'], short_description:'Satin ruffle maxi for formal occasions.', description:'', image_urls:[] },
  { id:'p3', sku:'SJP-BG-001', barcode:'8801234567892', name:'Pearl Quilted Shoulder Bag', category:'Bag', price:5800, cost_price:2200, compare_at_price:0, total_stock:18, total_sold:5, badge:'New', is_active:true, is_featured:true, colors:['Ivory White','Black Onyx','Dusty Rose'], available_sizes:['One Size'], materials:['Vegan Leather'], tags:['quilted','shoulder','pearl'], short_description:'Quilted vegan leather shoulder bag.', description:'', image_urls:[] },
  { id:'p4', sku:'SJP-JWL-001', barcode:'8801234567893', name:'Pearl Drop Earrings', category:'Jewelry', price:890, cost_price:290, compare_at_price:1100, total_stock:60, total_sold:38, badge:'Popular', is_active:true, is_featured:false, colors:['Gold','Silver'], available_sizes:['One Size'], materials:[], tags:['pearl','earrings','gold'], short_description:'Freshwater pearl drops with 18k gold finish.', description:'', image_urls:[] },
  { id:'p5', sku:'SJP-AC-001', barcode:'8801234567894', name:'Silk Scarf — Floral Print', category:'Accessory', price:1800, cost_price:600, compare_at_price:2200, total_stock:40, total_sold:10, badge:'New', is_active:true, is_featured:false, colors:['Multicolor','Blush Pink'], available_sizes:['One Size'], materials:['Silk'], tags:['scarf','floral','silk'], short_description:'100% silk twill scarf.', description:'', image_urls:[] },
  { id:'p6', sku:'SJP-DR-003', barcode:'8801234567895', name:'Cotton Candy Mini Dress', category:'Dress', price:2400, cost_price:950, compare_at_price:2900, total_stock:88, total_sold:22, badge:'Sale', is_active:false, is_featured:false, colors:['Cotton Candy Pink','Lavender Mist','Butter Yellow'], available_sizes:['XS','S','M','L','XL','XXL'], materials:['Cotton'], tags:['mini','casual','pastel'], short_description:'Smocked cotton mini in pastel shades.', description:'', image_urls:[] },
]

/* ── Empty form ─────────────────────────────────────────────── */
const EMPTY = (): MockProduct => ({
  id:'', sku:'', barcode:'', name:'', category:'Dress', price:0, cost_price:0, compare_at_price:0,
  total_stock:0, total_sold:0, badge:'', is_active:true, is_featured:false,
  colors:[], available_sizes:[], materials:[], tags:[], short_description:'', description:'', image_urls:[],
})

const TABS = [
  { id:'basic',     label:'Basic Info',   icon: Info },
  { id:'pricing',   label:'Pricing',      icon: DollarSign },
  { id:'attributes',label:'Attributes',   icon: Layers },
  { id:'media',     label:'Media',        icon: ImagePlus },
]

/* ── Tag input helper ─────────────────────────────────────────── */
function TagInput({ label, values, onChange, suggestions, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void;
  suggestions?: string[]; placeholder?: string
}) {
  const [input, setInput] = useState('')
  const [open,  setOpen]  = useState(false)
  const add = (v: string) => { if (v && !values.includes(v)) onChange([...values, v]); setInput('') }
  const remove = (v: string) => onChange(values.filter(x => x !== v))
  const filtered = suggestions?.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s)) || []

  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
      <div className="border border-gray-200 rounded-lg p-2 min-h-[42px] focus-within:border-gray-400 transition-colors bg-white">
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {values.map(v => (
            <span key={v} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-[12px] font-medium text-gray-700">
              {v}
              <button onClick={() => remove(v)} className="text-gray-400 hover:text-gray-700 ml-0.5"><X size={10} /></button>
            </span>
          ))}
        </div>
        <div className="relative">
          <input value={input} onChange={e => { setInput(e.target.value); setOpen(true) }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(input.trim()) } }}
            onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={placeholder || 'Type and press Enter…'}
            className="w-full text-[13px] outline-none bg-transparent placeholder-gray-300 px-1" />
          {open && filtered.length > 0 && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto min-w-[180px]">
              {filtered.slice(0,10).map(s => (
                <button key={s} onMouseDown={() => add(s)}
                  className="w-full text-left px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Color picker ─────────────────────────────────────────────── */
function ColorPicker({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const toggle = (c: string) => values.includes(c) ? onChange(values.filter(x => x !== c)) : onChange([...values, c])
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Colors</label>
      <div className="flex flex-wrap gap-2">
        {ALL_COLORS.map(c => {
          const active = values.includes(c)
          const bg = SWATCH[c]
          const isGrad = bg?.startsWith('linear')
          return (
            <button key={c} onClick={() => toggle(c)} title={c}
              className={`relative flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
                active ? 'border-gray-800 shadow-sm bg-gray-50' : 'border-gray-200 hover:border-gray-400'
              }`}>
              <span className="w-4 h-4 rounded-full border border-white/50 shadow-inner shrink-0"
                style={isGrad ? { background: bg } : { background: bg ?? '#ccc' }} />
              <span className={active ? 'text-gray-800 font-semibold' : 'text-gray-500'}>{c}</span>
              {active && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gray-800 rounded-full flex items-center justify-center"><X size={7} className="text-white" /></span>}
            </button>
          )
        })}
      </div>
      {values.length > 0 && (
        <p className="text-[11px] text-gray-400 mt-2">{values.length} color{values.length > 1 ? 's' : ''} selected</p>
      )}
    </div>
  )
}

/* ── Size picker ──────────────────────────────────────────────── */
function SizePicker({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const toggle = (s: string) => values.includes(s) ? onChange(values.filter(x => x !== s)) : onChange([...values, s])
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Available Sizes</label>
      <div className="flex flex-wrap gap-2">
        {ALL_SIZES.map(s => (
          <button key={s} onClick={() => toggle(s)}
            className={`px-3 py-1.5 text-[12px] font-semibold border rounded transition-all ${
              values.includes(s)
                ? 'border-[#C2185B] bg-[#FFF0F4] text-[#C2185B]'
                : 'border-gray-200 text-gray-500 hover:border-gray-400'
            }`}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function AdminProductsPage() {
  const [products,   setProducts]   = useState<MockProduct[]>(MOCK)
  const [search,     setSearch]     = useState('')
  const [catFilter,  setCatFilter]  = useState('All')
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState<MockProduct>(EMPTY())
  const [tab,        setTab]        = useState('basic')
  const [tagInput,   setTagInput]   = useState('')
  const [skuMode,    setSkuMode]    = useState<'auto' | 'manual'>('auto')
  const [barcodeMode,setBarcodeMode]= useState<'auto' | 'manual'>('auto')

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase()
    return (catFilter === 'All' || p.category === catFilter) &&
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }), [products, search, catFilter])

  const openNew  = () => { setForm(EMPTY()); setSkuMode('auto'); setBarcodeMode('auto'); setTab('basic'); setShowForm(true) }
  const openEdit = (p: MockProduct) => {
    setForm({ ...p })
    setSkuMode(p.sku ? 'manual' : 'auto')
    setBarcodeMode(p.barcode ? 'manual' : 'auto')
    setTab('basic'); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setForm(EMPTY()) }

  const F = <K extends keyof MockProduct>(k: K, v: MockProduct[K]) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Product name is required'); setTab('basic'); return }
    if (!form.price)       { toast.error('Sell price is required'); setTab('pricing'); return }
    if (form.colors.length === 0) { toast.error('Select at least one color'); setTab('attributes'); return }
    if (form.available_sizes.length === 0) { toast.error('Select at least one size'); setTab('attributes'); return }

    const sku     = skuMode === 'auto' || !form.sku.trim()     ? generateSKU(form.category, products) : form.sku.trim()
    const barcode = barcodeMode === 'auto' || !form.barcode.trim() ? generateBarcode()                : form.barcode.trim()

    const saved = { ...form, sku, barcode }
    if (form.id) {
      setProducts(ps => ps.map(p => p.id === form.id ? saved : p))
      toast.success('Product updated')
    } else {
      setProducts(ps => [{ ...saved, id: 'p' + Date.now() }, ...ps])
      toast.success(`Product created · SKU: ${sku}`)
    }
    closeForm()
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setProducts(ps => ps.filter(p => p.id !== id))
    toast.success(`${name} deleted`)
  }

  const input = (label: string, key: keyof MockProduct, type = 'text', ph = '') => (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
      <input type={type} value={String(form[key] ?? '')}
        onChange={e => F(key, (type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value) as MockProduct[typeof key])}
        placeholder={ph}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400 transition-colors" />
    </div>
  )

  return (
    <div className="space-y-5">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
          <input type="text" placeholder="Search name or SKU…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-gray-50 focus:bg-white transition-all" />
        </div>
        <div className="flex gap-1.5">
          {['All', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wide rounded-lg transition-all ${
                catFilter === c ? 'text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
              style={catFilter === c ? { background: CAT_COLOR[c] ?? '#111' } : {}}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={openNew}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 text-[12px] font-bold tracking-widest uppercase text-white transition-opacity hover:opacity-90"
          style={{ background: '#C2185B' }}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Total Products', val: products.length },
          { label:'Active',         val: products.filter(p => p.is_active).length },
          { label:'Low Stock (≤5)', val: products.filter(p => p.total_stock <= 5 && p.total_stock > 0).length },
          { label:'Out of Stock',   val: products.filter(p => p.total_stock === 0).length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
            <p className="text-[22px] font-black text-gray-900">{s.val}</p>
            <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Product table ── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Product</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Price</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Colors / Sizes</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Materials</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Stock</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => {
                const margin = p.cost_price > 0 ? Math.round((1 - p.cost_price / p.price) * 100) : null
                return (
                  <tr key={p.id} className={`hover:bg-gray-50/60 transition-colors ${!p.is_active ? 'opacity-50' : ''}`}>
                    {/* Product */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                          style={{ background: (CAT_COLOR[p.category] ?? '#888') + '18' }}>
                          {p.category==='Dress'?'👗':p.category==='Bag'?'👜':p.category==='Jewelry'?'💍':p.category==='Footwear'?'👠':'✨'}
                        </div>
                        <div>
                          <p className="font-semibold text-[13px] text-gray-800 flex items-center gap-1.5">
                            {p.name}
                            {p.is_featured && <Star size={11} className="fill-amber-400 text-amber-400" />}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{ background: (CAT_COLOR[p.category]??'#888') + '15', color: CAT_COLOR[p.category]??'#888' }}>
                        {p.category}
                      </span>
                    </td>
                    {/* Price */}
                    <td className="px-4 py-3.5">
                      <p className="text-[13px] font-bold text-gray-900">৳{p.price.toLocaleString()}</p>
                      {margin !== null && <p className="text-[10px] text-emerald-600 font-semibold">{margin}% margin</p>}
                    </td>
                    {/* Colors / Sizes */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex gap-0.5 mb-1">
                        {p.colors.slice(0,5).map(c => (
                          <span key={c} title={c} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                            style={{ background: SWATCH[c]?.startsWith('linear') ? '#ccc' : (SWATCH[c]??'#ccc') }} />
                        ))}
                        {p.colors.length > 5 && <span className="text-[10px] text-gray-400 ml-0.5">+{p.colors.length-5}</span>}
                      </div>
                      <div className="flex flex-wrap gap-0.5">
                        {p.available_sizes.slice(0,4).map(s => (
                          <span key={s} className="text-[9px] font-bold border border-gray-200 px-1 py-0.5 text-gray-500">{s}</span>
                        ))}
                        {p.available_sizes.length > 4 && <span className="text-[10px] text-gray-400">+{p.available_sizes.length-4}</span>}
                      </div>
                    </td>
                    {/* Materials */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.materials.length > 0
                          ? p.materials.map(m => <span key={m} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{m}</span>)
                          : <span className="text-[11px] text-gray-300">—</span>
                        }
                      </div>
                    </td>
                    {/* Stock */}
                    <td className="px-4 py-3.5">
                      <span className={`text-[13px] font-bold ${p.total_stock===0?'text-red-500':p.total_stock<=5?'text-amber-500':'text-gray-800'}`}>
                        {p.total_stock}
                      </span>
                      {p.badge && (
                        <p className="text-[10px] font-semibold mt-0.5" style={{ color: p.badge==='Sale'?'#EF4444':'#6B7280' }}>{p.badge}</p>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#C2185B] hover:bg-[#FFF0F4] transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setProducts(ps => ps.map(x => x.id===p.id ? {...x, is_active:!x.is_active} : x))} title={p.is_active?'Hide':'Show'}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                          {p.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-[11px] text-gray-400">
          Showing {filtered.length} of {products.length} products
        </div>
      </div>

      {/* ══════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={closeForm} />

            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <motion.div className="bg-white w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl shadow-2xl overflow-hidden"
                initial={{ scale:0.94, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.94, y:20 }}
                transition={{ type:'spring', stiffness:320, damping:30 }}
                onClick={e => e.stopPropagation()}>

                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                  <div>
                    <h3 className="font-bold text-[15px] text-gray-900">{form.id ? 'Edit Product' : 'Add New Product'}</h3>
                    {form.id && <p className="text-[11px] text-gray-400 font-mono mt-0.5">{form.sku}</p>}
                  </div>
                  <button onClick={closeForm} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto">
                  {TABS.map(t => {
                    const Icon = t.icon
                    return (
                      <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-1.5 px-5 py-3 text-[12px] font-semibold whitespace-nowrap transition-colors border-b-2 ${
                          tab === t.id
                            ? 'border-[#C2185B] text-[#C2185B]'
                            : 'border-transparent text-gray-400 hover:text-gray-700'
                        }`}>
                        <Icon size={13} /> {t.label}
                      </button>
                    )
                  })}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <AnimatePresence mode="wait">

                    {/* ── BASIC INFO ── */}
                    {tab === 'basic' && (
                      <motion.div key="basic" initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} className="space-y-4">
                        {input('Product Name *', 'name', 'text', 'e.g. Blossom Wrap Dress')}

                        {/* SKU field */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">SKU</label>
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-bold">
                              {(['auto','manual'] as const).map(m => (
                                <button key={m} onClick={() => setSkuMode(m)}
                                  className={`px-3 py-1 transition-colors ${skuMode === m ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                  style={skuMode === m ? { background:'#C2185B' } : {}}>
                                  {m === 'auto' ? '⚡ Auto' : '✏️ Manual'}
                                </button>
                              ))}
                            </div>
                          </div>
                          {skuMode === 'auto' ? (
                            <div className="flex items-center gap-2 border border-dashed border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
                              <span className="text-[12px] font-mono text-gray-400">Will generate: </span>
                              <span className="text-[13px] font-mono font-bold text-[#C2185B]">
                                SJP-{CAT_CODE[form.category] ?? 'XX'}-{String(products.filter(p => p.category === form.category && p.id !== form.id).length + 1).padStart(3,'0')}
                              </span>
                            </div>
                          ) : (
                            <input type="text" value={form.sku}
                              onChange={e => F('sku', e.target.value.toUpperCase())}
                              placeholder="e.g. SJP-DR-007"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] font-mono text-gray-700 focus:outline-none focus:border-gray-400 transition-colors uppercase" />
                          )}
                        </div>

                        {/* Barcode field */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Barcode (EAN-13)</label>
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] font-bold">
                              {(['auto','manual'] as const).map(m => (
                                <button key={m} onClick={() => setBarcodeMode(m)}
                                  className={`px-3 py-1 transition-colors ${barcodeMode === m ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                  style={barcodeMode === m ? { background:'#C2185B' } : {}}>
                                  {m === 'auto' ? '⚡ Auto' : '✏️ Manual'}
                                </button>
                              ))}
                            </div>
                          </div>
                          {barcodeMode === 'auto' ? (
                            <div className="flex items-center gap-2 border border-dashed border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
                              <span className="text-[12px] font-mono text-gray-400">Will generate: </span>
                              <span className="text-[13px] font-mono font-bold text-[#C2185B]">880xxxxxxxxxx</span>
                              <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Bangladesh EAN-13</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <input type="text" value={form.barcode}
                                onChange={e => F('barcode', e.target.value.replace(/\D/g, '').slice(0, 13))}
                                placeholder="13-digit barcode e.g. 8801234567890"
                                maxLength={13}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] font-mono text-gray-700 focus:outline-none focus:border-gray-400 transition-colors pr-16" />
                              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold ${form.barcode.length === 13 ? 'text-green-500' : 'text-gray-300'}`}>
                                {form.barcode.length}/13
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Category</label>
                            <select value={form.category} onChange={e => F('category', e.target.value as ProductCategory)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400">
                              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Badge</label>
                            <select value={form.badge} onChange={e => F('badge', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400">
                              {ALL_BADGES.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                            </select>
                          </div>
                        </div>
                        {input('Short Description', 'short_description', 'text', 'One-line summary shown on product card')}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Full Description</label>
                          <textarea value={form.description} onChange={e => F('description', e.target.value)}
                            rows={4} placeholder="Detailed product description…"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400 resize-none" />
                        </div>
                        <div className="flex items-center gap-8 pt-1">
                          {[
                            { label:'Feature on Homepage', key:'is_featured' as const },
                            { label:'Active / Visible', key:'is_active' as const },
                          ].map(({ label, key }) => (
                            <label key={key} className="flex items-center gap-3 cursor-pointer select-none">
                              <div onClick={() => F(key, !form[key])}
                                className={`w-10 h-6 rounded-full relative transition-colors ${form[key] ? 'bg-[#C2185B]' : 'bg-gray-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form[key] ? 'left-5' : 'left-1'}`} />
                              </div>
                              <span className="text-[13px] font-medium text-gray-600">{label}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* ── PRICING ── */}
                    {tab === 'pricing' && (
                      <motion.div key="pricing" initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          {input('Sell Price (৳) *', 'price', 'number', '0')}
                          {input('Compare-at Price (৳)', 'compare_at_price', 'number', '0')}
                          {input('Cost Price (৳)', 'cost_price', 'number', '0')}
                        </div>
                        {form.price > 0 && form.cost_price > 0 && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                            <p className="text-[12px] font-semibold text-emerald-700">
                              Profit margin: {Math.round((1 - form.cost_price / form.price) * 100)}%
                              &nbsp;·&nbsp; Profit per unit: ৳{(form.price - form.cost_price).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {form.compare_at_price > form.price && form.price > 0 && (
                          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                            <p className="text-[12px] font-semibold text-blue-700">
                              Discount shown to customer: {Math.round((1 - form.price / form.compare_at_price) * 100)}% off
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          {input('Total Stock', 'total_stock', 'number', '0')}
                          {input('Total Sold', 'total_sold', 'number', '0')}
                        </div>
                      </motion.div>
                    )}

                    {/* ── ATTRIBUTES ── */}
                    {tab === 'attributes' && (
                      <motion.div key="attributes" initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} className="space-y-6">
                        {/* Colors */}
                        <ColorPicker values={form.colors} onChange={v => F('colors', v)} />

                        <div className="border-t border-gray-100" />

                        {/* Sizes */}
                        <SizePicker values={form.available_sizes} onChange={v => F('available_sizes', v)} />

                        <div className="border-t border-gray-100" />

                        {/* Materials */}
                        <TagInput label="Materials" values={form.materials}
                          onChange={v => F('materials', v)}
                          suggestions={ALL_MATERIALS}
                          placeholder="Type material and press Enter…" />

                        {/* Tags */}
                        <TagInput label="Tags" values={form.tags}
                          onChange={v => F('tags', v)}
                          placeholder="e.g. summer, floral, party…" />
                      </motion.div>
                    )}

                    {/* ── MEDIA ── */}
                    {tab === 'media' && (
                      <motion.div key="media" initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} className="space-y-4">
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center hover:border-gray-400 transition-colors cursor-pointer group">
                          <Upload size={28} className="mx-auto text-gray-300 group-hover:text-gray-500 mb-3 transition-colors" />
                          <p className="text-[13px] font-semibold text-gray-400 group-hover:text-gray-600">Click to upload product images</p>
                          <p className="text-[11px] text-gray-300 mt-1">PNG, JPG, WEBP · Up to 10MB each · Uploads to Supabase Storage</p>
                        </div>

                        {/* Image URL inputs */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Image URLs</label>
                          <div className="space-y-2">
                            {[...form.image_urls, ''].map((url, i) => (
                              <div key={i} className="flex gap-2">
                                <input value={url}
                                  onChange={e => {
                                    const urls = [...form.image_urls]
                                    if (i < urls.length) urls[i] = e.target.value
                                    else urls.push(e.target.value)
                                    F('image_urls', urls.filter((u, idx) => u || idx < urls.length - 1))
                                  }}
                                  placeholder={`Image URL ${i + 1}${i === 0 ? ' (thumbnail)' : ''}`}
                                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-600 focus:outline-none focus:border-gray-400 font-mono" />
                                {url && (
                                  <button onClick={() => F('image_urls', form.image_urls.filter((_, j) => j !== i))}
                                    className="p-2 text-gray-300 hover:text-red-400 transition-colors">
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Modal footer */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                  <div className="text-[11px] text-gray-400">
                    {form.colors.length > 0 && `${form.colors.length} colors`}
                    {form.available_sizes.length > 0 && ` · ${form.available_sizes.length} sizes`}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={closeForm}
                      className="px-5 py-2.5 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-500 hover:bg-gray-100 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSave}
                      className="px-6 py-2.5 text-[12px] font-bold tracking-widest uppercase text-white transition-opacity hover:opacity-90"
                      style={{ background: '#C2185B' }}>
                      {form.id ? 'Save Changes' : 'Create Product'}
                    </button>
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
