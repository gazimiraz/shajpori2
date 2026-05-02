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
      { href: '/admin/orders',     label: 'Orders',     icon: ShoppingCart },
      { href: '/admin/products',   label: 'Products',   icon: Package },
      { href: '/admin/attributes', label: 'Attributes', icon: Tag },
      { href: '/admin/inventory',  label: 'Inventory',  icon: Warehouse },
      { href: '/admin/customers',  label: 'Customers',  icon: Users },
      { href: '/admin/purchase',   label: 'Purchase',   icon: ClipboardList },
      { href: '/admin/pos',        label: 'POS',        icon: MonitorSmartphone },
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
  { href: '/',               label: 'View Store', icon: Store,    external: true },
  { href: '/admin/settings', label: 'Settings',   icon: Settings, external: false },
]

const SHORTCUTS = [
  { href: '/admin/dashboard',    label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/orders',       label: 'Orders',     icon: ShoppingCart },
  { href: '/admin/products',     label: 'Products',   icon: Package },
  { href: '/admin/customers',    label: 'Customers',  icon: Users },
  { href: '/admin/pos',          label: 'POS',        icon: MonitorSmartphone },
  { href: '/admin/inventory',    label: 'Inventory',  icon: Warehouse },
  { href: '/admin/purchase',     label: 'Purchase',   icon: Truck },
  { href: '/admin/finance',      label: 'Finance',    icon: DollarSign },
  { href: '/admin/reports',      label: 'Reports',    icon: PieChart },
  { href: '/admin/barcode',      label: 'Barcode',    icon: Barcode },
  { href: '/admin/invoice',      label: 'Invoice',    icon: FileText },
  { href: '/admin/team',         label: 'Team',       icon: UserCog },
  { href: '/admin/menu',         label: 'Menu',       icon: Navigation },
  { href: '/admin/settings',     label: 'Settings',   icon: Settings },
  { href: '/',                   label: 'View Store', icon: Store },
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
        className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${
          open
            ? 'bg-pink-50 border-pink-200 text-[#D81B60]'
            : 'bg-white border-gray-200 text-gray-500 hover:bg-pink-50 hover:border-pink-200 hover:text-[#D81B60]'
        }`}>
        <LayoutGrid size={17} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-[13px] font-bold text-gray-800">Shortcut Menu</p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-px bg-gray-100 p-px">
              {SHORTCUTS.map(({ href, label, icon: Icon }) => (
                <Link key={href + label} href={href} onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-2 py-4 px-2 bg-white hover:bg-pink-50 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center border border-gray-100 group-hover:border-pink-100 transition-colors shadow-sm">
                    <Icon size={17} className="text-gray-500 group-hover:text-[#D81B60] transition-colors" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#D81B60] transition-colors text-center leading-tight">{label}</span>
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
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center gap-3 h-16 shrink-0 border-b border-gray-100 ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm shrink-0 shadow-sm"
          style={{ background: BRAND }}>S</div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="font-black text-[15px] leading-none text-gray-900">Shajpori</p>
            <p className="text-[10px] mt-0.5 font-bold tracking-widest uppercase" style={{ color: BRAND }}>Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-none">
        {NAV.map(({ group, items }) => (
          <div key={group} className={collapsed ? 'px-2' : 'px-3'}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-gray-400 px-2.5 mb-1.5">{group}</p>
            )}
            <div className="space-y-0.5">
              {items.map(({ href, label, icon: Icon }) => {
                const active = path === href || path.startsWith(href + '/')
                return (
                  <Link key={href} href={href} onClick={onNav}
                    className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-[13px] font-medium transition-all group relative ${
                      active
                        ? 'text-[#D81B60] bg-pink-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    } ${collapsed ? 'justify-center' : ''}`}>
                    <Icon size={16} className="shrink-0"
                      style={active ? { color: BRAND } : {}} />
                    {!collapsed && <span>{label}</span>}
                    {!collapsed && active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: BRAND }} />
                    )}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
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

      {/* Bottom links + user card */}
      <div className={`border-t border-gray-100 py-3 space-y-0.5 shrink-0 ${collapsed ? 'px-2' : 'px-3'}`}>
        {BOTTOM.map(({ href, label, icon: Icon, external }) => (
          <Link key={href} href={href} target={external ? '_blank' : undefined} onClick={onNav}
            className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-[13px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <Icon size={15} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {!collapsed && (
          <div className="flex items-center gap-3 px-2.5 py-2.5 mt-1 rounded-lg border border-gray-100 bg-gray-50">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: BRAND }}>A</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-gray-700 truncate leading-none">Admin</p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">admin@shajpori.com</p>
            </div>
            <button className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
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
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [path])

  const pageTitle = path.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'Dashboard'

  return (
    <div className="flex h-screen bg-[#F4F6F9] overflow-hidden">

      {/* Desktop sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col bg-white border-r border-gray-100 shrink-0 overflow-visible"
        animate={{ width: collapsed ? 64 : 232 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
        <SidebarNav collapsed={collapsed} />
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-white z-50 lg:hidden flex flex-col shadow-2xl border-r border-gray-100"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}>
              <SidebarNav collapsed={false} onNav={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileOpen(v => !v)}>
              <Menu size={17} />
            </button>
            <button className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              onClick={() => setCollapsed(v => !v)}>
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="font-bold uppercase tracking-widest text-[10px]" style={{ color: BRAND }}>Admin</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-bold capitalize">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:block text-[11px] font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg">
              {new Date().toLocaleDateString('en-BD', { weekday:'short', day:'numeric', month:'short' })}
            </span>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: BRAND }} />
            </button>
            <ShortcutMenu />
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold cursor-pointer"
              style={{ background: BRAND }}>A</div>
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
