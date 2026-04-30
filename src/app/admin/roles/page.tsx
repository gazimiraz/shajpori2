'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, ShieldCheck, ShieldAlert, Shield } from 'lucide-react'

/* ─── Permission definitions ────────────────────────────────────────────── */
const PERMISSION_GROUPS = [
  {
    group: 'Orders',
    perms: [
      { key: 'orders.view',    label: 'View orders' },
      { key: 'orders.edit',    label: 'Edit / update orders' },
      { key: 'orders.delete',  label: 'Delete orders' },
      { key: 'orders.refund',  label: 'Issue refunds' },
    ],
  },
  {
    group: 'Products',
    perms: [
      { key: 'products.view',   label: 'View products' },
      { key: 'products.create', label: 'Add new products' },
      { key: 'products.edit',   label: 'Edit products' },
      { key: 'products.delete', label: 'Delete products' },
      { key: 'attributes.manage', label: 'Manage attributes (color/size/unit)' },
    ],
  },
  {
    group: 'Inventory',
    perms: [
      { key: 'inventory.view',   label: 'View inventory' },
      { key: 'inventory.adjust', label: 'Adjust stock' },
    ],
  },
  {
    group: 'Customers',
    perms: [
      { key: 'customers.view',   label: 'View customers' },
      { key: 'customers.edit',   label: 'Edit customers' },
      { key: 'customers.delete', label: 'Delete customers' },
    ],
  },
  {
    group: 'Purchase',
    perms: [
      { key: 'purchase.view',   label: 'View purchase orders' },
      { key: 'purchase.create', label: 'Create purchase orders' },
      { key: 'purchase.approve', label: 'Approve purchase orders' },
    ],
  },
  {
    group: 'POS',
    perms: [
      { key: 'pos.use',         label: 'Use POS terminal' },
      { key: 'pos.discount',    label: 'Apply discounts' },
      { key: 'pos.hold',        label: 'Hold / void orders' },
    ],
  },
  {
    group: 'Finance & Reports',
    perms: [
      { key: 'finance.view',    label: 'View finance data' },
      { key: 'reports.view',    label: 'View reports' },
      { key: 'intelligence.view', label: 'View intelligence / AI insights' },
    ],
  },
  {
    group: 'Administration',
    perms: [
      { key: 'team.view',       label: 'View team members' },
      { key: 'team.manage',     label: 'Add / edit / remove team members' },
      { key: 'roles.manage',    label: 'Manage roles & permissions' },
      { key: 'settings.manage', label: 'Edit store settings' },
    ],
  },
]

const ALL_PERM_KEYS = PERMISSION_GROUPS.flatMap(g => g.perms.map(p => p.key))

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Role {
  id: string
  name: string
  description: string
  color: string
  permissions: string[]
  system?: boolean
}

const uid = () => Math.random().toString(36).slice(2, 9)
const BRAND = '#C2185B'

const ROLE_COLORS = [
  '#C2185B', '#7C3AED', '#1D4ED8', '#0F766E', '#B45309',
  '#374151', '#DC2626', '#059669', '#0284C7', '#9333EA',
]

