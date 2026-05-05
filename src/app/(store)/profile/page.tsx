'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'
import {
  User, Package, MapPin, Shield, LogOut, Edit3, Save, X,
  Plus, Trash2, Star, Crown, ChevronRight, Eye, Phone,
  Mail, Calendar, BadgeCheck, Clock, TrendingUp, Heart,
  CheckCircle, AlertCircle, Loader2, Home, Briefcase
} from 'lucide-react'

/* ── Types ───────────────────────────────────────────────────── */
interface Profile {
  id: string; email: string; full_name: string; phone: string
  date_of_birth: string; gender: string; bio: string; avatar_url: string
  total_orders: number; total_spent: number; loyalty_points: number
  created_at: string
}
interface Order {
  id: string; order_number: string; created_at: string
  total_amount: number; status: string; payment_status: string
  items_ordered: { name: string; qty: number; image?: string }[]
}
interface Address {
  id: string; label: string; full_name: string; phone: string
  address_line1: string; address_line2: string; city: string
  district: string; postal_code: string; is_default: boolean
}

/* ── Helpers ─────────────────────────────────────────────────── */
const TABS = [
  { id: 'overview',  label: 'Overview',      icon: TrendingUp },
  { id: 'orders',    label: 'My Orders',     icon: Package },
  { id: 'profile',   label: 'Personal Info', icon: User },
  { id: 'addresses', label: 'Addresses',     icon: MapPin },
  { id: 'security',  label: 'Security',      icon: Shield },
]

function tier(spent: number) {
  if (spent >= 50000) return { label: 'Diamond', color: '#06B6D4', icon: '💎' }
  if (spent >= 20000) return { label: 'Gold',    color: '#F59E0B', icon: '👑' }
  if (spent >= 5000)  return { label: 'Silver',  color: '#94A3B8', icon: '⭐' }
  return                     { label: 'Bronze',  color: '#92400E', icon: '🎖️' }
}

const STATUS_STYLE: Record<string, string> = {
  Delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Shipped:    'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-violet-50 text-violet-700 border-violet-200',
  Confirmed:  'bg-cyan-50 text-cyan-700 border-cyan-200',
  Pending:    'bg-amber-50 text-amber-700 border-amber-200',
  Cancelled:  'bg-red-50 text-red-700 border-red-200',
  Refunded:   'bg-gray-50 text-gray-600 border-gray-200',
}

function initials(name: string) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

const AVATAR_COLORS = ['#D81B60','#7C3AED','#0891B2','#059669','#DC2626','#D97706']

/* ── Empty states ─────────────────────────────────────────────── */
function Empty({ icon: Icon, title, sub }: { icon: any; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-300" />
      </div>
      <p className="font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-sm text-gray-400">{sub}</p>
    </div>
  )
}

/* ── Address form modal ───────────────────────────────────────── */
const BLANK_ADDR = { label: 'Home', full_name: '', phone: '', address_line1: '', address_line2: '', city: '', district: '', postal_code: '', is_default: false }

