'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, Palette, Ruler, Package2 } from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────────────────── */
type AttrType = 'color' | 'size' | 'unit'

interface ColorAttr {
  id: string
  name: string
  hex: string
}

interface SizeAttr {
  id: string
  name: string
  order: number
}

interface UnitAttr {
  id: string
  name: string
  abbr: string
}

/* ─── Seed data ─────────────────────────────────────────────────────────── */
const SEED_COLORS: ColorAttr[] = [
  { id: 'c1',  name: 'Red',         hex: '#EF4444' },
  { id: 'c2',  name: 'Rose',        hex: '#F43F5E' },
  { id: 'c3',  name: 'Pink',        hex: '#EC4899' },
  { id: 'c4',  name: 'Fuchsia',     hex: '#D946EF' },
  { id: 'c5',  name: 'Purple',      hex: '#A855F7' },
  { id: 'c6',  name: 'Blue',        hex: '#3B82F6' },
  { id: 'c7',  name: 'Sky',         hex: '#0EA5E9' },
  { id: 'c8',  name: 'Teal',        hex: '#14B8A6' },
  { id: 'c9',  name: 'Green',       hex: '#22C55E' },
  { id: 'c10', name: 'Yellow',      hex: '#EAB308' },
  { id: 'c11', name: 'Orange',      hex: '#F97316' },
  { id: 'c12', name: 'Brown',       hex: '#92400E' },
  { id: 'c13', name: 'White',       hex: '#F9FAFB' },
  { id: 'c14', name: 'Black',       hex: '#111827' },
  { id: 'c15', name: 'Gray',        hex: '#6B7280' },
  { id: 'c16', name: 'Off White',   hex: '#FAF7F0' },
  { id: 'c17', name: 'Cream',       hex: '#FFFDD0' },
  { id: 'c18', name: 'Navy',        hex: '#1E3A5F' },
  { id: 'c19', name: 'Maroon',      hex: '#800000' },
  { id: 'c20', name: 'Gold',        hex: '#D4AF37' },
]

const SEED_SIZES: SizeAttr[] = [
  { id: 's1', name: 'XS',   order: 1 },
  { id: 's2', name: 'S',    order: 2 },
  { id: 's3', name: 'M',    order: 3 },
  { id: 's4', name: 'L',    order: 4 },
  { id: 's5', name: 'XL',   order: 5 },
  { id: 's6', name: 'XXL',  order: 6 },
  { id: 's7', name: 'XXXL', order: 7 },
  { id: 's8', name: '32',   order: 8 },
  { id: 's9', name: '34',   order: 9 },
  { id: 's10', name: '36',  order: 10 },
  { id: 's11', name: '38',  order: 11 },
  { id: 's12', name: '40',  order: 12 },
  { id: 's13', name: '42',  order: 13 },
  { id: 's14', name: 'Free Size', order: 14 },
]

const SEED_UNITS: UnitAttr[] = [
  { id: 'u1', name: 'Piece',   abbr: 'pcs' },
  { id: 'u2', name: 'Meter',   abbr: 'm' },
  { id: 'u3', name: 'Yard',    abbr: 'yd' },
  { id: 'u4', name: 'Kilogram', abbr: 'kg' },
  { id: 'u5', name: 'Gram',    abbr: 'g' },
  { id: 'u6', name: 'Set',     abbr: 'set' },
  { id: 'u7', name: 'Dozen',   abbr: 'dz' },
  { id: 'u8', name: 'Box',     abbr: 'box' },
]

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 9)

const BRAND = '#C2185B'

const TABS: { key: AttrType; label: string; icon: React.ElementType }[] = [
  { key: 'color', label: 'Colors',  icon: Palette },
  { key: 'size',  label: 'Sizes',   icon: Ruler },
  { key: 'unit',  label: 'Units',   icon: Package2 },
]

