'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight, Star, Truck, RotateCcw, ShieldCheck, Headphones, Search } from 'lucide-react'
import ProductCard from '@/components/store/ProductCard'
import type { Product } from '@/types'

const BRAND = '#D81B60'
const BRAND_GRADIENT = 'linear-gradient(135deg, #D81B60, #F06292)'

/* ── All products ──────────────────────────────────────────── */
const ALL_PRODUCTS: Product[] = [
  { id:'d1', sku:'SJP-DR-001', name:'Bloom Garden Midi Dress',      slug:'bloom-garden-midi-dress',      short_description:'Floral chiffon midi with puff sleeves.',            category:'Dress',     price:3200, compare_at_price:3900, colors:['Blush Pink','Sage Green','Sky Blue'],               available_sizes:['XS','S','M','L','XL'],        materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600','https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600', badge:'New',      is_active:true, is_featured:true,  total_stock:45, reserved_stock:0, low_stock_alert:5,  total_sold:12, total_revenue:38400, view_count:342, rating_avg:4.8, rating_count:24, created_at:'', updated_at:'' },
  { id:'d2', sku:'SJP-DR-002', name:'Sunset Ruffle Maxi',           slug:'sunset-ruffle-maxi-dress',     short_description:'Satin ruffle maxi for formal occasions.',           category:'Dress',     price:4100, compare_at_price:5200, colors:['Coral Orange','Deep Burgundy','Ivory White'],          available_sizes:['S','M','L'],                  materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600', badge:'Trending', is_active:true, is_featured:true,  total_stock:24, reserved_stock:0, low_stock_alert:5,  total_sold:8,  total_revenue:32800, view_count:198, rating_avg:4.9, rating_count:16, created_at:'', updated_at:'' },
  { id:'d3', sku:'SJP-DR-003', name:'Cotton Candy Mini Dress',      slug:'cotton-candy-mini-dress',      short_description:'Smocked cotton mini in pastel shades.',             category:'Dress',     price:2400, compare_at_price:2900, colors:['Cotton Candy Pink','Lavender Mist','Butter Yellow'],   available_sizes:['XS','S','M','L','XL','XXL'],  materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600', badge:'Sale',     is_active:true, is_featured:false, total_stock:88, reserved_stock:2, low_stock_alert:10, total_sold:22, total_revenue:52800, view_count:410, rating_avg:4.7, rating_count:44, created_at:'', updated_at:'' },
  { id:'d4', sku:'SJP-DR-004', name:'Embroidered Kurti Set',        slug:'embroidered-kurti-set',        short_description:'Hand-embroidered kurti with palazzo pants.',        category:'Dress',     price:3200, compare_at_price:3800, colors:['Dusty Rose','Sage Green','Cream'],                     available_sizes:['S','M','L','XL','XXL'],       materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', badge:'New',      is_active:true, is_featured:true,  total_stock:35, reserved_stock:0, low_stock_alert:5,  total_sold:3,  total_revenue:9600,  view_count:167, rating_avg:0,   rating_count:0,  created_at:'', updated_at:'' },
  { id:'b1', sku:'SJP-BG-001', name:'Pearl Quilted Shoulder Bag',   slug:'pearl-quilted-shoulder-bag',   short_description:'Quilted vegan leather shoulder bag.',               category:'Bag',       price:5800,                         colors:['Ivory White','Black Onyx','Dusty Rose'],               available_sizes:['One Size'],                   materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', badge:'New',      is_active:true, is_featured:true,  total_stock:18, reserved_stock:0, low_stock_alert:3,  total_sold:5,  total_revenue:29000, view_count:287, rating_avg:5.0, rating_count:10, created_at:'', updated_at:'' },
  { id:'b2', sku:'SJP-BG-002', name:'Hot Pink Mini Tote',           slug:'hot-pink-mini-tote',           short_description:'Structured mini tote in signature pink.',           category:'Bag',       price:3500,                         colors:['Bubblegum Pink','Black Onyx','Cream'],                 available_sizes:['One Size'],                   materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600', badge:'',         is_active:true, is_featured:false, total_stock:33, reserved_stock:0, low_stock_alert:5,  total_sold:9,  total_revenue:31500, view_count:256, rating_avg:4.6, rating_count:18, created_at:'', updated_at:'' },
  { id:'b3', sku:'SJP-BG-003', name:'Woven Straw Beach Bag',        slug:'woven-straw-beach-bag',        short_description:'Handwoven straw tote for summer.',                  category:'Bag',       price:2800, compare_at_price:3200, colors:['Natural','Black','Tan'],                               available_sizes:['One Size'],                   materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=600', badge:'Trending', is_active:true, is_featured:false, total_stock:22, reserved_stock:0, low_stock_alert:5,  total_sold:6,  total_revenue:16800, view_count:180, rating_avg:4.5, rating_count:12, created_at:'', updated_at:'' },
  { id:'b4', sku:'SJP-BG-004', name:'Leather Crossbody Sling',      slug:'leather-crossbody-sling',      short_description:'Genuine leather compact crossbody bag.',            category:'Bag',       price:4200, compare_at_price:5000, colors:['Black','Caramel','Burgundy'],                          available_sizes:['One Size'],                   materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600', badge:'New',      is_active:true, is_featured:false, total_stock:15, reserved_stock:0, low_stock_alert:3,  total_sold:4,  total_revenue:16800, view_count:140, rating_avg:4.8, rating_count:8,  created_at:'', updated_at:'' },
  { id:'j1', sku:'SJP-JWL-001', name:'Pearl Drop Earrings',         slug:'pearl-drop-earrings',          short_description:'Freshwater pearl drops with 18k gold finish.',     category:'Jewelry',   price:890,  compare_at_price:1100, colors:['Gold','Silver'],                                       available_sizes:['One Size'],                   materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600', badge:'Popular',  is_active:true, is_featured:false, total_stock:60, reserved_stock:0, low_stock_alert:10, total_sold:38, total_revenue:33820, view_count:501, rating_avg:4.9, rating_count:62, created_at:'', updated_at:'' },
  { id:'j2', sku:'SJP-JWL-002', name:'Gold Chain Layered Necklace', slug:'gold-chain-layered-necklace',  short_description:'Triple-layer 18k gold-plated chain necklace.',      category:'Jewelry',   price:1400, compare_at_price:1800, colors:['Gold'],                                               available_sizes:['One Size'],                   materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', badge:'New',      is_active:true, is_featured:false, total_stock:45, reserved_stock:0, low_stock_alert:8,  total_sold:18, total_revenue:25200, view_count:320, rating_avg:4.7, rating_count:28, created_at:'', updated_at:'' },
  { id:'j3', sku:'SJP-JWL-003', name:'Crystal Charm Bracelet Set',  slug:'crystal-charm-bracelet-set',   short_description:'Set of 3 stackable crystal bracelets.',            category:'Jewelry',   price:1200,                         colors:['Rose Gold','Silver','Gold'],                           available_sizes:['One Size'],                   materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600', badge:'New',      is_active:true, is_featured:false, total_stock:95, reserved_stock:0, low_stock_alert:10, total_sold:14, total_revenue:16800, view_count:189, rating_avg:4.5, rating_count:28, created_at:'', updated_at:'' },
  { id:'j4', sku:'SJP-JWL-004', name:'Floral Ring Set',             slug:'floral-ring-set',              short_description:'Set of 4 dainty floral stackable rings.',          category:'Jewelry',   price:680,  compare_at_price:900,  colors:['Gold','Silver','Rose Gold'],                           available_sizes:['One Size'],                   materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600', badge:'Sale',     is_active:true, is_featured:false, total_stock:80, reserved_stock:0, low_stock_alert:10, total_sold:26, total_revenue:17680, view_count:260, rating_avg:4.6, rating_count:32, created_at:'', updated_at:'' },
  { id:'a1', sku:'SJP-AC-001',  name:'Silk Scarf — Floral Print',   slug:'silk-scarf-floral',            short_description:'100% silk twill scarf in a vibrant floral print.', category:'Accessory', price:1800, compare_at_price:2200, colors:['Multicolor','Blush Pink','Navy Blue'],                 available_sizes:['One Size'],                   materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', badge:'New',      is_active:true, is_featured:false, total_stock:40, reserved_stock:0, low_stock_alert:8,  total_sold:10, total_revenue:18000, view_count:200, rating_avg:4.8, rating_count:15, created_at:'', updated_at:'' },
  { id:'a2', sku:'SJP-AC-002',  name:'Embroidered Clutch Wallet',   slug:'embroidered-clutch-wallet',    short_description:'Hand-embroidered evening clutch wallet.',           category:'Accessory', price:2200,                         colors:['Blush Pink','Ivory','Black'],                          available_sizes:['One Size'],                   materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', badge:'',         is_active:true, is_featured:false, total_stock:28, reserved_stock:0, low_stock_alert:5,  total_sold:7,  total_revenue:15400, view_count:155, rating_avg:4.7, rating_count:11, created_at:'', updated_at:'' },
  { id:'a3', sku:'SJP-AC-003',  name:'Beaded Hair Clip Set',        slug:'beaded-hair-clip-set',         short_description:'Set of 6 colorful beaded hair clips.',             category:'Accessory', price:650,  compare_at_price:800,  colors:['Multicolor','Pastel','Classic'],                       available_sizes:['One Size'],                   materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', badge:'Sale',     is_active:true, is_featured:false, total_stock:70, reserved_stock:0, low_stock_alert:10, total_sold:20, total_revenue:13000, view_count:240, rating_avg:4.4, rating_count:22, created_at:'', updated_at:'' },
  { id:'a4', sku:'SJP-AC-004',  name:'Woven Belt — Boho Style',     slug:'woven-belt-boho',              short_description:'Handwoven bohemian waist belt.',                    category:'Accessory', price:950,                          colors:['Tan','Black','Rust Orange'],                           available_sizes:['S/M','L/XL'],                 materials:[], tags:[], image_urls:['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600'], thumbnail_url:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', badge:'',         is_active:true, is_featured:false, total_stock:50, reserved_stock:0, low_stock_alert:8,  total_sold:12, total_revenue:11400, view_count:170, rating_avg:4.3, rating_count:14, created_at:'', updated_at:'' },
]

const BY_CAT = (cat: string) => ALL_PRODUCTS.filter(p => p.category === cat)

/* ── Hero slides ───────────────────────────────────────────── */
const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&h=700&fit=crop&crop=top',
    tag: 'New Collection · Summer 2025',
    line1: 'Your Go-To Style,',
    line2: 'FOR EVERY OCCASION',
    offer: '15% OFF on all prepaid orders!',
    cta: 'SHOP NOW',
    href: '/products?badge=New',
  },
  {
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=700&fit=crop&crop=top',
    tag: 'Eid Edit 2025',
    line1: 'Festive Looks,',
    line2: 'MADE FOR YOU',
    offer: 'Up to 50% off on selected styles',
    cta: 'EXPLORE NOW',
    href: '/products',
  },
]

const TRUST = [
  { icon: Truck,       label:'Free Delivery',  sub:'Orders above ৳2,000' },
  { icon: RotateCcw,   label:'Easy Returns',   sub:'7-day hassle-free' },
  { icon: ShieldCheck, label:'Secure Payment', sub:'bKash · Nagad · COD' },
  { icon: Headphones,  label:'24/7 Support',   sub:'Always here for you' },
]

function CategorySection({ title, products, href }: { title: string; products: Product[]; href: string }) {
  const [start, setStart] = useState(0)
  const visible = 4
  const canPrev = start > 0
  const canNext = start + visible < products.length

  return (
    <section className="py-16 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-[28px] font-display font-light text-gray-900 tracking-tight">{title}</h2>
            <div className="h-0.5 w-10 bg-brand" />
          </div>
          <div className="flex items-center gap-6">
            <Link href={href} className="text-[11px] font-bold tracking-widest uppercase text-gray-900 hover:text-brand flex items-center gap-1.5 transition-colors pb-0.5 border-b border-transparent hover:border-brand">
              View All <ArrowRight size={14} />
            </Link>
            <div className="flex gap-2">
              <button onClick={() => setStart(v => Math.max(0, v - 1))} disabled={!canPrev}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${canPrev ? 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}>
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button onClick={() => setStart(v => Math.min(products.length - visible, v + 1))} disabled={!canNext}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${canNext ? 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}>
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(start, start + visible).map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.4, delay: i * 0.07 }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [slide, setSlide] = useState(0)
  const [query, setQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) window.location.href = `/products?search=${encodeURIComponent(query.trim())}`
  }

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setSlide(v => (v + 1) % SLIDES.length), 7000)
  }
  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [])
  const goTo = (i: number) => { setSlide(i); resetTimer() }

  const s = SLIDES[slide]

  return (
    <main className="bg-white">



      {/* ══════════════ HERO ══════════════ */}
      <section className="relative w-full overflow-hidden bg-[#FAFAFA]" style={{ height: 'clamp(400px, 55vw, 680px)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={slide} className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: "easeOut" }}>
            <Image src={s.img} alt="Hero" fill className="object-cover object-top" priority sizes="100vw" />
            {/* Elegant gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/30" />
          </motion.div>
        </AnimatePresence>

        {/* Text — clean editorial style */}
        <div className="absolute inset-0 flex items-center justify-end px-8 sm:px-20 max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={`t-${slide}`}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-right max-w-[480px]">
              <p className="inline-block mb-4 text-[11px] font-bold tracking-[.3em] uppercase text-white bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-sm">{s.tag}</p>
              <h1 className="font-display font-light text-white leading-[1.1] mb-2"
                style={{ fontSize: 'clamp(2.4rem, 4.5vw, 4rem)' }}>
                {s.line1}
              </h1>
              <h1 className="font-display font-medium text-white leading-[1] mb-6"
                style={{ fontSize: 'clamp(2.6rem, 5vw, 4.5rem)' }}>
                {s.line2}
              </h1>
              <p className="text-[15px] text-white/90 mb-10 font-light tracking-wide">{s.offer}</p>
              <Link href={s.href}>
                <motion.span
                  className="inline-flex items-center justify-center gap-3 text-gray-900 bg-white text-[11px] font-bold tracking-widest uppercase px-12 py-4 shadow-xl hover:bg-gray-900 hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {s.cta} <ArrowRight size={14} />
                </motion.span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`transition-all duration-500 rounded-full ${i === slide ? 'w-10 h-1 bg-white' : 'w-2 h-1 bg-white/40 hover:bg-white/70'}`} />
          ))}
        </div>
      </section>



      {/* ══════════════ TRUST STRIP ══════════════ */}
      <div className="bg-white border-b border-gray-100 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
          {TRUST.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center justify-center gap-4 px-4 sm:px-8 py-8 group cursor-default">
              <div className="text-gray-900 group-hover:text-brand transition-colors">
                <Icon size={24} strokeWidth={1} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-900 tracking-wide uppercase mb-0.5">{label}</p>
                <p className="text-[11px] text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ CATEGORY-WISE SECTIONS ══════════════ */}

      {/* Dresses */}
      <CategorySection title="Dresses" products={BY_CAT('Dress')} href="/products?category=Dress" />

      {/* Mid banner */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
        <div className="relative overflow-hidden bg-[#FAFAFA] border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-8 px-12 sm:px-20 py-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold tracking-[.3em] uppercase mb-4 text-brand">Limited Time</p>
            <h3 className="font-display text-[32px] sm:text-[40px] font-light text-gray-900 leading-[1.1] mb-2">
              Eid Edit '25
            </h3>
            <p className="text-[16px] text-gray-600 font-light mb-0">Discover festive elegance. Up to <span className="font-medium text-brand">50% OFF</span> selected styles.</p>
          </div>
          <Link href="/products">
            <span className="inline-flex items-center gap-3 text-white bg-gray-900 text-[11px] font-bold tracking-widest uppercase px-10 py-4 hover:bg-brand transition-colors duration-300">
              SHOP NOW <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </div>

      {/* Bags */}
      <CategorySection title="Bags & Totes" products={BY_CAT('Bag')} href="/products?category=Bag" />

      {/* Jewelry */}
      <CategorySection title="Jewelry" products={BY_CAT('Jewelry')} href="/products?category=Jewelry" />

      {/* Mid banner 2 */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { bg:'#FAFAFA', accent:'#0F172A', tag:'Best Sellers', title:'Bags from ৳1,999', href:'/products?category=Bag' },
            { bg:'#FFF5F7', accent:'#D81B60', tag:'Flash Sale',   title:'Up to 40% Off', href:'/products?sale=true' },
          ].map(({ bg, accent, tag, title, href }) => (
            <Link key={title} href={href}>
              <div className="flex items-center justify-between px-12 py-12 transition-all hover:bg-gray-50 group border border-gray-100" style={{ background: bg }}>
                <div>
                  <p className="text-[10px] font-bold tracking-[.25em] uppercase mb-3" style={{ color: accent }}>{tag}</p>
                  <h4 className="font-display text-[26px] font-light text-gray-900">{title}</h4>
                </div>
                <div className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-all text-gray-900">
                  <ArrowRight size={18} strokeWidth={1.5} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Accessories */}
      <CategorySection title="Accessories" products={BY_CAT('Accessory')} href="/products?category=Accessory" />

      {/* ══════════════ RATINGS STRIP ══════════════ */}
      <div className="border-t border-gray-100 bg-white py-16 mt-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            {[
              { val:'4.8', label:'Average Rating', sub:'Based on 2,400+ reviews' },
              { val:'50K+', label:'Happy Customers', sub:'Across Bangladesh' },
              { val:'500+', label:'Products', sub:'New styles every week' },
              { val:'Free', label:'Delivery', sub:'On orders above ৳2,000' },
            ].map(({ val, label, sub }, i) => (
              <div key={label} className={i === 0 ? '' : 'pl-8'}>
                <p className="font-display text-4xl font-light text-gray-900 mb-2">{val}</p>
                {val === '4.8' && (
                  <div className="flex justify-center gap-1 mb-2">
                    {[1,2,3,4,5].map(n => <Star key={n} size={14} className="fill-brand text-brand" />)}
                  </div>
                )}
                <p className="text-[12px] font-bold tracking-widest uppercase text-gray-900 mb-1">{label}</p>
                <p className="text-[12px] text-gray-500 font-light">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ NEWSLETTER ══════════════ */}
      <section className="bg-gray-900 py-24 px-6 text-center">
        <div className="max-w-[500px] mx-auto">
          <p className="text-[11px] font-bold tracking-[.3em] uppercase mb-4 text-brand">Stay Connected</p>
          <h3 className="font-display text-4xl font-light text-white mb-4">The Insider Edit</h3>
          <p className="text-[14px] text-gray-400 mb-10 font-light leading-relaxed">Join our mailing list to receive exclusive early access to new collections, private sales, and style inspiration.</p>
          <form className="flex border-b border-gray-700 focus-within:border-white transition-colors pb-2" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address"
              className="flex-1 bg-transparent text-[13px] text-white placeholder-gray-500 outline-none px-2" />
            <button type="submit" className="text-[11px] font-bold tracking-widest uppercase text-white hover:text-brand transition-colors px-4">
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </main>
  )
}
