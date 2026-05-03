'use client'
import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Star, Truck, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import type { Product, ProductVariant } from '@/types'

const BRAND = '#D81B60'
const BRAND_GRADIENT = 'linear-gradient(135deg, #D81B60, #F06292)'

const SWATCHES: Record<string, string> = {
  'Blush Pink':'#FFB6C1','Bubblegum Pink':'#FF69B4','Sage Green':'#B2C9AD',
  'Sky Blue':'#87CEEB','Coral Orange':'#FF7F50','Deep Burgundy':'#800020',
  'Ivory White':'#F5F5DC','Black Onyx':'#111111','Cream':'#FFFDD0',
  'Dusty Rose':'#DCAE96','Cobalt Blue':'#0047AB','Cotton Candy Pink':'#FFB7D5',
  'Lavender Mist':'#C4A8E1','Butter Yellow':'#FFFACD','Rose Gold':'#B76E79',
  'Gold':'#D4AF37','Silver':'#AAAAAA','Black':'#111111','White':'#FFFFFF',
  'Natural':'#D4C5A9','Tan':'#D2B48C','Caramel':'#C68642','Burgundy':'#800020',
  'Rust Orange':'#B7410E','Multicolor':'linear-gradient(135deg,#FF69B4,#87CEEB,#FFD700)',
  'Pastel':'#F5D6E0','Classic':'#888888','Navy Blue':'#001F5B',
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [product,       setProduct]       = useState<Product | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [selectedSize,  setSelectedSize]  = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedVar,   setSelectedVar]   = useState<ProductVariant | null>(null)
  const [wishlist,      setWishlist]      = useState(false)
  const [isAdding,      setIsAdding]      = useState(false)
  const [activeImg,     setActiveImg]     = useState(0)
  const [zoomed,        setZoomed]        = useState(false)
  const { addItem, openCart } = useCartStore()

  useEffect(() => {
    fetch(`/api/products?search=${slug}`)
      .then(r => r.json())
      .then(d => {
        const p: Product = d.data?.[0] || null
        setProduct(p)
        if (p) { setSelectedSize(p.available_sizes[0] || ''); setSelectedColor(p.colors[0] || '') }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!product?.variants) return
    setSelectedVar(product.variants.find(v => v.size === selectedSize && v.color === selectedColor && v.is_active) || null)
  }, [selectedSize, selectedColor, product])

  const handleAdd = () => {
    if (!product) return
    setIsAdding(true)
    addItem({
      product_id: product.id, variant_id: selectedVar?.id,
      name: product.name, slug: product.slug,
      size: selectedSize, color: selectedColor,
      image_url: product.thumbnail_url || product.image_urls[0],
      price: product.price + (selectedVar?.price_modifier || 0), qty: 1,
    })
    toast.success(`${product.name} added to bag!`)
    setTimeout(() => { setIsAdding(false); openCart() }, 600)
  }

  const stock = selectedVar?.stock_quantity ?? product?.total_stock ?? 0
  const effectivePrice = (product?.price || 0) + (selectedVar?.price_modifier || 0)
  const imgs = product?.image_urls || []
  const prevImg = () => setActiveImg(v => (v - 1 + imgs.length) % imgs.length)
  const nextImg = () => setActiveImg(v => (v + 1) % imgs.length)

  if (loading) return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
        <div className="space-y-4 pt-4">
          {[80, 200, 100, 160, 120].map((w, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded" style={{ height: 20, width: w }} />
          ))}
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="max-w-[1400px] mx-auto px-6 py-24 text-center">
      <p className="text-[48px] mb-4">😕</p>
      <h2 className="font-display text-[24px] font-black text-gray-900 mb-4">Product not found</h2>
      <Link href="/products" className="text-[13px] font-semibold" style={{ color: BRAND }}>← Back to Shop</Link>
    </div>
  )

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8">

      {/* Breadcrumb */}
      <nav className="py-4 flex items-center gap-2 text-[12px] text-gray-400">
        <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-700 transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-gray-700 transition-colors">{product.category}s</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 pb-20">

        {/* ── Gallery ── */}
        <div>
          <div className="relative bg-[#F5F5F3] overflow-hidden aspect-[3/4] group rounded-2xl">
            <AnimatePresence mode="wait">
              {imgs.length > 0 ? (
                <motion.div key={activeImg} className="absolute inset-0"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                  <Image src={imgs[activeImg]} alt={product.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[80px] opacity-10">
                  {product.category === 'Dress' ? '👗' : product.category === 'Bag' ? '👜' : product.category === 'Jewelry' ? '💍' : '✨'}
                </div>
              )}
            </AnimatePresence>

            {/* Badge */}
            {product.badge && (
              <span className={`absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full z-10 shadow-sm ${
                product.badge === 'Sale' ? 'bg-sale text-white' : 'bg-[#111] text-white'
              }`}>{product.badge}</span>
            )}

            {/* Zoom icon */}
            <button onClick={() => setZoomed(true)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-105 z-10 text-gray-600 hover:text-brand">
              <ZoomIn size={16} />
            </button>

            {/* Nav arrows */}
            {imgs.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all shadow-sm hover:scale-105 text-gray-600 hover:text-brand opacity-0 group-hover:opacity-100">
                  <ChevronLeft size={20} strokeWidth={1.5} />
                </button>
                <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all shadow-sm hover:scale-105 text-gray-600 hover:text-brand opacity-0 group-hover:opacity-100">
                  <ChevronRight size={20} strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {imgs.length > 1 && (
            <div className="flex gap-3 mt-4">
              {imgs.map((url, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImg === i ? 'border-brand shadow-md scale-[1.02]' : 'border-transparent hover:border-brand/40 hover:scale-[1.01]'
                  }`}>
                  <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ── */}
        <div className="lg:pt-2">
          <p className="text-[10px] font-bold tracking-[.22em] uppercase text-gray-400 mb-2">{product.category}</p>
          <h1 className="font-display text-[26px] sm:text-[32px] font-black text-gray-900 leading-tight mb-3">{product.name}</h1>

          {/* Rating */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className={i < Math.round(product.rating_avg) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
                ))}
              </div>
              <span className="text-[12px] text-gray-400">({product.rating_count} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="font-display text-[28px] font-black text-gray-900">৳{effectivePrice.toLocaleString()}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <>
                <span className="text-[16px] text-gray-400 line-through">৳{product.compare_at_price.toLocaleString()}</span>
                <span className="text-[12px] font-bold text-red-500">
                  {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {product.short_description && (
            <p className="text-[13px] text-gray-500 leading-relaxed mb-6 max-w-[460px]">{product.short_description}</p>
          )}

          {/* Color */}
          {product.colors.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                Color: <span className="font-semibold text-gray-900">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map(c => {
                  const swatch = SWATCHES[c]
                  const isGradient = swatch?.startsWith('linear')
                  return (
                    <button key={c} onClick={() => setSelectedColor(c)} title={c}
                      className={`w-8 h-8 rounded-full border-[2.5px] transition-all shadow-sm hover:scale-110 ${
                        selectedColor === c ? 'border-brand scale-110 shadow-md ring-2 ring-brand/20 ring-offset-1' : 'border-gray-200 hover:border-brand/50'
                      }`}
                      style={isGradient ? { background: swatch } : { background: swatch ?? '#ccc' }} />
                  )
                })}
              </div>
            </div>
          )}

          {/* Size */}
          {product.available_sizes.length > 0 && (
            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Size: <span className="font-semibold text-gray-900">{selectedSize}</span>
                </p>
                <button className="text-[11px] font-bold uppercase tracking-widest text-brand hover:text-pink-500 hover:underline underline-offset-4 transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.available_sizes.map(s => {
                  const variantOOS = product.variants?.find(v => v.size === s && v.color === selectedColor)?.stock_quantity === 0
                  return (
                    <button key={s} onClick={() => !variantOOS && setSelectedSize(s)} disabled={variantOOS}
                      className={`min-w-[54px] px-4 py-2.5 text-[12px] font-bold rounded-full border transition-all ${
                        selectedSize === s
                          ? 'border-brand bg-pink-50 text-brand shadow-sm'
                          : variantOOS
                          ? 'border-gray-100 text-gray-300 line-through cursor-not-allowed'
                          : 'border-gray-200 text-gray-700 hover:border-brand hover:text-brand hover:bg-pink-50/50'
                      }`}>
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stock status */}
          <div className="mb-6 text-[13px] font-semibold">
            {stock === 0
              ? <span className="text-red-500">Out of stock for this selection</span>
              : stock <= 5
              ? <span className="text-amber-600">Only {stock} left — order soon!</span>
              : <span className="text-emerald-600">✓ In stock and ready to ship</span>
            }
          </div>

          {/* CTA */}
          <div className="flex gap-3 mb-10">
            <motion.button onClick={handleAdd} disabled={stock === 0 || isAdding}
              className={`flex-1 py-4 text-[13px] font-bold tracking-widest uppercase rounded-full flex items-center justify-center gap-2 transition-shadow shadow-md hover:shadow-lg ${
                stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none hover:shadow-none'
                : isAdding ? 'text-white'
                : 'text-white'
              }`}
              style={{ backgroundImage: stock === 0 ? undefined : BRAND_GRADIENT }}
              whileTap={stock > 0 ? { scale: 0.98 } : {}}>
              <AnimatePresence mode="wait">
                {isAdding
                  ? <motion.span key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ Added to Bag</motion.span>
                  : <motion.span key="add" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <ShoppingBag size={15} />
                      {stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                    </motion.span>
                }
              </AnimatePresence>
            </motion.button>

            <motion.button onClick={() => setWishlist(v => !v)}
              className={`w-14 h-14 border-2 rounded-full flex items-center justify-center transition-all shadow-sm ${
                wishlist ? 'border-brand bg-pink-50' : 'border-gray-200 hover:border-brand/40 hover:bg-pink-50/30'
              }`}
              whileTap={{ scale: 0.9 }}>
              <Heart size={18} fill={wishlist ? BRAND : 'none'} stroke={wishlist ? BRAND : '#666'} className="transition-colors" />
            </motion.button>
          </div>

          {/* Trust badges */}
          <div className="border-t border-gray-100 pt-8 grid grid-cols-3 gap-6 text-center">
            {[
              { Icon: Truck,       label: 'Free Delivery', sub: 'Orders ৳2,000+' },
              { Icon: ShieldCheck, label: 'Secure Payment', sub: 'bKash · COD' },
              { Icon: RotateCcw,   label: 'Easy Returns',  sub: '7-day policy' },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="group cursor-default">
                <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-3 text-brand group-hover:scale-110 transition-transform">
                  <Icon size={16} strokeWidth={1.5} />
                </div>
                <p className="text-[12px] font-bold text-gray-900">{label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {zoomed && imgs[activeImg] && (
          <motion.div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setZoomed(false)}>
            <motion.img src={imgs[activeImg]} alt={product.name}
              className="max-w-full max-h-full object-contain"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
