'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, User, ShoppingCart, ChevronDown, ChevronRight,
  X, Menu, Heart, Phone, Truck, RotateCcw, MapPin,
  LayoutGrid, Tag, Star, Calendar, Gift
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useMenuStore } from '@/lib/menuStore'

const BRAND = '#FF66A3'

export default function Navbar() {
  const [mega,        setMega]        = useState<string | null>(null)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [mobileExp,   setMobileExp]   = useState<string | null>(null)
  const [query,       setQuery]       = useState('')
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [scrolled,    setScrolled]    = useState(false)
  const [mounted,     setMounted]     = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const { totalItems, toggleCart } = useCartStore()
  const count = totalItems()
  const { logoDataUrl, storeName } = useSettingsStore()
  const NAV = useMenuStore(s => s.items)

  useEffect(() => {
    setMounted(true)
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
    <div className="w-full bg-white flex flex-col relative z-50">
      
      {/* ═══════════════════════════════════════
          TIER 1 — Solid Pink Top Bar
      ═══════════════════════════════════════ */}
      <div className="w-full h-8 bg-[#FF66A3]" />

      {/* ═══════════════════════════════════════
          TIER 2 — Logo, Search, Action Icons
      ═══════════════════════════════════════ */}
      <div className={`transition-all duration-300 ${scrolled ? 'fixed top-0 left-0 right-0 glass shadow-sm border-b border-gray-100 z-50 py-1' : 'py-5'}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-6 sm:gap-10">
          
          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-[#FF66A3] transition-colors"
            onClick={() => setMobileOpen(v => !v)}>
            <Menu size={24} strokeWidth={1.8} />
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0 flex flex-col leading-none">
            {logoDataUrl ? (
              <img src={logoDataUrl} alt={storeName} className="h-10 max-w-[150px] object-contain" />
            ) : (
              <span className="font-display font-black text-[32px] tracking-tight leading-none text-gray-900">
                {storeName}
              </span>
            )}
          </Link>

          {/* Large Search Bar (Desktop) */}
          <div className="flex-1 max-w-3xl hidden md:block mx-auto">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter product name..."
                className="w-full h-11 pl-5 pr-14 text-[14px] text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg outline-none focus:border-[#FF66A3] focus:ring-1 focus:ring-[#FF66A3]/30 transition-all shadow-sm"
              />
              <button type="submit" className="absolute right-4 text-gray-500 hover:text-[#FF66A3] transition-colors">
                <Search size={20} strokeWidth={2} />
              </button>
            </form>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-5 sm:gap-8 shrink-0">
            {/* Mobile search toggle */}
            <button className="md:hidden p-2 text-gray-600 hover:text-[#FF66A3] transition-colors"
              onClick={() => setSearchOpen(v => !v)}>
              <Search size={22} strokeWidth={1.8} />
            </button>

            <Link href="/auth" className="hidden sm:flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full border border-gray-100 bg-white flex items-center justify-center text-[#FF66A3] group-hover:border-[#FF66A3]/30 group-hover:shadow-sm transition-all">
                <User size={18} strokeWidth={2.2} />
              </div>
              <span className="text-[11px] text-gray-500 font-medium group-hover:text-[#FF66A3]">Account</span>
            </Link>
            
            <Link href="/wishlist" className="hidden sm:flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full border border-gray-100 bg-white flex items-center justify-center text-[#FF66A3] group-hover:border-[#FF66A3]/30 group-hover:shadow-sm transition-all">
                <Heart size={18} strokeWidth={2.2} className="fill-[#FF66A3] text-[#FF66A3]" />
              </div>
              <span className="text-[11px] text-gray-500 font-medium group-hover:text-[#FF66A3]">Wishlist</span>
            </Link>

            <button onClick={toggleCart} className="flex flex-col items-center gap-1 group relative">
              <div className="w-10 h-10 rounded-full border border-gray-100 bg-white flex items-center justify-center text-[#FF66A3] group-hover:border-[#FF66A3]/30 group-hover:shadow-sm transition-all relative">
                <ShoppingCart size={18} strokeWidth={2.2} className="fill-[#FF66A3] text-[#FF66A3]" />
                {mounted && count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FF66A3] text-white text-[10px] font-bold min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center leading-none border-2 border-white shadow-sm">
                    {count}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-500 font-medium group-hover:text-[#FF66A3]">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div className="md:hidden px-4 pb-4 overflow-hidden"
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <form onSubmit={handleSearch} className="relative flex items-center mt-2">
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Enter product name..." autoFocus
                  className="w-full h-11 pl-4 pr-12 text-[14px] text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg outline-none focus:border-[#FF66A3] transition-all" />
                <button type="submit" className="absolute right-4 text-gray-500 hover:text-[#FF66A3]">
                  <Search size={18} strokeWidth={2} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════
          TIER 3 — Menu Bar (Pills & Categories)
      ═══════════════════════════════════════ */}
      {!scrolled && (
        <div className="border-t border-b border-gray-100 bg-white hidden lg:block">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-2 flex items-center gap-3">
            
            {/* All Categories Dropdown Button */}
            <div className="relative" onMouseLeave={() => setMega(null)}>
              <button 
                onMouseEnter={() => setMega('categories')}
                className="flex items-center justify-between w-[220px] bg-[#FF66A3] hover:bg-[#F4518C] text-white px-4 py-2.5 rounded-md font-medium text-[14.5px] transition-colors shadow-sm cursor-pointer">
                <span className="flex items-center gap-2">
                  <LayoutGrid size={18} strokeWidth={2} />
                  All Categories
                </span>
                <ChevronDown size={16} />
              </button>

              {/* Dropdown Menu (Re-using NAV structure for categories) */}
              <AnimatePresence>
                {mega === 'categories' && (
                  <motion.div
                    className="absolute top-full left-0 w-full bg-white z-50 rounded-b-lg shadow-xl border border-gray-100 overflow-hidden"
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}>
                    <div className="py-2 flex flex-col">
                      {NAV.map(item => (
                        <Link key={item.label} href={item.href} className="px-5 py-2.5 text-[14px] text-gray-700 hover:text-[#FF66A3] hover:bg-pink-50 transition-colors flex justify-between items-center group">
                          {item.label}
                          {item.mega && <ChevronRight size={14} className="text-gray-300 group-hover:text-[#FF66A3]" />}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Pills */}
            <div className="flex items-center gap-2 ml-2">
              {[
                { label: 'All Brands', icon: Tag, href: '/brands', active: true },
                { label: 'Promotion', icon: Tag, href: '/promotion' },
                { label: 'Featured Product', icon: Star, href: '/products?featured=true' },
                { label: 'Preorder', icon: Calendar, href: '/preorder' },
                { label: 'Buy 1 Get 1', icon: Gift, href: '/bogo' },
              ].map((pill) => (
                <Link key={pill.label} href={pill.href} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border ${pill.active ? 'border-pink-200 text-[#FF66A3] bg-pink-50/50' : 'border-gray-200 text-gray-600 hover:border-pink-300 hover:text-[#FF66A3] hover:bg-pink-50'} transition-all`}>
                  <pill.icon size={16} strokeWidth={pill.active ? 2.5 : 1.5} className={pill.active ? "text-[#FF66A3]" : "text-gray-500"} />
                  <span className={`text-[13.5px] ${pill.active ? 'font-semibold' : 'font-medium'}`}>{pill.label}</span>
                </Link>
              ))}
            </div>

            {/* Track Order */}
            <Link href="/track" className="ml-auto flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 hover:border-[#FF66A3] text-gray-500 hover:text-[#FF66A3] transition-all group">
              <Truck size={18} strokeWidth={2} className="text-[#FF66A3] group-hover:scale-110 transition-transform" />
              <span className="text-[13px] font-bold tracking-wide uppercase text-gray-600 group-hover:text-[#FF66A3]">Track Order</span>
            </Link>

          </div>
        </div>
      )}

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
            <motion.div className="fixed top-0 left-0 bottom-0 w-[320px] max-w-[85vw] bg-white z-50 flex flex-col lg:hidden overflow-hidden shadow-2xl rounded-r-2xl"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}>

              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-pink-50">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex flex-col leading-none">
                  {logoDataUrl
                    ? <img src={logoDataUrl} alt={storeName} className="h-8 object-contain" />
                    : <span className="font-display font-black text-[24px] leading-none text-gray-900">{storeName}</span>
                  }
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-[#FF66A3] bg-gray-50 hover:bg-pink-50 rounded-full transition-colors">
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              {/* Drawer nav */}
              <nav className="flex-1 overflow-y-auto">
                {/* Quick links */}
                <div className="px-6 py-5 grid grid-cols-2 gap-3 border-b border-gray-50">
                  <Link href="/auth" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 hover:bg-pink-50 text-[13px] font-semibold text-gray-700 hover:text-[#FF66A3] transition-colors">
                    <User size={16} /> Account
                  </Link>
                  <button onClick={() => { toggleCart(); setMobileOpen(false) }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 hover:bg-pink-50 text-[13px] font-semibold text-gray-700 hover:text-[#FF66A3] transition-colors relative">
                    <ShoppingCart size={16} /> Cart
                    {mounted && count > 0 && (
                      <span className="absolute top-1.5 right-3 bg-[#FF66A3] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">{count}</span>
                    )}
                  </button>
                </div>

                {/* Category list with accordion */}
                <div className="px-4 py-3 space-y-1">
                  {NAV.map(item => (
                    <div key={item.label}>
                      {item.mega ? (
                        <>
                          <button onClick={() => setMobileExp(mobileExp === item.label ? null : item.label)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[14px] font-bold transition-colors ${mobileExp === item.label ? 'bg-pink-50/50 text-[#FF66A3]' : 'text-gray-800 hover:bg-gray-50'}`}>
                            {item.label}
                            <ChevronDown size={16} className={`transition-transform ${mobileExp === item.label ? 'rotate-180 text-[#FF66A3]' : 'text-gray-400'}`} />
                          </button>
                          <AnimatePresence>
                            {mobileExp === item.label && (
                              <motion.div className="overflow-hidden"
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}>
                                <div className="px-4 py-2 mb-2 ml-4 border-l-2 border-pink-100 space-y-1">
                                  {item.mega.cols.flatMap(c => c.links).map(link => (
                                    <Link key={link.label} href={link.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="flex items-center gap-3 py-2 px-3 rounded-lg text-[13.5px] font-medium text-gray-600 hover:text-[#FF66A3] hover:bg-pink-50 transition-all">
                                      <span className="w-1 h-1 rounded-full bg-[#FF66A3]/40" />
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
                          className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-[14px] font-bold hover:bg-gray-50 transition-colors ${item.sale ? 'text-sale' : 'text-gray-800'}`}>
                          {item.label}
                          <ChevronRight size={16} className="text-gray-300" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
