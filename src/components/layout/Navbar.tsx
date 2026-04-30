'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, User, ShoppingBag, ChevronDown, ChevronRight,
  X, Menu, Heart, Phone, Truck, RotateCcw, MapPin
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useMenuStore } from '@/lib/menuStore'

const BRAND = '#C2185B'

export default function Navbar() {
  const [mega,        setMega]        = useState<string | null>(null)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [mobileExp,   setMobileExp]   = useState<string | null>(null)
  const [query,       setQuery]       = useState('')
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [scrolled,    setScrolled]    = useState(false)
  const [annoBar,     setAnnoBar]     = useState(true)
  const searchRef = useRef<HTMLInputElement>(null)
  const { totalItems, toggleCart } = useCartStore()
  const count = totalItems()
  const { logoDataUrl, storeName, announcement } = useSettingsStore()
  const NAV = useMenuStore(s => s.items)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80)
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) window.location.href = `/products?search=${encodeURIComponent(query.trim())}`
  }

  return (
    <>
      {/* ═══════════════════════════════════════
          TIER 1 — Announcement / utility bar
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {annoBar && (
          <motion.div
            className="relative flex items-center justify-center text-white text-[11px] font-semibold py-2 px-10 gap-6"
            style={{ background: BRAND }}
            initial={{ height: 32, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <span className="hidden sm:flex items-center gap-1.5">
              <Phone size={11} /> 01700-000000
            </span>
            <span className="flex items-center gap-1.5">
              <Truck size={11} />
              {announcement || 'FREE DELIVERY on orders above ৳2,000 — Use code SHAJ10 for 10% off'}
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <MapPin size={11} /> Dhaka, Bangladesh
            </span>
            <button onClick={() => setAnnoBar(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100">
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          TIER 2 — Logo + Search + Icons
      ═══════════════════════════════════════ */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'glass shadow-glass py-1' : 'bg-white/95 border-b border-gray-100 py-0'}`}>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex items-center gap-4 h-[68px]">

          {/* Hamburger (mobile only) */}
          <button className="lg:hidden p-2 -ml-1 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen(v => !v)}>
            <Menu size={22} strokeWidth={1.8} />
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0 flex flex-col leading-none mr-2">
            {logoDataUrl
              ? <img src={logoDataUrl} alt={storeName} className="h-9 max-w-[130px] object-contain" />
              : <>
                  <span className="font-display font-black text-[26px] tracking-tight leading-none" style={{ color: BRAND }}>
                    {storeName}
                  </span>
                  <span className="text-[8.5px] text-gray-400 tracking-[.16em] leading-none mt-0.5 uppercase">beautiful · everytime</span>
                </>
            }
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex mx-4">
            <div className="flex w-full items-center bg-gray-100 hover:bg-gray-200/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#C2185B]/25 transition-all px-4 py-2.5 gap-2">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input ref={searchRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search dresses, bags, jewelry…"
                className="flex-1 text-[13px] bg-transparent outline-none text-gray-700 placeholder-gray-400 min-w-0" />
              {query && (
                <button type="button" onClick={() => setQuery('')}>
                  <X size={13} className="text-gray-400 hover:text-gray-700" />
                </button>
              )}
              <button type="submit"
                className="shrink-0 px-3 py-1 text-[11px] font-bold tracking-widest uppercase text-white ml-1"
                style={{ background: BRAND }}>
                GO
              </button>
            </div>
          </form>

          {/* Icons — right side */}
          <div className="flex items-center gap-0.5 ml-auto shrink-0">
            {/* Mobile search toggle */}
            <button className="sm:hidden p-2.5 text-gray-600 hover:text-[#C2185B] transition-colors"
              onClick={() => setSearchOpen(v => !v)}>
              <Search size={20} strokeWidth={1.6} />
            </button>

            {/* Account */}
            <Link href="/auth"
              className="hidden sm:flex flex-col items-center gap-0 p-2.5 text-gray-600 hover:text-[#C2185B] transition-colors group">
              <User size={20} strokeWidth={1.6} />
              <span className="text-[9px] tracking-wide mt-0.5 hidden lg:block">Account</span>
            </Link>

            {/* Wishlist */}
            <button className="hidden sm:flex flex-col items-center p-2.5 text-gray-600 hover:text-[#C2185B] transition-colors">
              <Heart size={20} strokeWidth={1.6} />
              <span className="text-[9px] tracking-wide mt-0.5 hidden lg:block">Wishlist</span>
            </button>

            {/* Cart */}
            <button onClick={toggleCart}
              className="relative flex flex-col items-center p-2.5 text-gray-600 hover:text-[#C2185B] transition-colors">
              <ShoppingBag size={20} strokeWidth={1.6} />
              <span className="text-[9px] tracking-wide mt-0.5 hidden lg:block">Bag</span>
              {count > 0 && (
                <span className="absolute top-1 right-1 bg-[#C2185B] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">{count}</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar (expandable) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div className="sm:hidden px-4 pb-3 overflow-hidden"
              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
              <form onSubmit={handleSearch} className="flex items-center bg-gray-100 px-4 py-2.5 gap-2">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search products…" autoFocus
                  className="flex-1 text-[13px] bg-transparent outline-none placeholder-gray-400 min-w-0" />
                {query && <button type="button" onClick={() => setQuery('')}><X size={13} className="text-gray-400" /></button>}
                <button type="submit" className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-white" style={{ background: BRAND }}>GO</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════
            TIER 3 — Category navigation (desktop)
        ═══════════════════════════════════════ */}
        <div className="hidden lg:block border-t border-gray-100/50" onMouseLeave={() => setMega(null)}>
          <div className="max-w-[1400px] mx-auto px-6 flex items-center">
            {NAV.map(item => (
              <div key={item.label} className="relative"
                onMouseEnter={() => setMega(item.mega ? item.label : null)}>
                <Link href={item.href}
                  className={`flex items-center gap-1 px-4 py-3.5 text-[13px] font-semibold tracking-wide transition-colors border-b-2 whitespace-nowrap ${
                    mega === item.label
                      ? 'border-[#C2185B] text-[#C2185B]'
                      : 'border-transparent text-gray-700 hover:text-[#C2185B] hover:border-gray-200'
                  } ${item.sale ? '!text-[#C2185B]' : ''}`}>
                  {item.label}
                  {item.mega && (
                    <ChevronDown size={12} className={`opacity-50 transition-transform ${mega === item.label ? 'rotate-180' : ''}`} />
                  )}
                </Link>
              </div>
            ))}

            {/* Right side quick links */}
            <div className="ml-auto flex items-center gap-4 pl-4 border-l border-gray-100">
              <Link href="/products?sale=true"
                className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 text-white transition-opacity hover:opacity-90"
                style={{ background: BRAND }}>
                SALE
              </Link>
              <Link href="/products?badge=New"
                className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 border border-gray-300 text-gray-700 hover:border-gray-500 transition-colors">
                NEW IN
              </Link>
            </div>
          </div>

          {/* Mega dropdown */}
          <AnimatePresence>
            {mega && (() => {
              const active = NAV.find(n => n.label === mega)
              if (!active?.mega) return null
              return (
                <motion.div
                  className="absolute left-0 right-0 glass-card z-50 rounded-b-2xl shadow-modal overflow-hidden border-t border-white/60"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div className="max-w-[1400px] mx-auto px-8 py-7 flex gap-12">
                    {/* Category columns */}
                    {active.mega.cols.map(col => (
                      <div key={col.heading} className="min-w-[160px]">
                        <p className="text-[10px] font-bold tracking-[.18em] uppercase text-gray-400 mb-3">{col.heading}</p>
                        <ul className="space-y-2">
                          {col.links.map(link => (
                            <li key={link.label}>
                              <Link href={link.href} onClick={() => setMega(null)}
                                className="flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-[#C2185B] font-medium transition-colors group">
                                <ChevronRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: BRAND }} />
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {/* Promo tile */}
                    {active.mega.promo && (
                      <div className="ml-auto shrink-0">
                        <Link href={active.href} onClick={() => setMega(null)}>
                          <div className="w-[220px] h-[160px] flex flex-col justify-end p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-xl overflow-hidden relative group"
                            style={{ background: active.mega.promo.color }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative z-10">
                              <p className="text-[10px] font-bold tracking-[.2em] uppercase mb-1"
                                style={{ color: active.mega.promo.accent }}>
                                {active.mega.promo.tag}
                              </p>
                              <p className="font-display text-[20px] font-black text-gray-900 leading-tight">
                                {active.mega.promo.label}
                              </p>
                              <span className="mt-3 text-[11px] font-bold tracking-widest uppercase flex items-center gap-1 opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                                style={{ color: active.mega.promo.accent }}>
                                SHOP NOW <ChevronRight size={12} />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })()}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MOBILE DRAWER
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} />

            {/* Drawer */}
            <motion.div className="fixed top-0 left-0 bottom-0 w-[300px] bg-white z-50 flex flex-col lg:hidden overflow-hidden"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}>

              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex flex-col leading-none">
                  {logoDataUrl
                    ? <img src={logoDataUrl} alt={storeName} className="h-8 object-contain" />
                    : <span className="font-display font-black text-[22px] leading-none" style={{ color: BRAND }}>{storeName}</span>
                  }
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 text-gray-500 hover:text-gray-900">
                  <X size={20} />
                </button>
              </div>

              {/* Drawer nav */}
              <nav className="flex-1 overflow-y-auto">
                {/* Quick links */}
                <div className="px-5 py-3 flex gap-2 border-b border-gray-50">
                  <Link href="/auth" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 hover:text-[#C2185B]">
                    <User size={14} /> My Account
                  </Link>
                  <span className="text-gray-200">|</span>
                  <button className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 hover:text-[#C2185B]"
                    onClick={() => { toggleCart(); setMobileOpen(false) }}>
                    <ShoppingBag size={14} /> Bag {count > 0 && `(${count})`}
                  </button>
                </div>

                {/* Category list with accordion */}
                <div className="divide-y divide-gray-50">
                  {NAV.map(item => (
                    <div key={item.label}>
                      {item.mega ? (
                        <>
                          <button onClick={() => setMobileExp(mobileExp === item.label ? null : item.label)}
                            className="w-full flex items-center justify-between px-5 py-4 text-[14px] font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
                            {item.label}
                            <ChevronDown size={15} className={`text-gray-400 transition-transform ${mobileExp === item.label ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {mobileExp === item.label && (
                              <motion.div className="bg-gray-50 overflow-hidden"
                                initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                transition={{ duration: 0.18 }}>
                                <div className="px-5 py-3 space-y-0">
                                  {item.mega.cols.flatMap(c => c.links).map(link => (
                                    <Link key={link.label} href={link.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="flex items-center gap-2 py-2.5 text-[13px] text-gray-600 hover:text-[#C2185B] transition-colors border-b border-gray-100 last:border-0">
                                      <ChevronRight size={11} className="text-gray-300" />
                                      {link.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link href={item.href} onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between px-5 py-4 text-[14px] font-semibold hover:bg-gray-50 transition-colors ${item.sale ? 'text-[#C2185B]' : 'text-gray-800'}`}>
                          {item.label}
                          <ChevronRight size={14} className="text-gray-300" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </nav>

              {/* Drawer footer */}
              <div className="border-t border-gray-100 px-5 py-4 space-y-2">
                <div className="flex items-center gap-2 text-[12px] text-gray-400">
                  <Truck size={13} /> Free delivery on orders above ৳2,000
                </div>
                <div className="flex items-center gap-2 text-[12px] text-gray-400">
                  <RotateCcw size={13} /> Easy 7-day returns
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
