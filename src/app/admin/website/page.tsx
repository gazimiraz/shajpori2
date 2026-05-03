'use client'
import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Megaphone, Layout, ImageIcon, Layers, AlignLeft, Save,
  Plus, Trash2, GripVertical, Eye, EyeOff, ChevronDown, ChevronUp,
  Facebook, Instagram, Youtube, Phone, Globe
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useWebsiteStore, type HeroSlide, type FooterColumn
} from '@/lib/websiteStore'

const BRAND = '#D81B60'

/* ── Shared widgets ─────────────────────────────────────────────────────── */
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white transition-colors ${props.className ?? ''}`} />
  )
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-500 mb-1.5">{children}</label>
}
function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <button type="button" onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 mt-0.5 ${checked ? 'bg-[#D81B60]' : 'bg-gray-200'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}
function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-end pt-5 mt-2 border-t border-gray-100">
      <button onClick={onSave}
        className="flex items-center gap-2 text-white rounded-lg px-6 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
        style={{ background: BRAND }}>
        <Save size={14} /> Save Changes
      </button>
    </div>
  )
}

/* ── Tabs ───────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'announcement', label: 'Announcement Bar', icon: Megaphone },
  { id: 'header',       label: 'Header',           icon: Layout    },
  { id: 'slider',       label: 'Hero Slider',      icon: ImageIcon },
  { id: 'blocks',       label: 'Content Blocks',   icon: Layers    },
  { id: 'footer',       label: 'Footer',           icon: AlignLeft },
]

/* ════════════════════════════════════════════════════════════════════════ */
export default function WebsitePage() {
  const [tab, setTab] = useState('announcement')
  const store = useWebsiteStore()

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Page header */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4">
        <h1 className="text-[16px] font-black text-gray-900">Website Settings</h1>
        <p className="text-[12px] text-gray-400 mt-0.5">Customise your storefront — announcement bar, header, hero slider, page blocks and footer.</p>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
              tab === id ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`}
            style={tab === id ? { background: BRAND } : {}}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}>

          {/* ── ANNOUNCEMENT BAR ── */}
          {tab === 'announcement' && <AnnouncementTab />}
          {tab === 'header'       && <HeaderTab />}
          {tab === 'slider'       && <SliderTab />}
          {tab === 'blocks'       && <BlocksTab />}
          {tab === 'footer'       && <FooterTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   ANNOUNCEMENT BAR TAB
══════════════════════════════════════════════════════════════════ */
function AnnouncementTab() {
  const { announcement, setAnnouncement } = useWebsiteStore()
  const [form, setForm] = useState({ ...announcement })

  function save() { setAnnouncement(form); toast.success('Announcement bar saved') }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      {/* Live preview */}
      {form.enabled && (
        <div className="rounded-xl px-4 py-2.5 text-center text-sm font-medium transition-all"
          style={{ background: form.bgColor, color: form.textColor }}>
          {form.text || 'Your announcement text here…'}
        </div>
      )}

      <Toggle checked={form.enabled} onChange={() => setForm(f => ({ ...f, enabled: !f.enabled }))}
        label="Show Announcement Bar" hint="Displays a top banner on every storefront page" />

      <div>
        <Label>Announcement Text</Label>
        <textarea value={form.text} rows={2}
          onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Background Colour</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
            <Input value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))} className="font-mono" />
          </div>
        </div>
        <div>
          <Label>Text Colour</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={form.textColor} onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
            <Input value={form.textColor} onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))} className="font-mono" />
          </div>
        </div>
      </div>

      <div>
        <Label>Link URL (optional)</Label>
        <Input value={form.link} placeholder="https://…" onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
      </div>

      <Toggle checked={form.dismissible} onChange={() => setForm(f => ({ ...f, dismissible: !f.dismissible }))}
        label="Dismissible" hint="Allow visitors to close the bar" />

      <SaveBar onSave={save} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   HEADER TAB
