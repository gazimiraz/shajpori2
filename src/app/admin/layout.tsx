'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  DollarSign, BarChart3, LogOut, Menu, X,
  Users, Bell, Settings, Cpu, ClipboardList,
  ChevronLeft, Store, ChevronRight, MonitorSmartphone, Tag,
  UserCog, ShieldCheck, LayoutGrid, Barcode, FileText,
  Navigation, PieChart, Truck
} from 'lucide-react'

const BRAND = '#D81B60'
const BRAND_GRADIENT = 'linear-gradient(135deg, #D81B60, #F06292)'

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

const SHORTCUTS = [
  { href: '/admin/dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/orders',       label: 'Orders',       icon: ShoppingCart },
  { href: '/admin/products',     label: 'Products',     icon: Package },
  { href: '/admin/customers',    label: 'Customers',    icon: Users },
  { href: '/admin/pos',          label: 'POS',          icon: MonitorSmartphone },
  { href: '/admin/inventory',    label: 'Inventory',    icon: Warehouse },
  { href: '/admin/purchase',     label: 'Purchase',     icon: Truck },
  { href: '/admin/finance',      label: 'Finance',      icon: DollarSign },
  { href: '/admin/reports',      label: 'Reports',      icon: PieChart },
  { href: '/admin/barcode',      label: 'Barcode',      icon: Barcode },
  { href: '/admin/invoice',      label: 'Invoice',      icon: FileText },
  { href: '/admin/team',         label: 'Team',         icon: UserCog },
  { href: '/admin/menu',         label: 'Menu',         icon: Navigation },
  { href: '/admin/settings',     label: 'Settings',     icon: Settings },
  { href: '/', label: 'View Store', icon: Store },
]

function ShortcutMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
          open ? 'bg-pink-50 text-brand' : 'bg-gray-50 text-gray-500 hover:bg-pink-50 hover:text-brand'
        }`}>
        <LayoutGrid size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-[13px] font-bold text-gray-800">Shortcut Menu</p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={14} />
              </button>
            </div>
            {/* Grid */}
            <div className="grid grid-cols-3 gap-px bg-gray-100 p-px">
              {SHORTCUTS.map(({ href, label, icon: Icon }) => (
                <Link key={href + label} href={href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-2 py-4 px-2 bg-white hover:bg-pink-50 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors shadow-sm border border-gray-100 group-hover:border-pink-100">
                    <Icon size={18} className="text-gray-500 group-hover:text-brand transition-colors" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 group-hover:text-brand transition-colors text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SidebarNav({ collapsed, onNav }: { collapsed: boolean; onNav?: () => void }) {
  const path = usePathname()
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand */}
      <div className={`flex items-center gap-3 h-20 shrink-0 border-b border-white/[0.07] ${collapsed ? 'justify-center px-3' : 'px-6'}`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-lg" style={{ backgroundImage: BRAND_GRADIENT }}>S</div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="text-white font-display font-black text-[16px] leading-none tracking-tight">Shajpori</p>
            <p className="text-brand text-[10px] mt-0.5 font-bold tracking-widest uppercase">Admin</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-none">
        {NAV.map(({ group, items }) => (
          <div key={group} className={collapsed ? 'px-3' : 'px-4'}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/30 px-3 mb-2">{group}</p>
            )}
            <div className="space-y-1">
              {items.map(({ href, label, icon: Icon }) => {
                const active = path === href || path.startsWith(href + '/')
                return (
                  <Link key={href} href={href} onClick={onNav}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group relative ${
                      active
                        ? 'text-white shadow-md'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                    } ${collapsed ? 'justify-center' : ''}`}
                    style={active ? { backgroundImage: BRAND_GRADIENT } : {}}>
                    <Icon size={18} className={`shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {!collapsed && <span>{label}</span>}
                    {collapsed && (
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-white text-gray-900 text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl drop-shadow-md border border-gray-100">
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
          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl border border-white/10 bg-white/5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-sm" style={{ backgroundImage: BRAND_GRADIENT }}>A</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white/90 truncate leading-tight">Admin User</p>
              <p className="text-[10px] text-brand mt-0.5 truncate font-medium">admin@shajpori.com</p>
            </div>
            <button className="text-white/40 hover:text-pink-400 transition-colors shrink-0 p-1 hover:bg-white/10 rounded-lg">
              <LogOut size={14} />
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Desktop sidebar ─────────────────────────── */}
      <motion.aside
        className="hidden lg:flex flex-col bg-[#0A0A0A] shrink-0 overflow-visible relative"
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #D81B60 0%, transparent 70%)' }} />
        <div className="relative z-10 h-full flex flex-col">
          <SidebarNav collapsed={collapsed} />
        </div>
      </motion.aside>

      {/* ── Mobile sidebar overlay ───────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#0A0A0A] z-50 lg:hidden flex flex-col shadow-2xl rounded-r-2xl overflow-hidden"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}>
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #D81B60 0%, transparent 70%)' }} />
              <div className="relative z-10 h-full flex flex-col">
                <SidebarNav collapsed={false} onNav={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 shadow-sm relative z-20">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-brand transition-colors"
              onClick={() => setMobileOpen(v => !v)}>
              <Menu size={18} />
            </button>
            {/* Desktop collapse toggle */}
            <button className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-brand transition-colors"
              onClick={() => setCollapsed(v => !v)}>
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[13px] text-gray-400">
              <span className="text-brand font-bold uppercase tracking-widest text-[11px]">Admin</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-black font-display text-[16px] capitalize">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Date */}
            <span className="hidden md:block text-[12px] font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              {new Date().toLocaleDateString('en-BD', { weekday:'short', day:'numeric', month:'short' })}
            </span>
            {/* Notification bell */}
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:text-brand hover:bg-pink-50 transition-colors">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border border-white" style={{ backgroundImage: BRAND_GRADIENT }} />
            </button>
            {/* Shortcut menu */}
            <ShortcutMenu />
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[13px] font-bold cursor-pointer shadow-sm hover:scale-105 transition-transform" style={{ backgroundImage: BRAND_GRADIENT }}>A</div>
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
