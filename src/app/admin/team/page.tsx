'use client'
import { useState, useRef, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  Plus, Pencil, Trash2, X, Check, Mail, Phone, ShieldCheck,
  ToggleLeft, ToggleRight, Search, UserCog, Camera, QrCode,
  Download, Building2, Hash, BadgeCheck,
} from 'lucide-react'
import {
  useTeamStore, TeamMember, MemberStatus,
  ROLES, ROLE_COLORS, AVATAR_COLORS,
} from '@/lib/teamStore'

const BRAND = '#C2185B'
const uid = () => Math.random().toString(36).slice(2, 9)

/* ─── Avatar / photo ─────────────────────────────────────────────────────── */
function MemberAvatar({ member, size = 36 }: { member: TeamMember; size?: number }) {
  if (member.image) {
    return (
      <img src={member.image} alt={member.name}
        className="rounded-full object-cover shrink-0 border-2 border-white shadow"
        style={{ width: size, height: size }} />
    )
  }
  const initials = member.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <span className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, background: member.avatar, fontSize: size * 0.36 }}>
      {initials}
    </span>
  )
}

/* ─── Image upload ────────────────────────────────────────────────────────── */
function ImageUpload({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { if (ev.target?.result) onChange(ev.target.result as string) }
    reader.readAsDataURL(file)
  }
  return (
    <div className="flex items-center gap-4">
      <div className="relative group cursor-pointer" onClick={() => ref.current?.click()}>
        {value ? (
          <img src={value} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <Camera size={22} className="text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera size={18} className="text-white" />
        </div>
      </div>
      <div>
        <button type="button" onClick={() => ref.current?.click()}
          className="text-[12px] font-medium text-pink-600 hover:underline block">
          {value ? 'Change photo' : 'Upload photo'}
        </button>
        <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG — max 2 MB</p>
        {value && (
          <button type="button" onClick={() => onChange('')}
            className="text-[11px] text-red-400 hover:underline mt-0.5 block">Remove</button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

/* ─── Department dropdown with inline add ────────────────────────────────── */
function DepartmentSelect({ value, onChange, departments, onAddDept, onRemoveDept }: {
  value: string
  onChange: (v: string) => void
  departments: string[]
  onAddDept: (name: string) => void
  onRemoveDept: (name: string) => void
}) {
  const [open, setOpen]     = useState(false)
  const [adding, setAdding] = useState(false)
  const [newDept, setNewDept] = useState('')

  function confirmAdd() {
    if (!newDept.trim()) return
    onAddDept(newDept.trim())
    onChange(newDept.trim())
    setNewDept('')
    setAdding(false)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 hover:border-gray-300 transition-colors">
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>{value || 'Select department…'}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            <button type="button" onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-left px-3 py-2.5 text-[12px] text-gray-400 hover:bg-gray-50 transition-colors">
              — None —
            </button>
            {departments.map(d => (
              <div key={d} className="flex items-center group hover:bg-pink-50 transition-colors">
                <button type="button" onClick={() => { onChange(d); setOpen(false) }}
                  className={`flex-1 text-left px-3 py-2.5 text-[13px] transition-colors ${value === d ? 'font-semibold text-pink-700' : 'text-gray-700'}`}>
                  {d}
                </button>
                <button type="button" onClick={() => { if (value === d) onChange(''); onRemoveDept(d) }}
                  className="pr-3 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Add new */}
          <div className="border-t border-gray-100 p-2">
            {adding ? (
              <div className="flex gap-1">
                <input autoFocus value={newDept} onChange={e => setNewDept(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setAdding(false) }}
                  placeholder="Department name…"
                  className="flex-1 border border-pink-200 rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-pink-400" />
                <button type="button" onClick={confirmAdd}
                  className="p-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white transition-colors">
                  <Check size={12} />
                </button>
                <button type="button" onClick={() => setAdding(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setAdding(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-medium text-pink-600 hover:bg-pink-50 transition-colors">
                <Plus size={13} /> Add new department
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── QR Modal ───────────────────────────────────────────────────────────── */
function QRModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const [origin, setOrigin] = useState('')
  useEffect(() => { setOrigin(window.location.origin) }, [])
  const url = `${origin}/staff/${member.id}`

  function downloadQR() {
    const svg = document.getElementById(`qr-${member.id}`)
    if (!svg) return
    const data = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([data], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${member.name.replace(/\s+/g, '-')}-QR.svg`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[14px] font-bold text-gray-900">Employee QR Code</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          <div className="w-full rounded-2xl overflow-hidden border border-gray-200">
            <div className="h-16 relative" style={{ background: `linear-gradient(135deg, ${member.avatar}, ${member.avatar}88)` }} />
            <div className="px-5 pb-5 -mt-8 flex flex-col items-center text-center">
              <div className="ring-4 ring-white rounded-full mb-2">
                <MemberAvatar member={member} size={56} />
              </div>
              <p className="text-[14px] font-bold text-gray-900">{member.name}</p>
              {/* Employee ID badge */}
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 mt-1">
                <Hash size={9} />{member.employeeId}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-2"
                style={{ background: (ROLE_COLORS[member.role] ?? '#374151') + '18', color: ROLE_COLORS[member.role] ?? '#374151' }}>
                {member.role}
              </span>
              {member.department && <p className="text-[11px] text-gray-400 mt-1">{member.department}</p>}

              <div className="mt-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                {url ? (
                  <QRCodeSVG id={`qr-${member.id}`} value={url} size={140}
                    bgColor="#ffffff" fgColor="#111827" level="M"
                    imageSettings={{ src: '', height: 0, width: 0, excavate: false }} />
                ) : (
                  <div className="w-[140px] h-[140px] flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 break-all">{url}</p>
            </div>
          </div>

          <button onClick={downloadQR}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Download QR (SVG)
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Member Modal ───────────────────────────────────────────────────────── */
function MemberModal({ member, onSave, onClose }: {
  member: TeamMember | null
  onSave: (m: TeamMember) => void
  onClose: () => void
}) {
  const { departments, addDepartment, removeDepartment, nextEmployeeId } = useTeamStore()
  const isNew       = !member
  const autoEmpId   = isNew ? nextEmployeeId() : member.employeeId

  const [name,   setName]   = useState(member?.name   ?? '')
  const [email,  setEmail]  = useState(member?.email  ?? '')
  const [phone,  setPhone]  = useState(member?.phone  ?? '')
  const [role,   setRole]   = useState(member?.role   ?? ROLES[2])
  const [status, setStatus] = useState<MemberStatus>(member?.status ?? 'active')
  const [avatar, setAvatar] = useState(member?.avatar ?? AVATAR_COLORS[0])
  const [image,  setImage]  = useState(member?.image  ?? '')
  const [bio,    setBio]    = useState(member?.bio    ?? '')
  const [dept,   setDept]   = useState(member?.department ?? '')
  const [pass,   setPass]   = useState('')

  function save() {
    if (!name.trim() || !email.trim()) return
    onSave({
      id:         member?.id ?? uid(),
      employeeId: autoEmpId,
      name:       name.trim(),
      email:      email.trim(),
      phone:      phone.trim(),
      role,
      status,
      joinedAt:   member?.joinedAt ?? new Date().toISOString().slice(0, 10),
      avatar,
      image:      image || undefined,
      bio:        bio.trim() || undefined,
      department: dept || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-[15px] font-bold text-gray-900">{isNew ? 'Add Team Member' : 'Edit Member'}</h2>
            {/* Employee ID chip */}
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
              <Hash size={10} />{autoEmpId}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Photo */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Profile Photo</label>
            <ImageUpload value={image} onChange={setImage} />
          </div>

          {/* Avatar color fallback */}
          {!image && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Avatar Color</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setAvatar(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${avatar === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          )}

          {/* Name + Dept */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Taslima Khatun"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Department</label>
              <DepartmentSelect
                value={dept}
                onChange={setDept}
                departments={departments}
                onAddDept={addDepartment}
                onRemoveDept={removeDepartment}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="employee@shajpori.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="017XXXXXXXX"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>

          {/* Role */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              Permissions set by role.{' '}
              <a href="/admin/roles" className="text-pink-600 hover:underline">Manage roles</a>
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
              placeholder="Short intro shown on the scanned profile page…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none" />
          </div>

          {/* Password (new only) */}
          {isNew && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Temporary Password</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Min 8 characters"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50">
            <div>
              <p className="text-[13px] font-medium text-gray-800">Account Status</p>
              <p className="text-[11px] text-gray-500">Inactive accounts cannot log in</p>
            </div>
            <button type="button" onClick={() => setStatus(s => s === 'active' ? 'inactive' : 'active')}>
              {status === 'active'
                ? <ToggleRight size={28} style={{ color: BRAND }} />
                : <ToggleLeft size={28} className="text-gray-300" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-100">Cancel</button>
          <button onClick={save}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-[13px] font-medium"
            style={{ background: BRAND }}>
            <Check size={14} />{isNew ? 'Add Member' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function TeamPage() {
  const { members, addMember, updateMember, deleteMember, toggleStatus } = useTeamStore()
  const [modal,     setModal]     = useState<TeamMember | null | 'new'>(null)
  const [qrMember,  setQrMember]  = useState<TeamMember | null>(null)
  const [deleteId,  setDeleteId]  = useState<string | null>(null)
  const [search,    setSearch]    = useState('')
  const [roleFilter, setRoleFilter] = useState('All')

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.employeeId.toLowerCase().includes(q)
    ) && (roleFilter === 'All' || m.role === roleFilter)
  })

  const active   = members.filter(m => m.status === 'active').length
  const inactive = members.filter(m => m.status === 'inactive').length

  function saveMember(m: TeamMember) {
    members.find(x => x.id === m.id) ? updateMember(m) : addMember(m)
    setModal(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team Members</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Manage employee accounts, roles, and QR ID cards</p>
        </div>
        <button onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-[13px] font-medium"
          style={{ background: BRAND }}>
          <Plus size={15} /> Add Member
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: members.length, color: '#374151' },
          { label: 'Active',        value: active,         color: '#059669' },
          { label: 'Inactive',      value: inactive,       color: '#9CA3AF' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center gap-4">
            <span className="text-2xl font-black" style={{ color: k.color }}>{k.value}</span>
            <span className="text-[12px] text-gray-500">{k.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or ID…"
            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
          <option value="All">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[56px_1fr_1fr_150px_110px_90px] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          <span />
          <span>Member</span>
          <span>Contact</span>
          <span>Role</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <UserCog size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-[13px] text-gray-400">No members found</p>
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {filtered.map(m => (
            <div key={m.id} className="grid grid-cols-[56px_1fr_1fr_150px_110px_90px] gap-3 items-center px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
              <MemberAvatar member={m} size={40} />

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{m.name}</p>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 shrink-0">
                    <Hash size={8} />{m.employeeId}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {m.department && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Building2 size={9} />{m.department}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-300">
                    Joined {new Date(m.joinedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                </div>
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Mail size={10} className="text-gray-300 shrink-0" />
                  <span className="text-[12px] text-gray-600 truncate">{m.email}</span>
                </div>
                {m.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={10} className="text-gray-300 shrink-0" />
                    <span className="text-[12px] text-gray-500">{m.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                  style={{ background: (ROLE_COLORS[m.role] ?? '#374151') + '15', color: ROLE_COLORS[m.role] ?? '#374151' }}>
                  <ShieldCheck size={10} />{m.role}
                </span>
              </div>

              <div>
                <button onClick={() => toggleStatus(m.id)} className="flex items-center gap-1.5">
                  {m.status === 'active'
                    ? <><ToggleRight size={20} style={{ color: BRAND }} /><span className="text-[11px] font-medium text-green-600">Active</span></>
                    : <><ToggleLeft size={20} className="text-gray-300" /><span className="text-[11px] text-gray-400">Inactive</span></>}
                </button>
              </div>

              <div className="flex items-center justify-end gap-1">
                <button onClick={() => setQrMember(m)} title="View QR"
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-600 transition-colors">
                  <QrCode size={13} />
                </button>
                <button onClick={() => setModal(m)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-600 transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => setDeleteId(m.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modal !== null && (
        <MemberModal member={modal === 'new' ? null : modal} onSave={saveMember} onClose={() => setModal(null)} />
      )}
      {qrMember && <QRModal member={qrMember} onClose={() => setQrMember(null)} />}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <p className="font-bold text-gray-900 text-[15px]">Remove team member?</p>
            <p className="text-[13px] text-gray-500">This will permanently delete their account and revoke all access.</p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { deleteMember(deleteId); setDeleteId(null) }}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