/* ─── Inline edit cell ──────────────────────────────────────────────────── */
function EditCell({ value, onSave, className = '' }: {
  value: string
  onSave: (v: string) => void
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  if (editing) return (
    <span className="flex items-center gap-1">
      <input autoFocus value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { onSave(val); setEditing(false) } if (e.key === 'Escape') { setVal(value); setEditing(false) } }}
        className="border border-pink-300 rounded px-1.5 py-0.5 text-[13px] w-28 focus:outline-none focus:ring-1 focus:ring-pink-400" />
      <button onClick={() => { onSave(val); setEditing(false) }}
        className="p-0.5 rounded hover:bg-green-100 text-green-600"><Check size={13} /></button>
      <button onClick={() => { setVal(value); setEditing(false) }}
        className="p-0.5 rounded hover:bg-red-100 text-red-500"><X size={13} /></button>
    </span>
  )
  return (
    <span className={`cursor-pointer hover:underline decoration-dashed underline-offset-2 ${className}`}
      onClick={() => setEditing(true)}>{value}</span>
  )
}

/* ─── Color hex swatch + edit ────────────────────────────────────────────── */
function HexCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  return (
    <span className="flex items-center gap-2">
      <span className="w-5 h-5 rounded-full border border-gray-200 shrink-0 cursor-pointer"
        style={{ background: value }} onClick={() => setEditing(v => !v)} />
      {editing ? (
        <span className="flex items-center gap-1">
          <input type="color" value={val} onChange={e => setVal(e.target.value)}
            className="w-8 h-7 cursor-pointer rounded border-0 p-0" />
          <input value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { onSave(val); setEditing(false) } }}
            className="border border-pink-300 rounded px-1.5 py-0.5 text-[12px] w-20 font-mono focus:outline-none focus:ring-1 focus:ring-pink-400" />
          <button onClick={() => { onSave(val); setEditing(false) }}
            className="p-0.5 rounded hover:bg-green-100 text-green-600"><Check size={13} /></button>
          <button onClick={() => { setVal(value); setEditing(false) }}
            className="p-0.5 rounded hover:bg-red-100 text-red-500"><X size={13} /></button>
        </span>
      ) : (
        <span className="text-[12px] font-mono text-gray-400 cursor-pointer hover:text-gray-600"
          onClick={() => setEditing(true)}>{value}</span>
      )}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function AttributesPage() {
  const [tab, setTab] = useState<AttrType>('color')

  /* colors */
  const [colors, setColors] = useState<ColorAttr[]>(SEED_COLORS)
  const [newColor, setNewColor] = useState({ name: '', hex: '#C2185B' })

  /* sizes */
  const [sizes, setSizes] = useState<SizeAttr[]>(SEED_SIZES)
  const [newSize, setNewSize] = useState('')

  /* units */
  const [units, setUnits] = useState<UnitAttr[]>(SEED_UNITS)
  const [newUnit, setNewUnit] = useState({ name: '', abbr: '' })

  /* ── Color actions ──────────────────────────────────────────────────── */
  function addColor() {
    if (!newColor.name.trim()) return
    setColors(p => [...p, { id: uid(), name: newColor.name.trim(), hex: newColor.hex }])
    setNewColor({ name: '', hex: '#C2185B' })
  }
  function updateColorName(id: string, name: string) {
    setColors(p => p.map(c => c.id === id ? { ...c, name } : c))
  }
  function updateColorHex(id: string, hex: string) {
    setColors(p => p.map(c => c.id === id ? { ...c, hex } : c))
  }
  function deleteColor(id: string) {
    setColors(p => p.filter(c => c.id !== id))
  }

  /* ── Size actions ───────────────────────────────────────────────────── */
  function addSize() {
    if (!newSize.trim()) return
    setSizes(p => [...p, { id: uid(), name: newSize.trim(), order: p.length + 1 }])
    setNewSize('')
  }
  function updateSizeName(id: string, name: string) {
    setSizes(p => p.map(s => s.id === id ? { ...s, name } : s))
  }
  function deleteSize(id: string) {
    setSizes(p => p.filter(s => s.id !== id))
  }

  /* ── Unit actions ───────────────────────────────────────────────────── */
  function addUnit() {
    if (!newUnit.name.trim() || !newUnit.abbr.trim()) return
    setUnits(p => [...p, { id: uid(), name: newUnit.name.trim(), abbr: newUnit.abbr.trim() }])
    setNewUnit({ name: '', abbr: '' })
  }
  function updateUnitName(id: string, name: string) {
    setUnits(p => p.map(u => u.id === id ? { ...u, name } : u))
  }
  function updateUnitAbbr(id: string, abbr: string) {
    setUnits(p => p.map(u => u.id === id ? { ...u, abbr } : u))
  }
  function deleteUnit(id: string) {
    setUnits(p => p.filter(u => u.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Attributes</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Manage colors, sizes, and units used in products</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              tab === key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Colors tab ─────────────────────────────────────────────────── */}
      {tab === 'color' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Add row */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
            <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-16 shrink-0">Add New</span>
            <div className="flex items-center gap-2 flex-1">
              <input type="color" value={newColor.hex} onChange={e => setNewColor(p => ({ ...p, hex: e.target.value }))}
                className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 shrink-0" />
              <input value={newColor.name} onChange={e => setNewColor(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addColor()}
                placeholder="Color name (e.g. Dusty Rose)"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300" />
              <input value={newColor.hex} onChange={e => setNewColor(p => ({ ...p, hex: e.target.value }))}
                placeholder="#HEX"
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-pink-300" />
              <button onClick={addColor}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium transition-colors"
                style={{ background: BRAND }}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Color grid */}
          <div className="divide-y divide-gray-50">
            {colors.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/60 group">
                <HexCell value={c.hex} onSave={hex => updateColorHex(c.id, hex)} />
                <EditCell value={c.name} onSave={name => updateColorName(c.id, name)}
                  className="text-[13px] font-medium text-gray-800 flex-1" />
                <button onClick={() => deleteColor(c.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 bg-gray-50 text-[11px] text-gray-400 border-t border-gray-100">
            {colors.length} colors &mdash; click name or swatch to edit inline
          </div>
        </div>
      )}

      {/* ── Sizes tab ──────────────────────────────────────────────────── */}
      {tab === 'size' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Add row */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
            <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-16 shrink-0">Add New</span>
            <div className="flex items-center gap-2 flex-1">
              <input value={newSize} onChange={e => setNewSize(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSize()}
                placeholder="Size label (e.g. 44, 4XL, 26W)"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300" />
              <button onClick={addSize}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium"
                style={{ background: BRAND }}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Size list */}
          <div className="divide-y divide-gray-50">
            {sizes.map((s, i) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/60 group">
                <span className="text-[11px] text-gray-300 w-6 text-right shrink-0">{i + 1}</span>
                <div className="w-16 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[13px] font-semibold text-gray-700 bg-gray-50 shrink-0">
                  {s.name}
                </div>
                <EditCell value={s.name} onSave={name => updateSizeName(s.id, name)}
                  className="text-[13px] text-gray-600 flex-1" />
                <button onClick={() => deleteSize(s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 bg-gray-50 text-[11px] text-gray-400 border-t border-gray-100">
            {sizes.length} sizes &mdash; click label to edit inline
          </div>
        </div>
      )}

      {/* ── Units tab ──────────────────────────────────────────────────── */}
      {tab === 'unit' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Add row */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
            <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide w-16 shrink-0">Add New</span>
            <div className="flex items-center gap-2 flex-1">
              <input value={newUnit.name} onChange={e => setNewUnit(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addUnit()}
                placeholder="Unit name (e.g. Bundle)"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300" />
              <input value={newUnit.abbr} onChange={e => setNewUnit(p => ({ ...p, abbr: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addUnit()}
                placeholder="Abbr (e.g. bdl)"
                className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300" />
              <button onClick={addUnit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium"
                style={{ background: BRAND }}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_48px] gap-4 px-5 py-2 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            <span>Name</span>
            <span>Abbreviation</span>
            <span></span>
          </div>

          {/* Unit list */}
          <div className="divide-y divide-gray-50">
            {units.map(u => (
              <div key={u.id} className="grid grid-cols-[1fr_120px_48px] gap-4 items-center px-5 py-3 hover:bg-gray-50/60 group">
                <EditCell value={u.name} onSave={name => updateUnitName(u.id, name)}
                  className="text-[13px] font-medium text-gray-800" />
                <EditCell value={u.abbr} onSave={abbr => updateUnitAbbr(u.id, abbr)}
                  className="text-[13px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit" />
                <button onClick={() => deleteUnit(u.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 bg-gray-50 text-[11px] text-gray-400 border-t border-gray-100">
            {units.length} units &mdash; click to edit inline
          </div>
        </div>
      )}
    </div>
  )
}