function AddressModal({ initial, onSave, onClose }: {
  initial?: Partial<Address>; onSave: (data: typeof BLANK_ADDR) => void; onClose: () => void
}) {
  const [form, setForm] = useState({ ...BLANK_ADDR, ...initial })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-lg">{initial?.id ? 'Edit Address' : 'Add New Address'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Label</label>
            <div className="flex gap-2">
              {['Home', 'Work', 'Other'].map(l => (
                <button key={l} type="button" onClick={() => setForm(f => ({ ...f, label: l }))}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${form.label === l ? 'border-[#D81B60] bg-pink-50 text-[#D81B60]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {l === 'Home' ? <Home size={14} /> : l === 'Work' ? <Briefcase size={14} /> : <MapPin size={14} />}
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Full Name</label>
              <input value={form.full_name} onChange={set('full_name')} placeholder="Recipient name"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] focus:ring-1 focus:ring-[#D81B60]/20 outline-none transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] focus:ring-1 focus:ring-[#D81B60]/20 outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Address Line 1</label>
            <input value={form.address_line1} onChange={set('address_line1')} placeholder="House, Road, Block"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] focus:ring-1 focus:ring-[#D81B60]/20 outline-none transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Address Line 2 <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
            <input value={form.address_line2} onChange={set('address_line2')} placeholder="Area, Thana"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] focus:ring-1 focus:ring-[#D81B60]/20 outline-none transition-all" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">City</label>
              <input value={form.city} onChange={set('city')} placeholder="Dhaka"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] outline-none transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">District</label>
              <input value={form.district} onChange={set('district')} placeholder="Dhaka"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] outline-none transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Postal</label>
              <input value={form.postal_code} onChange={set('postal_code')} placeholder="1212"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] outline-none transition-all" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
              className="w-4 h-4 accent-[#D81B60]" />
            <span className="text-sm text-gray-600">Set as default delivery address</span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => { if (!form.full_name || !form.address_line1 || !form.city) { toast.error('Fill required fields'); return } onSave(form) }}
            className="flex-1 py-2.5 rounded-xl bg-[#D81B60] text-white text-sm font-bold hover:bg-[#C2185B] transition-colors">
            Save Address
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null)
  if (!supabaseRef.current) supabaseRef.current = createBrowserClient()
  const supabase = supabaseRef.current

  const [tab,        setTab]        = useState('overview')
  const [profile,    setProfile]    = useState<Profile | null>(null)
  const [orders,     setOrders]     = useState<Order[]>([])
  const [addresses,  setAddresses]  = useState<Address[]>([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [editForm,   setEditForm]   = useState<Partial<Profile>>({})
  const [pwForm,     setPwForm]     = useState({ current: '', next: '', confirm: '' })
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress,   setEditingAddress]   = useState<Address | null>(null)
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotal,setOrdersTotal]= useState(0)

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth?from=/profile')
      else loadAll()
    })
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, oRes, aRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/profile/orders?per_page=5'),
        fetch('/api/profile/addresses'),
      ])
      const [p, o, a] = await Promise.all([pRes.json(), oRes.json(), aRes.json()])
      if (p.data)  { setProfile(p.data);  setEditForm(p.data) }
      if (o.data)  { setOrders(o.data);   setOrdersTotal(o.count ?? 0) }
      if (a.data)  setAddresses(a.data)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadOrders = useCallback(async (page: number) => {
    const res  = await fetch(`/api/profile/orders?page=${page}&per_page=8`)
    const json = await res.json()
    if (json.data) { setOrders(json.data); setOrdersTotal(json.count ?? 0) }
    setOrdersPage(page)
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res  = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
      const json = await res.json()
      if (json.data) { setProfile(json.data); toast.success('Profile updated!') }
      else toast.error(json.error || 'Failed to save')
    } finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (!pwForm.next || pwForm.next.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.next })
      if (error) toast.error(error.message)
      else { toast.success('Password changed!'); setPwForm({ current: '', next: '', confirm: '' }) }
    } finally { setSaving(false) }
  }

  const saveAddress = async (data: typeof BLANK_ADDR & { id?: string }) => {
    const isEdit = Boolean(editingAddress?.id)
    const res = isEdit
      ? await fetch(`/api/profile/addresses/${editingAddress!.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      : await fetch('/api/profile/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const json = await res.json()
    if (json.error) { toast.error(json.error); return }
    toast.success(isEdit ? 'Address updated!' : 'Address added!')
    setShowAddressModal(false)
    setEditingAddress(null)
    const aRes = await fetch('/api/profile/addresses')
    const a    = await aRes.json()
    if (a.data) setAddresses(a.data)
  }

  const deleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return
    await fetch(`/api/profile/addresses/${id}`, { method: 'DELETE' })
    setAddresses(prev => prev.filter(a => a.id !== id))
    toast.success('Address removed')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-[#D81B60] animate-spin" />
          <p className="text-gray-500 text-sm">Loading your profile…</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const t      = tier(profile.total_spent)
  const avatar = AVATAR_COLORS[profile.email.charCodeAt(0) % AVATAR_COLORS.length]

  return (
    <div className="min-h-screen bg-[#FFF5F8]">

      {/* ── Hero header ──────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #D81B60 0%, #880E4F 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/30"
              style={{ width: `${80 + i * 60}px`, height: `${80 + i * 60}px`, top: `${-20 + i * 10}%`, right: `${-5 + i * 5}%` }} />
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl border-4 border-white/20"
              style={{ background: avatar }}>
              {initials(profile.full_name || profile.email)}
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold shadow text-white"
              style={{ background: t.color }}>
              {t.icon} {t.label}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left text-white">
            <h1 className="text-2xl font-black">{profile.full_name || 'My Profile'}</h1>
            <p className="text-white/70 text-sm mt-0.5">{profile.email}</p>
            {profile.phone && <p className="text-white/70 text-sm">{profile.phone}</p>}
          </div>

          {/* Stats */}
          <div className="flex gap-4 sm:gap-6 text-center text-white shrink-0">
            {[
              { label: 'Orders',  value: profile.total_orders },
              { label: 'Spent',   value: `৳${(profile.total_spent || 0).toLocaleString()}` },
              { label: 'Points',  value: profile.loyalty_points },
            ].map(s => (
              <div key={s.label}>
                <div className="text-xl font-black">{s.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <button onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors border border-white/20">
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Tab nav */}
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap rounded-t-xl transition-all ${
                  tab === t.id ? 'bg-[#FFF5F8] text-[#D81B60]' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}>
                <t.icon size={15} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

            {/* ── OVERVIEW ─────────────────────────────────── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: Package,    label: 'Total Orders',  value: profile.total_orders, color: '#7C3AED' },
                    { icon: TrendingUp, label: 'Total Spent',   value: `৳${(profile.total_spent || 0).toLocaleString()}`, color: '#D81B60' },
                    { icon: Star,       label: 'Loyalty Points',value: profile.loyalty_points, color: '#F59E0B' },
                    { icon: Crown,      label: 'Your Tier',     value: `${t.icon} ${t.label}`, color: t.color },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: s.color + '15' }}>
                        <s.icon size={20} style={{ color: s.color }} />
                      </div>
                      <div className="text-xl font-black text-gray-900">{s.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                    <h2 className="font-bold text-gray-900">Recent Orders</h2>
                    <button onClick={() => setTab('orders')} className="text-xs text-[#D81B60] font-semibold hover:opacity-80">View all →</button>
                  </div>
                  {orders.length === 0
                    ? <Empty icon={Package} title="No orders yet" sub="Your orders will appear here" />
                    : orders.slice(0, 3).map(o => (
                      <div key={o.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                          <Package size={18} className="text-[#D81B60]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{o.order_number}</p>
                          <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLE[o.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {o.status}
                        </span>
                        <span className="font-bold text-gray-900 text-sm shrink-0">৳{o.total_amount?.toLocaleString()}</span>
                      </div>
                    ))
                  }
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Edit Profile', icon: Edit3, tab: 'profile', color: '#D81B60' },
                    { label: 'Addresses',    icon: MapPin, tab: 'addresses', color: '#7C3AED' },
                    { label: 'Security',     icon: Shield, tab: 'security', color: '#0891B2' },
                    { label: 'Sign Out',     icon: LogOut, tab: null, color: '#6B7280', action: handleLogout },
                  ].map(a => (
                    <button key={a.label}
                      onClick={() => a.action ? a.action() : setTab(a.tab!)}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all text-left">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: a.color + '15' }}>
                        <a.icon size={18} style={{ color: a.color }} />
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── ORDERS ───────────────────────────────────── */}
            {tab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h2 className="font-bold text-gray-900">Order History</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{ordersTotal} total orders</p>
                </div>

                {orders.length === 0
                  ? <Empty icon={Package} title="No orders yet" sub="Your orders will appear here once you shop" />
                  : (
                    <div>
                      {orders.map((o, i) => (
                        <div key={o.id} className={`px-6 py-5 ${i < orders.length - 1 ? 'border-b border-gray-50' : ''}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900">{o.order_number}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLE[o.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                  {o.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                {new Date(o.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(o.items_ordered || []).slice(0, 3).map((item, j) => (
                                  <span key={j} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
                                    {item.name} ×{item.qty}
                                  </span>
                                ))}
                                {(o.items_ordered || []).length > 3 && (
                                  <span className="text-xs text-gray-400 px-2 py-0.5">+{o.items_ordered.length - 3} more</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-black text-gray-900">৳{o.total_amount?.toLocaleString()}</div>
                              <div className={`text-xs mt-1 font-medium ${o.payment_status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {o.payment_status}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pagination */}
                      {ordersTotal > 8 && (
                        <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-gray-50">
                          <button disabled={ordersPage === 1} onClick={() => loadOrders(ordersPage - 1)}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-[#D81B60] transition-colors">
                            ← Prev
                          </button>
                          <span className="text-sm text-gray-500 px-2">Page {ordersPage} of {Math.ceil(ordersTotal / 8)}</span>
                          <button disabled={ordersPage >= Math.ceil(ordersTotal / 8)} onClick={() => loadOrders(ordersPage + 1)}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-[#D81B60] transition-colors">
                            Next →
                          </button>
                        </div>
                      )}
                    </div>
                  )
                }
              </div>
            )}

            {/* ── PERSONAL INFO ─────────────────────────────── */}
            {tab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-bold text-gray-900">Personal Information</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Update your profile details</p>
                  </div>
                  <button onClick={saveProfile} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D81B60] text-white text-sm font-bold hover:bg-[#C2185B] disabled:opacity-60 transition-all">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Full Name</label>
                      <input value={editForm.full_name || ''} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] focus:ring-1 focus:ring-[#D81B60]/20 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Phone Number</label>
                      <input value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] focus:ring-1 focus:ring-[#D81B60]/20 outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Email Address</label>
                    <input value={profile.email} disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support if needed.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Date of Birth</label>
                      <input type="date" value={editForm.date_of_birth || ''} onChange={e => setEditForm(f => ({ ...f, date_of_birth: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] focus:ring-1 focus:ring-[#D81B60]/20 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Gender</label>
                      <select value={editForm.gender || ''} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] outline-none transition-all bg-white">
                        <option value="">Prefer not to say</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Bio <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                    <textarea value={editForm.bio || ''} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                      rows={3} placeholder="Tell us a little about yourself…"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] focus:ring-1 focus:ring-[#D81B60]/20 outline-none transition-all resize-none" />
                  </div>

                  {/* Member info */}
                  <div className="border-t border-gray-100 pt-5 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      Member since {new Date(profile.created_at).toLocaleDateString('en-BD', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BadgeCheck size={14} className="text-emerald-500" />
                      Email verified
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── ADDRESSES ─────────────────────────────────── */}
            {tab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900">Saved Addresses</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{addresses.length} address{addresses.length !== 1 ? 'es' : ''} saved</p>
                  </div>
                  <button onClick={() => { setEditingAddress(null); setShowAddressModal(true) }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D81B60] text-white text-sm font-bold hover:bg-[#C2185B] transition-colors">
                    <Plus size={15} /> Add Address
                  </button>
                </div>

                {addresses.length === 0
                  ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                      <Empty icon={MapPin} title="No addresses saved" sub="Add a delivery address for faster checkout" />
                      <div className="pb-6 text-center">
                        <button onClick={() => setShowAddressModal(true)} className="px-6 py-2.5 rounded-xl bg-[#D81B60] text-white text-sm font-bold hover:bg-[#C2185B] transition-colors">
                          Add your first address
                        </button>
                      </div>
                    </div>
                  )
                  : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map(addr => (
                        <div key={addr.id} className={`bg-white rounded-2xl border shadow-sm p-5 relative transition-all ${addr.is_default ? 'border-[#D81B60]/30 ring-1 ring-[#D81B60]/20' : 'border-gray-100'}`}>
                          {addr.is_default && (
                            <span className="absolute top-4 right-4 px-2 py-0.5 bg-pink-50 text-[#D81B60] text-[11px] font-bold rounded-full border border-pink-200">
                              Default
                            </span>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                              {addr.label === 'Home' ? <Home size={14} className="text-[#D81B60]" />
                                : addr.label === 'Work' ? <Briefcase size={14} className="text-[#D81B60]" />
                                : <MapPin size={14} className="text-[#D81B60]" />}
                            </div>
                            <span className="font-bold text-gray-900 text-sm">{addr.label}</span>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">{addr.full_name}</p>
                          <p className="text-gray-500 text-sm mt-0.5">{addr.phone}</p>
                          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                            {addr.city}, {addr.district}{addr.postal_code ? ` - ${addr.postal_code}` : ''}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <button onClick={() => { setEditingAddress(addr); setShowAddressModal(true) }}
                              className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#D81B60] hover:text-[#D81B60] transition-colors flex items-center justify-center gap-1.5">
                              <Edit3 size={12} /> Edit
                            </button>
                            <button onClick={() => deleteAddress(addr.id)}
                              className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-red-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5">
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            )}

            {/* ── SECURITY ──────────────────────────────────── */}
            {tab === 'security' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-1">Change Password</h2>
                  <p className="text-xs text-gray-400 mb-6">Choose a strong password with at least 6 characters</p>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">New Password</label>
                      <input type="password" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                        placeholder="New password (min 6 chars)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] focus:ring-1 focus:ring-[#D81B60]/20 outline-none transition-all" />
                      {pwForm.next && (
                        <div className="mt-2 flex gap-1">
                          {[1,2,3,4].map(l => (
                            <div key={l} className={`h-1.5 flex-1 rounded-full transition-colors ${pwForm.next.length >= l * 3 ? l <= 1 ? 'bg-red-400' : l <= 2 ? 'bg-amber-400' : l <= 3 ? 'bg-blue-400' : 'bg-emerald-500' : 'bg-gray-100'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Confirm New Password</label>
                      <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                        placeholder="Re-enter new password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#D81B60] focus:ring-1 focus:ring-[#D81B60]/20 outline-none transition-all" />
                      {pwForm.confirm && pwForm.next && (
                        <p className={`text-xs mt-1.5 flex items-center gap-1 ${pwForm.next === pwForm.confirm ? 'text-emerald-600' : 'text-red-500'}`}>
                          {pwForm.next === pwForm.confirm ? <><CheckCircle size={12} /> Passwords match</> : <><AlertCircle size={12} /> Passwords do not match</>}
                        </p>
                      )}
                    </div>
                    <button onClick={changePassword} disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D81B60] text-white text-sm font-bold hover:bg-[#C2185B] disabled:opacity-60 transition-all">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                      {saving ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </div>

                {/* Account info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Account Details</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail size={15} className="text-gray-400 shrink-0" />
                      <span>{profile.email}</span>
                      <span className="ml-auto px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">Verified</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar size={15} className="text-gray-400 shrink-0" />
                      <span>Member since {new Date(profile.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Crown size={15} style={{ color: t.color }} className="shrink-0" />
                      <span>{t.icon} {t.label} tier member</span>
                    </div>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
                  <h2 className="font-bold text-red-600 mb-1">Danger Zone</h2>
                  <p className="text-xs text-gray-500 mb-4">These actions are permanent and cannot be undone.</p>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                    <LogOut size={14} /> Sign Out of All Devices
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Address modal */}
      <AnimatePresence>
        {showAddressModal && (
          <AddressModal
            initial={editingAddress || undefined}
            onSave={saveAddress}
            onClose={() => { setShowAddressModal(false); setEditingAddress(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
