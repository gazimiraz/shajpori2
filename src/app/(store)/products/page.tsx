'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import ProductCard from '@/components/store/ProductCard'
import type { Product } from '@/types'

const BRAND = '#C2185B'

const CATEGORIES = ['All', 'Dress', 'Bag', 'Jewelry', 'Accessory', 'Footwear']
const SIZES      = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']
const SORT_OPTS  = [
  { label: 'Newest First',    value: 'new' },
  { label: 'Price: Low–High', value: 'asc' },
  { label: 'Price: High–Low', value: 'desc' },
  { label: 'Best Sellers',    value: 'best' },
]
const PRICE_RANGES = [
  { label: 'All Prices',       min: 0,    max: null   },
  { label: 'Under ৳2,000',    min: 0,    max: 2000   },
  { label: '৳2,000 – ৳5,000', min: 2000, max: 5000   },
  { label: 'Above ৳5,000',    min: 5000, max: null   },
]

function ProductsInner() {
  const searchParams   = useSearchParams()
  const [products,    setProducts]    = useState<Product[]>([])
  const [loading,     setLoading]     = useState(true)
  const [category,    setCategory]    = useState(searchParams.get('category') || 'All')
  const [size,        setSize]        = useState('')
  const [priceIdx,    setPriceIdx]    = useState(0)
  const [sort,        setSort]        = useState(searchParams.get('sort') || 'new')
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [sortOpen,    setSortOpen]    = useState(false)

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (category !== 'All') p.set('category', category)
    const pr = PRICE_RANGES[priceIdx]
    if (pr.max) p.set('maxPrice', String(pr.max))
    fetch(`/api/products?${p}`)
      .then(r => r.json())
      .then(d => {
        let items: Product[] = d.data || []
        if (size) items = items.filter(p => p.available_sizes.includes(size))
        if (sort === 'asc')  items.sort((a, b) => a.price - b.price)
        if (sort === 'desc') items.sort((a, b) => b.price - a.price)
        if (sort === 'best') items.sort((a, b) => b.total_sold - a.total_sold)
        setProducts(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category, size, priceIdx, sort])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const activeFilters = [
    category !== 'All' ? category : null,
    size || null,
    priceIdx > 0 ? PRICE_RANGES[priceIdx].label : null,
  ].filter(Boolean) as string[]

  const clearAll = () => { setCategory('All'); setSize(''); setPriceIdx(0) }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8">

      {/* ── Page header ── */}
      <div className="py-8 border-b border-gray-100">
        <p className="text-[10px] font-bold tracking-[.25em] uppercase text-gray-400 mb-1">Shop</p>
        <h1 className="font-display text-[32px] font-black text-gray-900 leading-none">
          {category === 'All' ? 'All Products' : `${category}s`}
        </h1>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between py-4 gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter toggle (mobile) */}
          <button onClick={() => setFilterOpen(v => !v)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[12px] font-semibold text-gray-700 hover:border-gray-400 transition-colors">
            <SlidersHorizontal size={13} /> Filters
          </button>

          {/* Active filter chips */}
          {activeFilters.map(f => (
            <span key={f} className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-[11px] font-semibold text-gray-700 bg-white">
              {f}
              <button onClick={() => {
                if (f === category) setCategory('All')
                else if (f === size) setSize('')
                else setPriceIdx(0)
              }}>
                <X size={11} className="ml-0.5 text-gray-400 hover:text-gray-800" />
              </button>
            </span>
          ))}
          {activeFilters.length > 0 && (
            <button onClick={clearAll} className="text-[11px] text-gray-400 hover:text-gray-700 underline underline-offset-2">
              Clear all
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[12px] text-gray-400 hidden sm:block">{products.length} products</span>
          {/* Sort */}
          <div className="relative">
            <button onClick={() => setSortOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[12px] font-semibold text-gray-700 hover:border-gray-400 transition-colors">
              {SORT_OPTS.find(s => s.value === sort)?.label}
              <ChevronDown size={12} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div className="absolute right-0 top-[calc(100%+4px)] bg-white border border-gray-200 shadow-md z-20 min-w-[180px]"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}>
                  {SORT_OPTS.map(opt => (
                    <button key={opt.value} onClick={() => { setSort(opt.value); setSortOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-[12px] font-medium transition-colors ${sort === opt.value ? 'bg-gray-50 text-[#C2185B]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex gap-8 pb-16">

        {/* ── Sidebar filters (desktop) ── */}
        <aside className="w-[200px] shrink-0 hidden lg:block">
          <div className="sticky top-[130px] space-y-7">

            {/* Category */}
            <div>
              <p className="text-[10px] font-bold tracking-[.18em] uppercase text-gray-400 mb-3">Category</p>
              <div className="space-y-0.5">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`w-full text-left px-2 py-1.5 text-[13px] font-medium transition-colors ${
                      category === c ? 'text-[#C2185B] font-semibold' : 'text-gray-600 hover:text-gray-900'
                    }`}>
                    {c === 'All' ? 'All Products' : `${c}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <p className="text-[10px] font-bold tracking-[.18em] uppercase text-gray-400 mb-3">Size</p>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map(s => (
                  <button key={s} onClick={() => setSize(size === s ? '' : s)}
                    className={`px-2.5 py-1.5 text-[11px] font-semibold border transition-colors ${
                      size === s ? 'border-[#C2185B] bg-[#FFF0F4] text-[#C2185B]' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-[10px] font-bold tracking-[.18em] uppercase text-gray-400 mb-3">Price</p>
              <div className="space-y-0.5">
                {PRICE_RANGES.map((pr, i) => (
                  <button key={pr.label} onClick={() => setPriceIdx(i)}
                    className={`w-full text-left px-2 py-1.5 text-[13px] font-medium transition-colors ${
                      priceIdx === i ? 'text-[#C2185B] font-semibold' : 'text-gray-600 hover:text-gray-900'
                    }`}>
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Mobile filter drawer ── */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div className="fixed inset-0 z-50 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/30" onClick={() => setFilterOpen(false)} />
              <motion.aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-white overflow-y-auto p-6 space-y-7"
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.22 }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900 text-[15px]">Filters</p>
                  <button onClick={() => setFilterOpen(false)}><X size={18} className="text-gray-600" /></button>
                </div>
                {/* same filter blocks */}
                <div>
                  <p className="text-[10px] font-bold tracking-[.18em] uppercase text-gray-400 mb-3">Category</p>
                  <div className="space-y-0.5">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => { setCategory(c); setFilterOpen(false) }}
                        className={`w-full text-left px-2 py-2 text-[14px] font-medium ${category === c ? 'text-[#C2185B]' : 'text-gray-600'}`}>
                        {c === 'All' ? 'All Products' : `${c}s`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[.18em] uppercase text-gray-400 mb-3">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map(s => (
                      <button key={s} onClick={() => setSize(size === s ? '' : s)}
                        className={`px-3 py-1.5 text-[12px] font-semibold border ${size === s ? 'border-[#C2185B] text-[#C2185B]' : 'border-gray-200 text-gray-500'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[.18em] uppercase text-gray-400 mb-3">Price</p>
                  {PRICE_RANGES.map((pr, i) => (
                    <button key={pr.label} onClick={() => { setPriceIdx(i); setFilterOpen(false) }}
                      className={`w-full text-left px-2 py-2 text-[14px] font-medium ${priceIdx === i ? 'text-[#C2185B]' : 'text-gray-600'}`}>
                      {pr.label}
                    </button>
                  ))}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Product grid ── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 border border-gray-200 flex items-center justify-center mb-5 text-2xl">
                🔍
              </div>
              <p className="font-display text-[20px] font-black text-gray-900 mb-1">No products found</p>
              <p className="text-[13px] text-gray-400 mb-5">Try adjusting your filters</p>
              <button onClick={clearAll} className="px-6 py-2.5 text-[12px] font-bold tracking-widest uppercase text-white" style={{ background: BRAND }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
              initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {products.map(p => (
                <motion.div key={p.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array(8).fill(0).map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />)}
        </div>
      </div>
    }>
      <ProductsInner />
    </Suspense>
  )
}