/* ─── Seed roles ─────────────────────────────────────────────────────────── */
const SEED_ROLES: Role[] = [
  {
    id: 'r_admin',
    name: 'Super Admin',
    description: 'Full access to everything',
    color: '#C2185B',
    permissions: ALL_PERM_KEYS,
    system: true,
  },
  {
    id: 'r_manager',
    name: 'Store Manager',
    description: 'Manages day-to-day operations',
    color: '#7C3AED',
    permissions: [
      'orders.view','orders.edit','orders.refund',
      'products.view','products.create','products.edit',
      'attributes.manage',
      'inventory.view','inventory.adjust',
      'customers.view','customers.edit',
      'purchase.view','purchase.create',
      'pos.use','pos.discount','pos.hold',
      'finance.view','reports.view',
      'team.view',
    ],
  },
  {
    id: 'r_sales',
    name: 'Sales Staff',
    description: 'Handles orders and POS',
    color: '#0284C7',
    permissions: [
      'orders.view','orders.edit',
      'customers.view',
      'pos.use','pos.discount',
      'products.view',
      'inventory.view',
    ],
  },
  {
    id: 'r_inventory',
    name: 'Inventory Manager',
    description: 'Manages stock and purchase orders',
    color: '#059669',
    permissions: [
      'inventory.view','inventory.adjust',
      'products.view',
      'purchase.view','purchase.create',
    ],
  },
  {
    id: 'r_accountant',
    name: 'Accountant',
    description: 'View-only access to finance and reports',
    color: '#B45309',
    permissions: [
      'finance.view','reports.view','intelligence.view',
      'orders.view',
    ],
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
   Modal
═══════════════════════════════════════════════════════════════════════════ */
function RoleModal({ role, onSave, onClose }: {
  role: Role | null
  onSave: (r: Role) => void
  onClose: () => void
}) {
  const isNew = !role
  const [name,  setName]  = useState(role?.name ?? '')
  const [desc,  setDesc]  = useState(role?.description ?? '')
  const [color, setColor] = useState(role?.color ?? BRAND)
  const [perms, setPerms] = useState<string[]>(role?.permissions ?? [])

  function toggle(key: string) {
    setPerms(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])
  }
  function toggleGroup(keys: string[]) {
    const allOn = keys.every(k => perms.includes(k))
    setPerms(p => allOn ? p.filter(k => !keys.includes(k)) : Array.from(new Set([...p, ...keys])))
  }
  function selectAll() { setPerms(ALL_PERM_KEYS) }
  function clearAll()  { setPerms([]) }

  function save() {
    if (!name.trim()) return
    onSave({
      id: role?.id ?? uid(),
      name: name.trim(),
      description: desc.trim(),
      color,
      permissions: perms,
      system: role?.system,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
              <ShieldCheck size={16} style={{ color }} />
            </span>
            <h2 className="text-[15px] font-bold text-gray-900">{isNew ? 'Create Role' : 'Edit Role'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Role Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Warehouse Staff"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Badge Color</label>
              <div className="flex gap-2 flex-wrap">
                {ROLE_COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description of this role"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Permissions</label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[11px] text-pink-600 hover:underline">Select all</button>
                <span className="text-gray-300">|</span>
                <button onClick={clearAll}  className="text-[11px] text-gray-400 hover:underline">Clear all</button>
                <span className="ml-2 text-[11px] text-gray-400">{perms.length} / {ALL_PERM_KEYS.length} selected</span>
              </div>
            </div>
            <div className="space-y-4">
              {PERMISSION_GROUPS.map(({ group, perms: gPerms }) => {
                const keys = gPerms.map(p => p.key)
                const allOn = keys.every(k => perms.includes(k))
                const someOn = keys.some(k => perms.includes(k))
                return (
                  <div key={group} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button onClick={() => toggleGroup(keys)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[12px] font-semibold transition-colors ${
                        allOn ? 'bg-pink-50 text-pink-700' : someOn ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-600'
                      }`}>
                      <span>{group}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        allOn ? 'bg-pink-100 text-pink-600' : someOn ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {allOn ? 'All on' : someOn ? 'Partial' : 'Off'}
                      </span>
                    </button>
                    <div className="grid grid-cols-2 gap-0 divide-y divide-x divide-gray-50">
                      {gPerms.map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                          <input type="checkbox" checked={perms.includes(key)} onChange={() => toggle(key)}
                            className="w-3.5 h-3.5 accent-pink-600 cursor-pointer" />
                          <span className="text-[12px] text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={save}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-[13px] font-medium transition-colors"
            style={{ background: BRAND }}>
            <Check size={14} />{isNew ? 'Create Role' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(SEED_ROLES)
  const [modal, setModal] = useState<Role | null | 'new'>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function saveRole(r: Role) {
    setRoles(p => p.find(x => x.id === r.id) ? p.map(x => x.id === r.id ? r : x) : [...p, r])
    setModal(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Define what each role can access</p>
        </div>
        <button onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-[13px] font-medium"
          style={{ background: BRAND }}>
          <Plus size={15} /> New Role
        </button>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: r.color + '18' }}>
                  <ShieldCheck size={18} style={{ color: r.color }} />
                </span>
                <div>
                  <p className="text-[14px] font-bold text-gray-900 leading-tight">{r.name}</p>
                  {r.system && (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">System</span>
                  )}
                </div>
              </div>
              {!r.system && (
                <div className="flex gap-1">
                  <button onClick={() => setModal(r)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteId(r.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            <p className="text-[12px] text-gray-500 leading-relaxed">{r.description}</p>

            {/* Permission summary by group */}
            <div className="space-y-1.5">
              {PERMISSION_GROUPS.map(({ group, perms: gPerms }) => {
                const on = gPerms.filter(p => r.permissions.includes(p.key)).length
                if (on === 0) return null
                const all = gPerms.length
                return (
                  <div key={group} className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(on/all)*100}%`, background: r.color }} />
                    </div>
                    <span className="text-[10px] text-gray-400 w-28 truncate">{group}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{on}/{all}</span>
                  </div>
                )
              })}
            </div>

            <div className="pt-1 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">{r.permissions.length} permissions</span>
              {!r.system && (
                <button onClick={() => setModal(r)}
                  className="text-[11px] font-medium hover:underline" style={{ color: r.color }}>
                  Edit permissions
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Role modal */}
      {modal !== null && (
        <RoleModal
          role={modal === 'new' ? null : modal}
          onSave={saveRole}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ShieldAlert size={18} className="text-red-500" />
              </span>
              <div>
                <p className="font-bold text-gray-900 text-[14px]">Delete role?</p>
                <p className="text-[12px] text-gray-500">Members with this role will lose access.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { setRoles(p => p.filter(r => r.id !== deleteId)); setDeleteId(null) }}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
