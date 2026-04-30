'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

const SWATCHES: Record<string, string> = {
  'Blush Pink':'#FFB6C1','Bubblegum Pink':'#FF69B4','Sage Green':'#B2C9AD',
  'Sky Blue':'#87CEEB','Coral Orange':'#FF7F50','Deep Burgundy':'#800020',
  'Ivory White':'#F5F5DC','Black Onyx':'#111111','Cream':'#FFFDD0',
  'Dusty Rose':'#DCAE96','Cobalt Blue':'#0047AB','Cotton Candy Pink':'#FFB7D5',
  'Lavender Mist':'#C4A8E1','Butter Yellow':'#FFFACD','Rose Gold':'#B76E79',
  'Gold':'#D4AF37','Silver':'#AAAAAA','Black':'#111111','White':'#FFFFFF',
}

export default function ProductCard({ product }: { product: Product }) {
  const [wished,  setWished]  = useState(false)
  const [hovered, setHovered] = useState(false)
  const [adding,  setAdding]  = useState(false)
  const { addItem, openCart } = useCartStore()

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100) : null

  const img = product.thumbnail_url || product.image_urls?.[0]
  const img2 = product.image_urls?.[1]

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (adding) return
    setAdding(true)
    addItem({
      product_id: product.id, name: product.name, slug: product.slug,
      size: product.available_sizes[0] ?? 'One Size',
      color: product.colors[0] ?? '',
      image_url: img, price: product.price, qty: 1,
    })
    toast.success('Added to bag')
    setTimeout(() => { setAdding(false); openCart() }, 600)
  }

  return (
    <article
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block">

        {/* Image container */}
        <div className="relative overflow-hidden bg-[#F5F5F3] aspect-[3/4]">

          {/* Primary image */}
          {img && (
            <Image src={img} alt={product.name} fill
              className={`object-cover transition-all duration-700 ${hovered && img2 ? 'opacity-0' : 'opacity-100'} group-hover:scale-[1.03]`}
              sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" />
          )}

          {/* Secondary image crossfade */}
          {img2 && (
            <Image src={img2} alt={product.name} fill
              className={`object-cover absolute inset-0 transition-opacity duration-700 ${hovered ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" />
          )}

          {/* No image fallback */}
          {!img && (
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10">
              {product.category === 'Dress' ? '👗' : product.category === 'Bag' ? '👜' : product.category === 'Jewelry' ? '💍' : '✨'}
            </div>
          )}

          {/* Badge */}
          {product.badge && (
            <span className={`absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 ${
              product.badge === 'Sale' ? 'bg-red-500 text-white' :
              product.badge === 'New' || product.badge === 'Trending' ? 'bg-[#111] text-white' :
              'bg-white text-[#111]'
            }`}>
              {product.badge}
            </span>
          )}
          {discount && (
            <span className="absolute top-3 right-10 text-[10px] font-bold px-2 py-0.5 bg-red-500 text-white">
              -{discount}%
            </span>
          )}

          {/* Wishlist */}
          <button onClick={e => { e.preventDefault(); setWished(v => !v) }}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-white/90 hover:bg-white transition-colors">
            <Heart size={13} fill={wished ? '#C2185B' : 'none'} stroke={wished ? '#C2185B' : '#666'} />
          </button>

          {/* Quick add — slide up */}
          <AnimatePresence>
            {hovered && product.total_stock > 0 && (
              <motion.button onClick={handleAdd}
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute bottom-0 left-0 right-0 bg-[#111] hover:bg-[#C2185B] text-white text-[11px] font-semibold tracking-widest uppercase py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag size={12} />
                {adding ? '✓  Added' : 'Quick Add'}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Low stock */}
          {product.total_stock > 0 && product.total_stock <= 4 && !hovered && (
            <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-[9px] font-bold text-center py-1 tracking-wider">
              ONLY {product.total_stock} LEFT
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pt-2.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">{product.category}</p>
          <h3 className="text-[13px] text-gray-900 font-medium leading-snug line-clamp-1 mb-1.5">{product.name}</h3>

          {/* Color swatches */}
          {product.colors.length > 1 && (
            <div className="flex items-center gap-1 mb-2">
              {product.colors.slice(0, 5).map(c => (
                <span key={c} title={c}
                  className="w-3 h-3 rounded-full border border-gray-200"
                  style={{ background: SWATCHES[c] ?? '#ccc' }} />
              ))}
              {product.colors.length > 5 && <span className="text-[10px] text-gray-400">+{product.colors.length - 5}</span>}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-gray-900">৳{product.price.toLocaleString()}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-[12px] text-gray-400 line-through">৳{product.compare_at_price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
