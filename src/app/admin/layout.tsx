'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  DollarSign, BarChart3, LogOut, Menu, X,
  Users, Bell, Settings, Cpu, ClipboardList,
  ChevronLeft, Store, ChevronRight, MonitorSmartphone, Tag,
  UserCog, ShieldCheck
} from 'lucide-react'

const BRAND = '#C2185B'

const NAV = [
  {
    group: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Store',
    items: [
      { href: '/admin/orders',    label: 'Orders',    icon: ShoppingCart },
      { href: '/admin/products',    label: 'Products',    icon: Package },
      { href: '/admin/attributes',  label: 'Attributes',  icon: Tag },
      { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/purchase',  label: 'Purchase',  icon: ClipboardList },
      { href: '/admin/pos',       label: 'POS',       icon: MonitorSmartphone },
    ],
  },
  {
    group: 'Analytics',
    items: [
      { href: '/admin/finance',      label: 'Finance',      icon: DollarSign },
      { href: '/admin/reports',      label: 'Reports',      icon: BarChart3 },
      { href: '/admin/intelligence', label: 'Intelligence', icon: Cpu },
    ],
  },
  {
    group: 'Administration',
    items: [
      { href: '/admin/team',  label: 'Team Members', icon: UserCog },
      { href: '/admin/roles', label: 'Roles',        icon: ShieldCheck },
    ],
  },
]

const BOTTOM = [
  { href: '/',               label: 'View Store',  icon: Store,    external: true },
  { href: '/admin/settings', label: 'Settings',    icon: Settings, external: false },
]

function SidebarNav({ collapsed, onNav }: { collapsed: boolean; onNav?: () => void }) {
  const path = usePathname()
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand */}
      <div className={`flex items-center gap-3 h-16 shrink-0 border-b border-white/[0.07] ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm shrink-0" style={{ background: BRAND }}>S</div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="text-white font-bold text-[14px] leading-none tracking-tight">Shajpori</p>
            <p className="text-white/30 text-[10px] mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-5 scrollbar-none">
        {NAV.map(({ group, items }) => (
          <div key={group} className={collapsed ? 'px-2' : 'px-3'}>
            {!collapsed && (
              <p className="text-[9.5px] font-bold uppercase tracking-[.18em] text-white/25 px-2.5 mb-1.5">{group}</p>
            )}
            <div className="space-y-0.5">
              {items.map(({ href, label, icon: Icon }) => {
                const active = path === href || path.startsWith(href + '/')
                return (
                  <Link key={href} href={href} onClick={onNav}
                    className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-[13px] font-medium transition-all group relative ${
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-white/45 hover:text-white/80 hover:bg-white/[0.06]'
                    } ${collapsed ? 'justify-center' : ''}`}>
                    <Icon size={16} className={`shrink-0 transition-colors ${active ? '' : 'group-hover:text-white/60'}`}
                      style={active ? { color: '#FF6BA8' } : {}} />
                    {!collapsed && <span>{label}</span>}
                    {!collapsed && active && <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#FF6BA8' }} />}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[11px] font-semibold rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                        {label}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom links */}
      <div className={`border-t border-white/[0.07] py-3 space-y-0.5 shrink-0 ${collapsed ? 'px-2' : 'px-3'}`}>
        {BOTTOM.map(({ href, label, icon: Icon, external }) => (
          <Link key={href} href={href} target={external ? '_blank' : undefined} onClick={onNav}
            className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-[13px] font-medium text-white/35 hover:text-white/70 hover:bg-white/[0.06] transition-all ${collapsed ? 'justify-center' : ''}`}>
            <Icon size={15} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {/* User card */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-2.5 py-2.5 mt-1 rounded-lg border border-white/[0.08] bg-white/[0.04]">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: BRAND }}>A</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white/75 truncate leading-none">Admin</p>
              <p className="text-[10px] text-white/30 mt-0.5 truncate">admin@shajpori.com</p>
            </div>
            <button className="text-white/25 hover:text-white/60 transition-colors shrink-0">
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [path])

  const pageTitle = path.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'Dashboard'

  return (
    <div className="flex h-screen bg-[#F4F6F9] overflow-hidden">

      {/* ── Desktop sidebar ─────────────────────────── */}
      <motion.aside
        className="hidden lg:flex flex-col bg-[#111827] shrink-0 overflow-visible"
        animate={{ width: collapsed ? 64 : 228 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
        <SidebarNav collapsed={collapsed} />
      </motion.aside>

      {/* ── Mobile sidebar overlay ───────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#111827] z-50 lg:hidden flex flex-col"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.24 }}>
              <SidebarNav collapsed={false} onNav={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(v => !v)}>
              <Menu size={18} />
            </button>
            {/* Desktop collapse toggle */}
            <button className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setCollapsed(v => !v)}>
              {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
              <span className="text-gray-500 font-medium">Admin</span>
              <span>/</span>
              <span className="text-gray-800 font-semibold capitalize">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Date */}
            <span className="hidden md:block text-[11px] text-gray-400">
              {new Date().toLocaleDateString('en-BD', { weekday:'short', day:'numeric', month:'short' })}
            </span>
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: BRAND }} />
            </button>
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold cursor-pointer" style={{ background: BRAND }}>A</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
