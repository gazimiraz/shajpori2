'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Settings2, Bell, Eye, EyeOff,
  Check, Camera, Shield, Clock, Globe, LayoutGrid,
  Save, AlertCircle, CheckCircle2, Palette
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAdminStore } from '@/lib/adminStore'

const BRAND = '#D81B60'

const TABS = [
  { id: 'profile',     label: 'Profile',      icon: User     },
  { id: 'security',    label: 'Security',      icon: Lock     },
  { id: 'preferences', label: 'Preferences',   icon: Settings2},
  { id: 'notifications',label:'Notifications', icon: Bell     },
] as const
type Tab = typeof TABS[number]['id']

const AVATAR_COLORS = [
  '#D81B60','#1565C0','#2E7D32','#E65100',
  '#6A1B9A','#00838F','#AD1457','#37474F',
]

/* ── Shared components ──────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">{children}</label>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-transparent transition-all bg-white ${props.className ?? ''}`} />
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props}
      className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-transparent transition-all bg-white resize-none ${props.className ?? ''}`} />
  )
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props}
      className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white ${props.className ?? ''}`} />
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="w-11 h-6 rounded-full relative shrink-0 transition-colors"
      style={{ background: checked ? BRAND : '#E5E7EB' }}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

function SaveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold disabled:opacity-60 transition-opacity"
      style={{ background: BRAND }}>
      {loading
        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        : <Save size={15} />}
      {loading ? 'Saving…' : 'Save Changes'}
    </motion.button>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PROFILE TAB
══════════════════════════════════════════════════════════════════════════ */
function ProfileTab() {
  const { profile, setProfile } = useAdminStore()
  const [form, setForm]         = useState({ ...profile })
  const [loading, setLoading]   = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function save() {
    setLoading(true)
    setTimeout(() => {
      setProfile(form)
      toast.success('Profile updated')
      setLoading(false)
    }, 600)
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-[14px] font-bold text-gray-900 mb-5">Profile Photo</h3>
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-[28px] font-black shadow-md"
              style={{ background: form.avatarColor }}>
              {form.avatarText || form.name[0]?.toUpperCase() || 'A'}
            </div>
            <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
              <Camera size={13} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-gray-700 mb-3">Avatar Color</p>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, avatarColor: c }))}
                  className="w-8 h-8 rounded-lg transition-transform hover:scale-110 relative"
                  style={{ background: c }}>
                  {form.avatarColor === c && (
                    <Check size={14} className="absolute inset-0 m-auto text-white" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Label>Display Initial</Label>
              <input maxLength={2} value={form.avatarText}
                onChange={e => setForm(f => ({ ...f, avatarText: e.target.value.toUpperCase() }))}
                className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-[14px] font-bold text-center focus:outline-none focus:ring-2 focus:ring-pink-200"
                placeholder="A" />
            </div>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-[14px] font-bold text-gray-900 mb-5">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label>Full Name</Label>
            <Input value={form.name} onChange={set('name')} placeholder="Your full name" />
          </div>
          <div>
            <Label>Job Title</Label>
            <Input value={form.title} onChange={set('title')} placeholder="e.g. Store Manager" />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input type="email" value={form.email} onChange={set('email')} placeholder="admin@shajpori.com" />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input type="tel" value={form.phone} onChange={set('phone')} placeholder="+880 1700 000000" />
          </div>
          <div className="md:col-span-2">
            <Label>Bio / Note</Label>
            <Textarea rows={3} value={form.bio} onChange={set('bio')} placeholder="Short note about yourself (optional)" />
          </div>
        </div>
        <div className="flex justify-end mt-5 pt-5 border-t border-gray-50">
          <SaveButton loading={loading} onClick={save} />
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SECURITY TAB
══════════════════════════════════════════════════════════════════════════ */
function SecurityTab() {
  const [form, setForm]   = useState({ current: '', next: '', confirm: '' })
  const [show, setShow]   = useState({ current: false, next: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [strength, setStrength] = useState(0)

  function calcStrength(pw: string) {
    let s = 0
    if (pw.length >= 8)           s++
    if (/[A-Z]/.test(pw))         s++
    if (/[0-9]/.test(pw))         s++
    if (/[^A-Za-z0-9]/.test(pw))  s++
    return s
  }

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981']

  async function changePassword() {
    if (!form.current) { toast.error('Enter your current password'); return }
    if (!form.next)    { toast.error('Enter a new password'); return }
    if (form.next !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.next.length < 6) { toast.error('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); setLoading(false); return }
      toast.success('Password changed successfully!')
      setForm({ current: '', next: '', confirm: '' })
      setStrength(0)
    } catch {
      toast.error('Network error')
    }
    setLoading(false)
  }

  function Eye2({ field }: { field: keyof typeof show }) {
    return (
      <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}>
        {show[field] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    )
  }

  return (
    <div className="space-y-5">
      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#FFF0F4' }}>
            <Lock size={16} style={{ color: BRAND }} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">Change Password</h3>
            <p className="text-[11px] text-gray-400">Use a strong password you don't use elsewhere</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <Label>Current Password</Label>
            <div className="relative">
              <Input type={show.current ? 'text' : 'password'} value={form.current}
                onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
                placeholder="Your current password" className="pr-10" />
              <Eye2 field="current" />
            </div>
          </div>

          <div>
            <Label>New Password</Label>
            <div className="relative">
              <Input type={show.next ? 'text' : 'password'} value={form.next}
                onChange={e => { setForm(f => ({ ...f, next: e.target.value })); setStrength(calcStrength(e.target.value)) }}
                placeholder="Minimum 6 characters" className="pr-10" />
              <Eye2 field="next" />
            </div>
            {form.next && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-1.5 flex-1 rounded-full transition-colors"
                      style={{ background: i <= strength ? strengthColor[strength] : '#E5E7EB' }} />
                  ))}
                </div>
                <p className="text-[11px] mt-1 font-semibold" style={{ color: strengthColor[strength] || '#9CA3AF' }}>
                  {strengthLabel[strength] || 'Too short'}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label>Confirm New Password</Label>
            <div className="relative">
              <Input type={show.confirm ? 'text' : 'password'} value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Re-enter new password" className="pr-10" />
              <Eye2 field="confirm" />
              {form.confirm && form.next && (
                <span className="absolute right-9 top-1/2 -translate-y-1/2">
                  {form.next === form.confirm
                    ? <CheckCircle2 size={15} className="text-green-500" />
                    : <AlertCircle size={15} className="text-red-400" />}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-5 pt-5 border-t border-gray-50">
          <SaveButton loading={loading} onClick={changePassword} />
        </div>
      </div>

      {/* Security info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-50">
            <Shield size={16} className="text-green-600" />
          </div>
          <h3 className="text-[14px] font-bold text-gray-900">Security Info</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Session duration',    value: '7 days',            icon: Clock },
            { label: 'Authentication',      value: 'Password protected', icon: Lock  },
            { label: 'Access scope',        value: 'Full admin access',  icon: Shield},
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <Icon size={14} className="text-gray-400" />
                <span className="text-[13px] text-gray-600">{label}</span>
              </div>
              <span className="text-[12px] font-semibold text-gray-800 bg-gray-50 px-3 py-1 rounded-lg">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PREFERENCES TAB
══════════════════════════════════════════════════════════════════════════ */
function PreferencesTab() {
  const { preferences, setPreferences } = useAdminStore()
  const [loading, setLoading]           = useState(false)

  function save() {
    setLoading(true)
    setTimeout(() => { toast.success('Preferences saved'); setLoading(false) }, 500)
  }

  return (
    <div className="space-y-5">
      {/* Display */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#FFF0F4' }}>
            <LayoutGrid size={16} style={{ color: BRAND }} />
          </div>
          <h3 className="text-[14px] font-bold text-gray-900">Display & Layout</h3>
        </div>
        <div className="space-y-4">
          {([
            { key: 'compactSidebar',  label: 'Compact sidebar by default', desc: 'Start with the sidebar collapsed' },
            { key: 'showQuickStats',  label: 'Show quick stats on dashboard', desc: 'Summary cards at the top of dashboard' },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-[13px] font-semibold text-gray-800">{label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
              </div>
              <Toggle checked={preferences[key]} onChange={v => setPreferences({ [key]: v })} />
            </div>
          ))}
        </div>
      </div>

      {/* Regional */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50">
            <Globe size={16} className="text-blue-600" />
          </div>
          <h3 className="text-[14px] font-bold text-gray-900">Regional Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label>Date Format</Label>
            <Select value={preferences.dateFormat} onChange={e => setPreferences({ dateFormat: e.target.value as any })}>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </Select>
          </div>
          <div>
            <Label>Currency Display</Label>
            <Select value={preferences.currency} onChange={e => setPreferences({ currency: e.target.value as any })}>
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($)</option>
            </Select>
          </div>
          <div>
            <Label>Default Order View</Label>
            <Select value={preferences.defaultOrderView} onChange={e => setPreferences({ defaultOrderView: e.target.value as any })}>
              <option value="all">All Orders</option>
              <option value="pending">Pending First</option>
              <option value="processing">Processing First</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton loading={loading} onClick={save} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   NOTIFICATIONS TAB
══════════════════════════════════════════════════════════════════════════ */
function NotificationsTab() {
  const { preferences, setPreferences } = useAdminStore()
  const [loading, setLoading]           = useState(false)

  function save() {
    setLoading(true)
    setTimeout(() => { toast.success('Notification settings saved'); setLoading(false) }, 500)
  }

  const items = [
    { key: 'notifyNewOrder',    label: 'New Orders',      desc: 'Get notified when a new order is placed',      color: 'bg-blue-50',   tc: 'text-blue-600'  },
    { key: 'notifyLowStock',    label: 'Low Stock Alert', desc: 'Alert when a product goes below stock threshold', color: 'bg-amber-50',  tc: 'text-amber-600' },
    { key: 'notifyNewCustomer', label: 'New Customers',   desc: 'Notify when a new customer registers',          color: 'bg-green-50',  tc: 'text-green-600' },
  ] as const

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#FFF0F4' }}>
            <Bell size={16} style={{ color: BRAND }} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">Notification Preferences</h3>
            <p className="text-[11px] text-gray-400">Choose what alerts appear in the admin panel</p>
          </div>
        </div>
        <div className="space-y-1">
          {items.map(({ key, label, desc, color, tc }) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Bell size={16} className={tc} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">{label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
              <Toggle checked={preferences[key]} onChange={v => setPreferences({ [key]: v })} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton loading={loading} onClick={save} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function AccountPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const { profile }   = useAdminStore()

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-[24px] font-black shadow-md shrink-0"
          style={{ background: profile.avatarColor }}>
          {profile.avatarText || profile.name[0]?.toUpperCase() || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-black text-gray-900 truncate">{profile.name}</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">{profile.title} · {profile.email}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[12px]">
          <span className="bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active Session
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
              tab === id ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
            }`}
            style={tab === id ? { background: BRAND } : {}}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}>
          {tab === 'profile'       && <ProfileTab />}
          {tab === 'security'      && <SecurityTab />}
          {tab === 'preferences'   && <PreferencesTab />}
          {tab === 'notifications' && <NotificationsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
