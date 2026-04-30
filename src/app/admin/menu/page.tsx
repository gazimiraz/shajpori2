'use client'
import { useState } from 'react'
import {
  Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
  Pencil, Check, X, GripVertical, Layers, ExternalLink,
  LayoutGrid, AlignLeft, Sparkles, Tag,
} from 'lucide-react'
import { useMenuStore, NavItem, MegaCol, MenuLink, MegaPromo, uid } from '@/lib/menuStore'
import toast from 'react-hot-toast'

const BRAND = '#C2185B'

const PROMO_PRESETS = [
  { color: '#FFF0F4', accent: '#C2185B' },
  { color: '#EEF4FF', accent: '#1565C0' },
  { color: '#FFFBEA', accent: '#B8860B' },
  { color: '#F0FDF4', accent: '#166534' },
  { color: '#FDF4FF', accent: '#7C3AED' },
  { color: '#FFF7ED', accent: '#EA580C' },
]

/* ─── Inline text edit ───────────────────────────────────────────────────── */
function InlineEdit({ value, onSave, placeholder = 'Edit…', className = '' }: {
  value: string; onSave: (v: string) => void; placeholder?: string; className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  if (editing) return (
    <span className="inline-flex items-center gap-1">
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
        onKeyDown={e => {
          if (e.key === 'Enter') { onSave(val); setEditing(false) }
          if (e.key === 'Escape') { setVal(value); setEditing(false) }
        }}
        className="border border-pink-300 rounded px-2 py-0.5 text-[12px] min-w-0 w-40 focus:outline-none focus:ring-1 focus:ring-pink-400" />
      <button onClick={() => { onSave(val); setEditing(false) }}
        className="p-0.5 text-green-600 hover:bg-green-50 rounded"><Check size={12} /></button>
      <button onClick={() => { setVal(value); setEditing(false) }}
        className="p-0.5 text-gray-400 hover:bg-gray-100 rounded"><X size={12} /></button>
    </span>
  )
  return (
    <span className={`cursor-pointer hover:underline decoration-dashed underline-offset-2 ${className}`}
      onClick={() => setEditing(true)}>{value || <span className="text-gray-300 italic">{placeholder}</span>}</span>
  )
}

/* ─── Link row ───────────────────────────────────────────────────────────── */
function LinkRow({ link, onUpdate, onDelete }: {
  link: MenuLink
  onUpdate: (l: MenuLink) => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-2 group py-1 px-2 rounded-lg hover:bg-gray-50">
      <GripVertical size={12} className="text-gray-300 shrink-0" />
      <InlineEdit value={link.label} placeholder="Link label"
        onSave={v => onUpdate({ ...link, label: v })}
        className="text-[12px] text-gray-700 font-medium flex-1" />
      <span className="text-gray-300 text-[11px]">→</span>
      <InlineEdit value={link.href} placeholder="/products?…"
        onSave={v => onUpdate({ ...link, href: v })}
        className="text-[11px] text-gray-400 font-mono flex-1 truncate" />
      <button onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all shrink-0">
        <Trash2 size={11} />
      </button>
    </div>
  )
}

/* ─── Column editor ──────────────────────────────────────────────────────── */
function ColEditor({ col, onUpdate, onDelete }: {
  col: MegaCol
  onUpdate: (c: MegaCol) => void
  onDelete: () => void
}) {
  function addLink() {
    onUpdate({ ...col, links: [...col.links, { id: uid(), label: 'New Link', href: '/products' }] })
  }
  function updateLink(link: MenuLink) {
    onUpdate({ ...col, links: col.links.map(l => l.id === link.id ? link : l) })
  }
  function deleteLink(id: string) {
    onUpdate({ ...col, links: col.links.filter(l => l.id !== id) })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
        <AlignLeft size={12} className="text-gray-400 shrink-0" />
        <InlineEdit value={col.heading} placeholder="Column heading"
          onSave={v => onUpdate({ ...col, heading: v })}
          className="text-[12px] font-bold text-gray-700 flex-1 uppercase tracking-wide" />
        <button onClick={onDelete}
          className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors shrink-0">
          <Trash2 size={11} />
        </button>
      </div>

      {/* Links */}
      <div className="py-1">
        {col.links.map(l => (
          <LinkRow key={l.id} link={l} onUpdate={updateLink} onDelete={() => deleteLink(l.id)} />
        ))}
        <button onClick={addLink}
          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-pink-600 hover:bg-pink-50 transition-colors">
          <Plus size={11} /> Add link
        </button>
      </div>
    </div>
  )
}

/* ─── Promo editor ───────────────────────────────────────────────────────── */
function PromoEditor({ promo, onChange, onRemove }: {
  promo: MegaPromo
  onChange: (p: MegaPromo) => void
  onRemove: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-500" />
          <span className="text-[12px] font-bold text-gray-700">Promo Tile</span>
        </div>
        <button onClick={onRemove} className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500">
          <Trash2 size={11} />
        </button>
      </div>
      <div className="p-3 space-y-3">
        {/* Preview */}
        <div className="rounded-lg px-4 py-3 text-center" style={{ background: promo.color }}>
          <p className="text-[13px] font-bold" style={{ color: promo.accent }}>{promo.label || 'Promo Title'}</p>
          <p className="text-[11px] mt-0.5" style={{ color: promo.accent + 'aa' }}>{promo.tag || 'Subtitle'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Title</p>
            <input value={promo.label} onChange={e => onChange({ ...promo, label: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-pink-300" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Subtitle</p>
            <input value={promo.tag} onChange={e => onChange({ ...promo, tag: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-pink-300" />
          </div>
        </div>
        {/* Color presets */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Color Theme</p>
          <div className="flex gap-2 flex-wrap">
            {PROMO_PRESETS.map((p, i) => (
              <button key={i} onClick={() => onChange({ ...promo, color: p.color, accent: p.accent })}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  promo.color === p.color ? 'border-gray-800 scale-110' : 'border-transparent'
                }`}
                style={{ background: p.color, outline: `2px solid ${p.accent}22` }} />
            ))}
          </div>
        </div>
        {/* Custom hex */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">BG Color</p>
            <div className="flex items-center gap-1.5">
              <input type="color" value={promo.color} onChange={e => onChange({ ...promo, color: e.target.value })}
                className="w-7 h-7 rounded border-0 p-0.5 cursor-pointer" />
              <span className="text-[11px] font-mono text-gray-400">{promo.color}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Accent Color</p>
            <div className="flex items-center gap-1.5">
              <input type="color" value={promo.accent} onChange={e => onChange({ ...promo, accent: e.target.value })}
                className="w-7 h-7 rounded border-0 p-0.5 cursor-pointer" />
              <span className="text-[11px] font-mono text-gray-400">{promo.accent}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Nav item editor (expanded) ─────────────────────────────────────────── */
function NavItemEditor({ item, onUpdate }: { item: NavItem; onUpdate: (i: NavItem) => void }) {
  const hasMega = !!item.mega

  function addCol() {
    const newCol: MegaCol = { id: uid(), heading: 'New Column', links: [{ id: uid(), label: 'New Link', href: '/products' }] }
    onUpdate({ ...item, mega: { cols: [...(item.mega?.cols ?? []), newCol], promo: item.mega?.promo ?? null } })
  }

  function updateCol(col: MegaCol) {
    if (!item.mega) return
    onUpdate({ ...item, mega: { ...item.mega, cols: item.mega.cols.map(c => c.id === col.id ? col : c) } })
  }

  function deleteCol(id: string) {
    if (!item.mega) return
    onUpdate({ ...item, mega: { ...item.mega, cols: item.mega.cols.filter(c => c.id !== id) } })
  }

  function addPromo() {
    onUpdate({ ...item, mega: { cols: item.mega?.cols ?? [], promo: { label: 'Featured', tag: 'Shop Now', color: '#FFF0F4', accent: BRAND } } })
  }

  function updatePromo(p: MegaPromo) {
    if (!item.mega) return
    onUpdate({ ...item, mega: { ...item.mega, promo: p } })
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Basic fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Label</p>
          <input value={item.label} onChange={e => onUpdate({ ...item, label: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-200" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Link (href)</p>
          <input value={item.href} onChange={e => onUpdate({ ...item, href: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-pink-200" />
        </div>
      </div>

      {/* Sale toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!item.sale} onChange={e => onUpdate({ ...item, sale: e.target.checked })}
          className="w-3.5 h-3.5 accent-pink-600" />
        <span className="text-[12px] text-gray-600">Mark as "Sale" item (shown in red)</span>
      </label>

      {/* Mega toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <LayoutGrid size={14} className="text-gray-500" />
          <div>
            <p className="text-[13px] font-semibold text-gray-700">Mega Menu Dropdown</p>
            <p className="text-[11px] text-gray-400">Show a dropdown panel with columns and links</p>
          </div>
        </div>
        <button onClick={() => onUpdate({ ...item, mega: hasMega ? null : { cols: [], promo: null } })}
          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${hasMega ? 'bg-[#C2185B]' : 'bg-gray-200'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${hasMega ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {/* Mega editor */}
      {hasMega && (
        <div className="space-y-3 pl-3 border-l-2 border-pink-100">
          {/* Columns */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Columns</p>
            <button onClick={addCol}
              className="flex items-center gap-1 text-[11px] font-medium text-pink-600 hover:underline">
              <Plus size={11} /> Add column
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {item.mega!.cols.map(col => (
              <ColEditor key={col.id} col={col} onUpdate={updateCol} onDelete={() => deleteCol(col.id)} />
            ))}
          </div>

          {/* Promo tile */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Promo Tile</p>
            {!item.mega!.promo && (
              <button onClick={addPromo}
                className="flex items-center gap-1 text-[11px] font-medium text-pink-600 hover:underline">
                <Plus size={11} /> Add promo
              </button>
            )}
          </div>
          {item.mega!.promo && (
            <PromoEditor
              promo={item.mega!.promo}
              onChange={updatePromo}
              onRemove={() => onUpdate({ ...item, mega: { ...item.mega!, promo: null } })}
            />
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function MenuPage() {
  const { items, addItem, updateItem, removeItem, moveItem } = useMenuStore()
  const [expanded, setExpanded] = useState<string | null>(null)

  function addNavItem() {
    const item: NavItem = { id: uid(), label: 'New Item', href: '/products', sale: false, mega: null }
    addItem(item)
    setExpanded(item.id)
  }

  function handleUpdate(item: NavItem) {
    updateItem(item)
  }

  function handleSave() {
    toast.success('Menu saved — changes are live on the storefront')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Navigation Menu</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Build the mega menu shown on your storefront header</p>
        </div>
        <div className="flex gap-3">
          <a href="/" target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-colors">
            <ExternalLink size={13} /> Preview
          </a>
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[13px] font-medium transition-colors"
            style={{ background: BRAND }}>
            <Check size={14} /> Save Changes
          </button>
        </div>
      </div>

      {/* Info strip */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <Layers size={15} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-[12px] text-blue-700 leading-relaxed">
          Changes save to your browser and go live on the storefront immediately.
          Click any item to expand and edit its label, link, mega menu columns, and promo tile.
          Use the arrows to reorder items.
        </p>
      </div>

      {/* Nav items list */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item.id} className={`bg-white rounded-2xl border transition-all ${
            expanded === item.id ? 'border-pink-200 shadow-sm' : 'border-gray-200'
          }`}>
            {/* Row */}
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Order arrows */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => moveItem(item.id, 'up')} disabled={idx === 0}
                  className="p-0.5 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-all">
                  <ChevronUp size={13} />
                </button>
                <button onClick={() => moveItem(item.id, 'down')} disabled={idx === items.length - 1}
                  className="p-0.5 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-all">
                  <ChevronDown size={13} />
                </button>
              </div>

              {/* Index */}
              <span className="text-[11px] text-gray-300 w-4 text-center shrink-0">{idx + 1}</span>

              {/* Label + href */}
              <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="flex-1 flex items-center gap-3 text-left min-w-0">
                <span className={`text-[14px] font-bold truncate ${item.sale ? 'text-red-500' : 'text-gray-800'}`}>
                  {item.label}
                </span>
                {item.sale && (
                  <span className="text-[10px] font-semibold bg-red-100 text-red-500 px-1.5 py-0.5 rounded shrink-0">SALE</span>
                )}
                {item.mega && (
                  <span className="text-[10px] font-semibold bg-pink-50 text-pink-500 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1">
                    <LayoutGrid size={9} /> Mega
                  </span>
                )}
                <span className="text-[11px] font-mono text-gray-400 truncate">{item.href}</span>
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => { removeItem(item.id); if (expanded === item.id) setExpanded(null) }}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
                <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className={`p-1.5 rounded-lg text-gray-400 transition-all ${expanded === item.id ? 'bg-pink-50 text-pink-500 rotate-90' : 'hover:bg-gray-100'}`}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Expanded editor */}
            {expanded === item.id && (
              <div className="px-5 pb-5 border-t border-gray-100">
                <NavItemEditor item={item} onUpdate={handleUpdate} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add item */}
      <button onClick={addNavItem}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-[13px] font-medium text-gray-400 hover:border-pink-300 hover:text-pink-500 transition-colors">
        <Plus size={15} /> Add menu item
      </button>

      {/* Mega menu preview legend */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">How it looks on the storefront</p>
        <div className="flex gap-6 text-[12px] text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> Plain link — no dropdown</span>
          <span className="flex items-center gap-1.5"><LayoutGrid size={11} className="text-pink-500" /> Mega menu — shows dropdown panel</span>
          <span className="flex items-center gap-1.5"><Tag size={11} className="text-red-500" /> Sale — shown in red text</span>
          <span className="flex items-center gap-1.5"><Sparkles size={11} className="text-amber-500" /> Promo tile — coloured card in dropdown</span>
        </div>
      </div>
    </div>
  )
}