══════════════════════════════════════════════════════════════════ */
function HeaderTab() {
  const { header, setHeader } = useWebsiteStore()
  const [form, setForm] = useState({ ...header })

  function save() { setHeader(form); toast.success('Header settings saved') }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Header Background</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
            <Input value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))} className="font-mono" />
          </div>
        </div>
        <div>
          <Label>Text / Icon Colour</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={form.textColor} onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
            <Input value={form.textColor} onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))} className="font-mono" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-4">
        <Toggle checked={form.sticky} onChange={() => setForm(f => ({ ...f, sticky: !f.sticky }))}
          label="Sticky Header" hint="Header stays visible when scrolling down" />
        <Toggle checked={form.showSearch} onChange={() => setForm(f => ({ ...f, showSearch: !f.showSearch }))}
          label="Show Search Icon" hint="Display search button in the header" />
        <Toggle checked={form.showCart} onChange={() => setForm(f => ({ ...f, showCart: !f.showCart }))}
          label="Show Cart Icon" hint="Display cart button with item count" />
      </div>

      {/* Live preview strip */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 text-sm font-semibold"
          style={{ background: form.bgColor, color: form.textColor }}>
          <span className="font-black text-base">Shajpori</span>
          <div className="flex items-center gap-3 text-xs">
            <span>Shop</span><span>Bags</span><span>Jewelry</span>
            {form.showSearch && <span>🔍</span>}
            {form.showCart && <span>🛒</span>}
          </div>
        </div>
        {form.sticky && <div className="text-[10px] text-center text-gray-400 py-1 bg-gray-50">Sticky — header stays on scroll</div>}
      </div>

      <SaveBar onSave={save} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   HERO SLIDER TAB
══════════════════════════════════════════════════════════════════ */
function SliderTab() {
  const { slides, setSlides, addSlide, updateSlide, deleteSlide } = useWebsiteStore()
  const [expanded, setExpanded] = useState<string | null>(null)

  function newSlide() {
    const id = `s${Date.now()}`
    addSlide({ id, title: 'New Slide', subtitle: '', buttonText: 'Shop Now', buttonLink: '/products', image: '', overlayColor: '#000000', overlayOpacity: 40, align: 'center' })
    setExpanded(id)
    toast.success('Slide added')
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-bold text-gray-900">Hero Slides</p>
          <p className="text-[12px] text-gray-400">{slides.length} slide{slides.length !== 1 ? 's' : ''} — drag to reorder</p>
        </div>
        <button onClick={newSlide}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:opacity-90"
          style={{ background: BRAND }}>
          <Plus size={14} /> Add Slide
        </button>
      </div>

      <Reorder.Group axis="y" values={slides} onReorder={setSlides} className="space-y-2">
        {slides.map((slide) => (
          <Reorder.Item key={slide.id} value={slide}>
            <SlideCard slide={slide} expanded={expanded === slide.id}
              onToggle={() => setExpanded(expanded === slide.id ? null : slide.id)}
              onUpdate={(s) => updateSlide(slide.id, s)}
              onDelete={() => { deleteSlide(slide.id); if (expanded === slide.id) setExpanded(null) }} />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  )
}

function SlideCard({ slide, expanded, onToggle, onUpdate, onDelete }: {
  slide: HeroSlide; expanded: boolean
  onToggle: () => void; onUpdate: (s: Partial<HeroSlide>) => void; onDelete: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Slide header row */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={onToggle}>
        <GripVertical size={16} className="text-gray-300 shrink-0 cursor-grab" />
        {/* Mini preview */}
        <div className="w-16 h-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center overflow-hidden relative"
          style={{ background: slide.image ? undefined : '#F3F4F6' }}>
          {slide.image
            ? <img src={slide.image} alt="" className="w-full h-full object-cover" />
            : <ImageIcon size={14} className="text-gray-300" />}
          <div className="absolute inset-0 rounded-lg" style={{ background: slide.overlayColor, opacity: slide.overlayOpacity / 100 }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-gray-800 truncate">{slide.title || 'Untitled Slide'}</p>
          <p className="text-[11px] text-gray-400 truncate">{slide.buttonText} → {slide.buttonLink}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Slide editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-gray-100">
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Title</Label><Input value={slide.title} onChange={e => onUpdate({ title: e.target.value })} /></div>
                <div><Label>Subtitle</Label><Input value={slide.subtitle} onChange={e => onUpdate({ subtitle: e.target.value })} /></div>
                <div><Label>Button Text</Label><Input value={slide.buttonText} onChange={e => onUpdate({ buttonText: e.target.value })} /></div>
                <div><Label>Button Link</Label><Input value={slide.buttonLink} onChange={e => onUpdate({ buttonLink: e.target.value })} /></div>
              </div>
              <div><Label>Image URL</Label><Input value={slide.image} placeholder="https://…" onChange={e => onUpdate({ image: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Overlay Colour</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={slide.overlayColor} onChange={e => onUpdate({ overlayColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
                    <Input value={slide.overlayColor} onChange={e => onUpdate({ overlayColor: e.target.value })} className="font-mono text-xs" />
                  </div>
                </div>
                <div>
                  <Label>Overlay Opacity (%)</Label>
                  <Input type="number" min={0} max={100} value={slide.overlayOpacity}
                    onChange={e => onUpdate({ overlayOpacity: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Text Align</Label>
                  <select value={slide.align} onChange={e => onUpdate({ align: e.target.value as HeroSlide['align'] })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
              <button onClick={() => toast.success('Slide saved')}
                className="flex items-center gap-2 text-white px-5 py-2 rounded-xl text-[13px] font-bold hover:opacity-90"
                style={{ background: BRAND }}>
                <Save size={13} /> Save Slide
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CONTENT BLOCKS TAB
══════════════════════════════════════════════════════════════════ */
const BLOCK_ICONS: Record<string, string> = {
  featured_products: '⭐', categories: '🗂️', banner: '🖼️',
  testimonials: '💬', newsletter: '📧', brands: '🏷️',
}

function BlocksTab() {
  const { blocks, setBlocks, toggleBlock } = useWebsiteStore()

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-[14px] font-bold text-gray-900">Homepage Sections</p>
        <p className="text-[12px] text-gray-400 mt-0.5">Toggle sections on or off. Drag to reorder (order updates your storefront layout).</p>
      </div>

      <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="space-y-2">
        {blocks.map((block) => (
          <Reorder.Item key={block.id} value={block}>
            <div className="bg-white rounded-2xl border border-gray-100 flex items-center gap-4 px-4 py-3.5">
              <GripVertical size={16} className="text-gray-300 cursor-grab shrink-0" />
              <span className="text-xl shrink-0">{BLOCK_ICONS[block.type]}</span>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-gray-800">{block.label}</p>
                <p className="text-[11px] text-gray-400">{block.type.replace(/_/g, ' ')}</p>
              </div>
              <button onClick={() => toggleBlock(block.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all border ${
                  block.enabled
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}>
                {block.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                {block.enabled ? 'Visible' : 'Hidden'}
              </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <div className="flex justify-end">
        <button onClick={() => toast.success('Block order saved')}
          className="flex items-center gap-2 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90"
          style={{ background: BRAND }}>
          <Save size={14} /> Save Layout
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   FOOTER TAB
══════════════════════════════════════════════════════════════════ */
function FooterTab() {
  const { footer, setFooter } = useWebsiteStore()
  const [form, setForm] = useState({ ...footer })
  const [cols, setCols] = useState<FooterColumn[]>(footer.columns.map(c => ({ ...c, links: [...c.links] })))

  function save() {
    setFooter({ ...form, columns: cols })
    toast.success('Footer saved')
  }

  function addLink(colId: string) {
    setCols(cs => cs.map(c => c.id === colId ? { ...c, links: [...c.links, { label: '', href: '' }] } : c))
  }
  function updateLink(colId: string, idx: number, field: 'label' | 'href', val: string) {
    setCols(cs => cs.map(c => c.id === colId ? { ...c, links: c.links.map((l, i) => i === idx ? { ...l, [field]: val } : l) } : c))
  }
  function removeLink(colId: string, idx: number) {
    setCols(cs => cs.map(c => c.id === colId ? { ...c, links: c.links.filter((_, i) => i !== idx) } : c))
  }
  function updateColHeading(colId: string, heading: string) {
    setCols(cs => cs.map(c => c.id === colId ? { ...c, heading } : c))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      {/* Tagline & copyright */}
      <div className="grid grid-cols-1 gap-4">
        <div><Label>Tagline</Label><Input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} /></div>
        <div><Label>Copyright Text</Label><Input value={form.copyright} onChange={e => setForm(f => ({ ...f, copyright: e.target.value }))} /></div>
      </div>

      {/* Social links */}
      <div className="border-t border-gray-100 pt-5">
        <Toggle checked={form.showSocials} onChange={() => setForm(f => ({ ...f, showSocials: !f.showSocials }))}
          label="Show Social Links" hint="Display social icons in the footer" />
        {form.showSocials && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Facebook URL</Label>
              <div className="flex items-center gap-2">
                <Facebook size={16} className="text-gray-400 shrink-0" />
                <Input value={form.facebookUrl} placeholder="https://facebook.com/…" onChange={e => setForm(f => ({ ...f, facebookUrl: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Instagram URL</Label>
              <div className="flex items-center gap-2">
                <Instagram size={16} className="text-gray-400 shrink-0" />
                <Input value={form.instagramUrl} placeholder="https://instagram.com/…" onChange={e => setForm(f => ({ ...f, instagramUrl: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <Input value={form.whatsapp} placeholder="8801XXXXXXXXX" onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>YouTube URL</Label>
              <div className="flex items-center gap-2">
                <Youtube size={16} className="text-gray-400 shrink-0" />
                <Input value={form.youtubeUrl} placeholder="https://youtube.com/…" onChange={e => setForm(f => ({ ...f, youtubeUrl: e.target.value }))} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer columns */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-[13px] font-bold text-gray-800 mb-4">Footer Link Columns</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cols.map(col => (
            <div key={col.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <Label>Column Heading</Label>
                <Input value={col.heading} onChange={e => updateColHeading(col.id, e.target.value)} />
              </div>
              <div className="space-y-2">
                {col.links.map((link, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-1 space-y-1">
                      <Input value={link.label} placeholder="Label" onChange={e => updateLink(col.id, idx, 'label', e.target.value)} />
                      <Input value={link.href} placeholder="/path or https://…" onChange={e => updateLink(col.id, idx, 'href', e.target.value)} />
                    </div>
                    <button onClick={() => removeLink(col.id, idx)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => addLink(col.id)}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                <Plus size={13} /> Add link
              </button>
            </div>
          ))}
        </div>
      </div>

      <SaveBar onSave={save} />
    </div>
  )
}
