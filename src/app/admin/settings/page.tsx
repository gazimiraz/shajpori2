'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save, Store, Truck, CreditCard, Bell, Shield, Upload, ImageIcon,
  Printer, Globe2, X, Smile, ChevronLeft, Megaphone,
  UserCog, ShieldCheck, Globe, FileText, Tag, Palette, Navigation, Barcode,
  type LucideIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettingsStore } from '@/store/settingsStore'

/* ─── Shared form widgets ────────────────────────────────────────────────── */
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white transition-colors ${props.className ?? ''}`} />
  )
}
function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select {...props}
      className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white transition-colors ${(props as { className?: string }).className ?? ''}`}>
      {children}
    </select>
  )
}
function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <button type="button" onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 mt-0.5 ${checked ? 'bg-[#C2185B]' : 'bg-gray-200'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-500 mb-1.5">{children}</label>
}
function SaveBar({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div className="flex justify-end pt-5 mt-2 border-t border-gray-100">
      <motion.button onClick={onSave} whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 bg-[#C2185B] text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-[#A0144D] transition-colors">
        <Save size={14} />{saved ? 'Saved!' : 'Save Changes'}
      </motion.button>
    </div>
  )
}

/* ─── Card grid definition ───────────────────────────────────────────────── */
type SectionKey =
  | 'store' | 'branding' | 'announcement'
  | 'shipping' | 'payment' | 'invoice'
  | 'notifications' | 'seo' | 'security'
  | 'roles' | 'team'

interface CardDef {
  key: SectionKey
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  desc: string
  external?: string
}

const CARDS: CardDef[] = [
  { key:'store',        icon:Store,        iconBg:'#FFF0F5', iconColor:'#C2185B', title:'Shop Settings',      desc:'Store name, contact, address, currency and basic info.' },
  { key:'branding',     icon:Palette,      iconBg:'#F3E8FF', iconColor:'#7C3AED', title:'Logo & Favicon',     desc:'Upload your store logo and browser tab favicon.' },
  { key:'announcement', icon:Megaphone,    iconBg:'#FFF7ED', iconColor:'#EA580C', title:'Announcement Bar',   desc:'Manage the top-bar announcement message on your storefront.' },
  { key:'shipping',     icon:Truck,        iconBg:'#ECFDF5', iconColor:'#059669', title:'Shipping & Delivery',desc:'Set delivery rates, free shipping threshold, and estimated days.' },
  { key:'payment',      icon:CreditCard,   iconBg:'#EFF6FF', iconColor:'#2563EB', title:'Payment Gateway',    desc:'Configure bKash, Nagad, Rocket, COD and SSLCommerz.' },
  { key:'invoice',      icon:FileText,     iconBg:'#F8FAFC', iconColor:'#475569', title:'Invoice & Printing', desc:'Choose invoice type (A4 / Thermal) and auto-print settings.' },
  { key:'notifications',icon:Bell,         iconBg:'#FEFCE8', iconColor:'#CA8A04', title:'Notifications',      desc:'Email and SMS alerts for orders, stock, and customers.' },
  { key:'seo',          icon:Globe,        iconBg:'#F0FDFA', iconColor:'#0D9488', title:'SEO & Social Media', desc:'Meta title, description, language, and social links.' },
  { key:'security',     icon:Shield,       iconBg:'#FEF2F2', iconColor:'#DC2626', title:'Security',           desc:'Change password and manage session settings.' },
  { key:'roles',        icon:ShieldCheck,  iconBg:'#EEF2FF', iconColor:'#4F46E5', title:'Roles & Permissions',desc:'Define staff roles and control what each role can access.', external:'/admin/roles' },
  { key:'team',         icon:UserCog,      iconBg:'#FDF4FF', iconColor:'#C026D3', title:'Team Members',       desc:'Add employees, assign roles, and manage QR ID cards.', external:'/admin/team' },
  { key:'menu' as SectionKey,     icon:Navigation, iconBg:'#F0FDF4', iconColor:'#059669', title:'Navigation Menu',    desc:'Build the mega menu and manage all links shown in the storefront header.', external:'/admin/menu' },
  { key:'barcode' as SectionKey,        icon:Barcode,    iconBg:'#FFF7ED', iconColor:'#EA580C', title:'Barcode Label Print',  desc:'Generate and print barcode labels for your products and variants.',    external:'/admin/barcode' },
  { key:'invoiceTemplate' as SectionKey,icon:Printer,    iconBg:'#F0FDF4', iconColor:'#16A34A', title:'Invoice Template',      desc:'Choose from 10 invoice designs for your orders, receipts and POS prints.', external:'/admin/invoice' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const router = useRouter()
  const [active, setActive] = useState<SectionKey | null>(null)
  const [saved,  setSaved]  = useState(false)

  const logoInputRef    = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  const { logoDataUrl, faviconDataUrl, storeName, announcement,
    setLogo, setFavicon, setStoreName, setAnnouncement } = useSettingsStore()

  /* local form state */
  const [store, setStore] = useState({
    name: storeName, email: 'shajporibd@gmail.com', phone: '01712884778',
    business_type: 'Clothing & Apparel', currency: 'BDT', country: 'Bangladesh',
    city: 'Dhaka', address: '', tagline: "Bangladesh's favourite fashion destination",
    details: "Shajpori is a women's fashion brand offering stylish dresses and accessories.",
  })
  const [ann, setAnn] = useState(announcement)
  const [shipping, setShipping] = useState({
    free_threshold:'2000', dhaka_rate:'60', outside_dhaka_rate:'120',
    express_rate:'200', estimated_days_dhaka:'1-2', estimated_days_outside:'3-5',
  })
  const [payment, setPayment] = useState({
    bkash_enabled:true, nagad_enabled:true, rocket_enabled:false, cod_enabled:true, card_enabled:false,
    bkash_number:'01700-000000', nagad_number:'',
    sslcommerz_store_id:'', sslcommerz_store_password:'',
  })
  const [invoice, setInvoice] = useState({
    invoice_type:'a4', print_after_sale:false, maintain_stock:true, vat_percentage:'0.00',
  })
  const [notif, setNotif] = useState({
    new_order_email:true, low_stock_email:true, new_customer_email:false,
    order_shipped_sms:true, daily_report_email:false, admin_email:'admin@shajpori.com',
  })
  const [seo, setSeo] = useState({
    meta_title:'Shajpori — Modern Women\'s Fashion', meta_desc:'', language:'en',
    facebook_url:'', instagram_url:'', whatsapp:'',
  })

  function handleSave() {
    setStoreName(store.name)
    setAnnouncement(ann)
    setSaved(true)
    toast.success('Settings saved')
    setTimeout(() => setSaved(false), 2500)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setLogo(reader.result as string); toast.success('Logo updated') }
    reader.readAsDataURL(file); e.target.value = ''
  }
  function handleFaviconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setFavicon(reader.result as string); toast.success('Favicon updated') }
    reader.readAsDataURL(file); e.target.value = ''
  }

  const current = active ? CARDS.find(c => c.key === active) : null

  /* ── Card grid ──────────────────────────────────────────────────────────── */
  if (!active) return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm" style={{ background: '#FFF0F5' }}>
          <Store size={26} style={{ color: '#C2185B' }} />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Manage Shop</h1>
        <p className="text-[13px] text-gray-500 mt-1.5 max-w-sm">
          Set up and customise all your shop settings from one place.
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map(({ key, icon: Icon, iconBg, iconColor, title, desc, external }) => (
          <motion.div key={key} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-3"
            onClick={() => external ? router.push(external) : setActive(key)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
              <Icon size={19} style={{ color: iconColor }} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900 leading-tight">{title}</p>
              <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{desc}</p>
            </div>
            {external && (
              <span className="text-[11px] font-medium mt-auto" style={{ color: iconColor }}>Open page →</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )

  /* ── Detail panel ───────────────────────────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto">
      {/* Back header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActive(null)}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
          <ChevronLeft size={17} />
        </button>
        {current && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: current.iconBg }}>
              <current.icon size={17} style={{ color: current.iconColor }} />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-gray-900 leading-tight">{current.title}</h1>
              <p className="text-[11px] text-gray-400">{current.desc}</p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}>

          {/* ── STORE ── */}
          {active === 'store' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><FieldLabel>Shop Name *</FieldLabel>
                  <Input value={store.name} onChange={e => setStore(s => ({ ...s, name: e.target.value }))} /></div>
                <div><FieldLabel>Phone / WhatsApp</FieldLabel>
                  <Input value={store.phone} onChange={e => setStore(s => ({ ...s, phone: e.target.value }))} /></div>
                <div><FieldLabel>Shop Email *</FieldLabel>
                  <Input type="email" value={store.email} onChange={e => setStore(s => ({ ...s, email: e.target.value }))} /></div>
                <div><FieldLabel>Business Type</FieldLabel>
                  <Select value={store.business_type} onChange={e => setStore(s => ({ ...s, business_type: e.target.value }))}>
                    <option>Clothing &amp; Apparel</option>
                    <option>Bags &amp; Accessories</option>
                    <option>Jewelry &amp; Cosmetics</option>
                    <option>General Fashion</option>
                  </Select></div>
                <div><FieldLabel>Currency</FieldLabel>
                  <Select value={store.currency} onChange={e => setStore(s => ({ ...s, currency: e.target.value }))}>
                    <option value="BDT">BDT — Bangladeshi Taka (৳)</option>
                    <option value="USD">USD — US Dollar ($)</option>
                  </Select></div>
                <div><FieldLabel>Country</FieldLabel>
                  <Select value={store.country} onChange={e => setStore(s => ({ ...s, country: e.target.value }))}>
                    <option>Bangladesh</option><option>India</option><option>Other</option>
                  </Select></div>
                <div><FieldLabel>City</FieldLabel>
                  <Input value={store.city} onChange={e => setStore(s => ({ ...s, city: e.target.value }))} /></div>
                <div><FieldLabel>Address</FieldLabel>
                  <Input value={store.address} onChange={e => setStore(s => ({ ...s, address: e.target.value }))} /></div>
              </div>
              <div><FieldLabel>Tagline</FieldLabel>
                <Input value={store.tagline} onChange={e => setStore(s => ({ ...s, tagline: e.target.value }))} /></div>
              <div><FieldLabel>Shop Description</FieldLabel>
                <textarea value={store.details} rows={3} onChange={e => setStore(s => ({ ...s, details: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none" /></div>
              <SaveBar onSave={handleSave} saved={saved} />
            </div>
          )}

          {/* ── BRANDING ── */}
          {active === 'branding' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-8">
              {/* Logo */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Website Logo</p>
                <p className="text-[11px] text-gray-400 mb-4">Recommended: 220 × 90 px PNG or SVG</p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#C2185B]/40 transition-colors relative group"
                  onClick={() => logoInputRef.current?.click()}>
                  {logoDataUrl ? (
                    <>
                      <img src={logoDataUrl} alt="Logo" className="max-h-16 mx-auto object-contain" />
                      <p className="text-[10px] text-gray-400 mt-2">Click to replace</p>
                      <button type="button" onClick={e => { e.stopPropagation(); setLogo(null); toast.success('Logo removed') }}
                        className="absolute top-2 right-2 w-6 h-6 bg-gray-100 hover:bg-red-100 hover:text-red-500 rounded-full flex items-center justify-center">
                        <X size={11} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <ImageIcon size={20} className="text-gray-300 group-hover:text-[#C2185B] transition-colors" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">Upload Logo</p>
                      <p className="text-[11px] text-gray-400 mt-1">PNG, SVG up to 2 MB</p>
                    </>
                  )}
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>

              <div className="border-t border-gray-100" />

              {/* Favicon */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Favicon</p>
                <p className="text-[11px] text-gray-400 mb-4">Shown in browser tab. Square image, 32×32 or 64×64 px recommended.</p>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-[#C2185B]/40 transition-colors relative shrink-0 group"
                    onClick={() => faviconInputRef.current?.click()}>
                    {faviconDataUrl ? (
                      <>
                        <img src={faviconDataUrl} alt="Favicon" className="w-9 h-9 object-contain rounded" />
                        <button type="button" onClick={e => { e.stopPropagation(); setFavicon(null); toast.success('Favicon reset') }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 hover:bg-red-100 hover:text-red-500 rounded-full flex items-center justify-center">
                          <X size={9} />
                        </button>
                      </>
                    ) : (
                      <Smile size={22} className="text-gray-300 group-hover:text-[#C2185B] transition-colors" />
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-700">
                      {faviconDataUrl ? 'Custom favicon active' : 'Using default favicon'}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <button onClick={() => faviconInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        <Upload size={11} />{faviconDataUrl ? 'Replace' : 'Upload'}
                      </button>
                      {faviconDataUrl && (
                        <button onClick={() => { setFavicon(null); toast.success('Favicon reset') }}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 rounded-lg text-[11px] font-semibold text-red-400 hover:bg-red-50 transition-colors">
                          <X size={11} />Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">ICO, PNG, SVG — updates instantly in browser tab</p>
                  </div>
                </div>
                <input ref={faviconInputRef} type="file" accept="image/png,image/x-icon,image/svg+xml,image/jpeg"
                  className="hidden" onChange={handleFaviconChange} />
              </div>
            </div>
          )}

          {/* ── ANNOUNCEMENT ── */}
          {active === 'announcement' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div>
                <FieldLabel>Announcement Message</FieldLabel>
                <textarea value={ann} rows={3} placeholder="e.g. Free delivery on orders above ৳2,000!"
                  onChange={e => setAnn(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none" />
                <p className="text-[11px] text-gray-400 mt-1.5">Shown in the top bar of your storefront. Leave blank to hide it.</p>
              </div>
              {ann && (
                <div className="rounded-xl text-center text-[12px] font-medium py-2.5 px-4 text-white" style={{ background: '#C2185B' }}>
                  Preview: {ann}
                </div>
              )}
              <SaveBar onSave={handleSave} saved={saved} />
            </div>
          )}

          {/* ── SHIPPING ── */}
          {active === 'shipping' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><FieldLabel>Free Shipping Above (৳)</FieldLabel>
                  <Input type="number" value={shipping.free_threshold} onChange={e => setShipping(s => ({ ...s, free_threshold: e.target.value }))} /></div>
                <div><FieldLabel>Dhaka Delivery (৳)</FieldLabel>
                  <Input type="number" value={shipping.dhaka_rate} onChange={e => setShipping(s => ({ ...s, dhaka_rate: e.target.value }))} /></div>
                <div><FieldLabel>Outside Dhaka (৳)</FieldLabel>
                  <Input type="number" value={shipping.outside_dhaka_rate} onChange={e => setShipping(s => ({ ...s, outside_dhaka_rate: e.target.value }))} /></div>
                <div><FieldLabel>Express Delivery (৳)</FieldLabel>
                  <Input type="number" value={shipping.express_rate} onChange={e => setShipping(s => ({ ...s, express_rate: e.target.value }))} /></div>
                <div><FieldLabel>Est. Days — Dhaka</FieldLabel>
                  <Input value={shipping.estimated_days_dhaka} placeholder="e.g. 1-2" onChange={e => setShipping(s => ({ ...s, estimated_days_dhaka: e.target.value }))} /></div>
                <div><FieldLabel>Est. Days — Outside Dhaka</FieldLabel>
                  <Input value={shipping.estimated_days_outside} placeholder="e.g. 3-5" onChange={e => setShipping(s => ({ ...s, estimated_days_outside: e.target.value }))} /></div>
              </div>
              <SaveBar onSave={handleSave} saved={saved} />
            </div>
          )}

          {/* ── PAYMENT ── */}
          {active === 'payment' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <Toggle checked={payment.bkash_enabled} onChange={() => setPayment(s => ({ ...s, bkash_enabled: !s.bkash_enabled }))} label="bKash" hint="Mobile banking — most popular in Bangladesh" />
              {payment.bkash_enabled && <Input value={payment.bkash_number} placeholder="bKash merchant number" onChange={e => setPayment(s => ({ ...s, bkash_number: e.target.value }))} />}
              <Toggle checked={payment.nagad_enabled} onChange={() => setPayment(s => ({ ...s, nagad_enabled: !s.nagad_enabled }))} label="Nagad" />
              {payment.nagad_enabled && <Input value={payment.nagad_number} placeholder="Nagad merchant number" onChange={e => setPayment(s => ({ ...s, nagad_number: e.target.value }))} />}
              <Toggle checked={payment.rocket_enabled} onChange={() => setPayment(s => ({ ...s, rocket_enabled: !s.rocket_enabled }))} label="Rocket (DBBL)" />
              <Toggle checked={payment.cod_enabled} onChange={() => setPayment(s => ({ ...s, cod_enabled: !s.cod_enabled }))} label="Cash on Delivery" />
              <Toggle checked={payment.card_enabled} onChange={() => setPayment(s => ({ ...s, card_enabled: !s.card_enabled }))} label="SSLCommerz / Card" hint="Credit & debit cards via SSLCommerz" />
              {payment.card_enabled && (
                <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                  <Input value={payment.sslcommerz_store_id} placeholder="SSLCommerz Store ID" onChange={e => setPayment(s => ({ ...s, sslcommerz_store_id: e.target.value }))} />
                  <Input type="password" value={payment.sslcommerz_store_password} placeholder="Store Password" onChange={e => setPayment(s => ({ ...s, sslcommerz_store_password: e.target.value }))} />
                </div>
              )}
              <SaveBar onSave={handleSave} saved={saved} />
            </div>
          )}

          {/* ── INVOICE ── */}
          {active === 'invoice' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
              <div>
                <FieldLabel>Invoice Print Type</FieldLabel>
                <div className="flex gap-3 mt-1">
                  {[{ val:'a4', label:'A4 Size' }, { val:'thermal', label:'Thermal / POS' }].map(({ val, label }) => (
                    <button key={val} onClick={() => setInvoice(s => ({ ...s, invoice_type: val }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        invoice.invoice_type === val ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 pt-1">
                <Toggle checked={invoice.print_after_sale} onChange={() => setInvoice(s => ({ ...s, print_after_sale: !s.print_after_sale }))} label="Print After Sale" hint="Auto-print invoice when a sale is completed" />
                <Toggle checked={invoice.maintain_stock} onChange={() => setInvoice(s => ({ ...s, maintain_stock: !s.maintain_stock }))} label="Maintain Stock Quantity" hint="Out-of-stock products will show as unavailable" />
              </div>
              <div><FieldLabel>VAT / Tax Percentage (%)</FieldLabel>
                <Input type="number" value={invoice.vat_percentage} min="0" max="100" step="0.01"
                  onChange={e => setInvoice(s => ({ ...s, vat_percentage: e.target.value }))} /></div>
              <SaveBar onSave={handleSave} saved={saved} />
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {active === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div><FieldLabel>Admin Email</FieldLabel>
                <Input type="email" value={notif.admin_email} onChange={e => setNotif(s => ({ ...s, admin_email: e.target.value }))} /></div>
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <Toggle checked={notif.new_order_email} onChange={() => setNotif(s => ({ ...s, new_order_email: !s.new_order_email }))} label="New Order Email" hint="Email on every new order" />
                <Toggle checked={notif.low_stock_email} onChange={() => setNotif(s => ({ ...s, low_stock_email: !s.low_stock_email }))} label="Low Stock Alert" hint="Email when a variant drops below threshold" />
                <Toggle checked={notif.new_customer_email} onChange={() => setNotif(s => ({ ...s, new_customer_email: !s.new_customer_email }))} label="New Customer Email" hint="Email when a new account is created" />
                <Toggle checked={notif.order_shipped_sms} onChange={() => setNotif(s => ({ ...s, order_shipped_sms: !s.order_shipped_sms }))} label="Order Shipped SMS" hint="SMS to customer when order is dispatched" />
                <Toggle checked={notif.daily_report_email} onChange={() => setNotif(s => ({ ...s, daily_report_email: !s.daily_report_email }))} label="Daily Sales Report" hint="Email daily summary at 9 AM" />
              </div>
              <SaveBar onSave={handleSave} saved={saved} />
            </div>
          )}

          {/* ── SEO ── */}
          {active === 'seo' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div><FieldLabel>Meta Title</FieldLabel>
                <Input value={seo.meta_title} onChange={e => setSeo(s => ({ ...s, meta_title: e.target.value }))} /></div>
              <div><FieldLabel>Meta Description</FieldLabel>
                <textarea value={seo.meta_desc} rows={3} placeholder="Short description for search engines…"
                  onChange={e => setSeo(s => ({ ...s, meta_desc: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none" /></div>
              <div>
                <FieldLabel>Website Language</FieldLabel>
                <div className="flex gap-3">
                  {[{ val:'en', label:'🇺🇸 English' }, { val:'bn', label:'🇧🇩 বাংলা' }].map(({ val, label }) => (
                    <button key={val} onClick={() => setSeo(s => ({ ...s, language: val }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        seo.language === val ? 'bg-[#C2185B] text-white border-[#C2185B]' : 'border-gray-200 text-gray-500'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div><FieldLabel>Facebook Page URL</FieldLabel>
                  <Input value={seo.facebook_url} placeholder="https://facebook.com/shajpori" onChange={e => setSeo(s => ({ ...s, facebook_url: e.target.value }))} /></div>
                <div><FieldLabel>Instagram URL</FieldLabel>
                  <Input value={seo.instagram_url} placeholder="https://instagram.com/shajpori" onChange={e => setSeo(s => ({ ...s, instagram_url: e.target.value }))} /></div>
                <div><FieldLabel>WhatsApp Number</FieldLabel>
                  <Input value={seo.whatsapp} placeholder="e.g. 8801712884778" onChange={e => setSeo(s => ({ ...s, whatsapp: e.target.value }))} /></div>
              </div>
              <SaveBar onSave={handleSave} saved={saved} />
            </div>
          )}

          {/* ── SECURITY ── */}
          {active === 'security' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div><FieldLabel>Current Password</FieldLabel><Input type="password" placeholder="Enter current password" /></div>
              <div><FieldLabel>New Password</FieldLabel><Input type="password" placeholder="Min. 8 characters" /></div>
              <div><FieldLabel>Confirm New Password</FieldLabel><Input type="password" placeholder="Repeat new password" /></div>
              <div><FieldLabel>Session Timeout</FieldLabel>
                <Select className="max-w-xs">
                  <option>8 hours</option><option>24 hours</option><option>7 days</option><option>Never</option>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-400 mt-0.5">Adds an extra layer of security</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-400 px-2.5 py-1 rounded-lg font-medium">Coming soon</span>
              </div>
              <SaveBar onSave={handleSave} saved={saved} />
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
