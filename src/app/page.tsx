'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight, Star, Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react'
import ProductCard from '@/components/store/ProductCard'
import type { Product } from '@/types'

const BRAND = '#C2185B'

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
    <section className="py-10 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">{title}</h2>
            <div className="h-px w-10 bg-[#C2185B]" />
          </div>
          <div className="flex items-center gap-3">
            <Link href={href} className="text-[12px] font-semibold text-[#C2185B] hover:underline underline-offset-2 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
            <div className="flex gap-1">
              <button onClick={() => setStart(v => Math.max(0, v - 1))} disabled={!canPrev}
                className={`w-8 h-8 border flex items-center justify-center transition-colors ${canPrev ? 'border-gray-300 text-gray-600 hover:border-[#C2185B] hover:text-[#C2185B]' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setStart(v => Math.min(products.length - visible, v + 1))} disabled={!canNext}
                className={`w-8 h-8 border flex items-center justify-center transition-colors ${canNext ? 'border-gray-300 text-gray-600 hover:border-[#C2185B] hover:text-[#C2185B]' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setSlide(v => (v + 1) % SLIDES.length), 6000)
  }
  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [])
  const goTo = (i: number) => { setSlide(i); resetTimer() }

  const s = SLIDES[slide]

  return (
    <main className="bg-white">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative w-full overflow-hidden bg-gray-100" style={{ height: 'clamp(340px, 52vw, 600px)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={slide} className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
            <Image src={s.img} alt="Hero" fill className="object-cover object-top" priority sizes="100vw" />
            {/* Light gradient so right-side text is readable on any image */}
            <div className="absolute inset-0 bg-gradient-to-l from-white/85 via-white/40 to-white/0" />
          </motion.div>
        </AnimatePresence>

        {/* Text — right aligned (Floret style) */}
        <div className="absolute inset-0 flex items-center justify-end px-8 sm:px-16">
          <AnimatePresence mode="wait">
            <motion.div key={`t-${slide}`}
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="text-right max-w-[420px]">
              <p className="text-[11px] font-semibold tracking-[.2em] uppercase text-gray-500 mb-3">{s.tag}</p>
              <h1 className="font-display font-black text-gray-900 leading-[1.1] mb-2"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3.4rem)' }}>
                <span className="italic font-light">{s.line1}</span>
              </h1>
              <h1 className="font-display font-black leading-[1] mb-4"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.8rem)', color: BRAND }}>
                {s.line2}
              </h1>
              <p className="text-[14px] text-gray-600 mb-7 font-medium">{s.offer}</p>
              <Link href={s.href}>
                <motion.span
                  className="inline-flex items-center gap-2 text-white text-[12px] font-bold tracking-widest uppercase px-8 py-4"
                  style={{ background: '#1A3A5C' }}
                  whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.97 }}>
                  {s.cta}
                </motion.span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-400 ${i === slide ? 'w-5 h-2 bg-[#C2185B]' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />
          ))}
        </div>

        {/* Arrows */}
        <button onClick={() => goTo((slide - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white shadow-sm flex items-center justify-center transition-colors">
          <ChevronLeft size={18} className="text-gray-700" />
        </button>
        <button onClick={() => goTo((slide + 1) % SLIDES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white shadow-sm flex items-center justify-center transition-colors">
          <ChevronRight size={18} className="text-gray-700" />
        </button>
      </section>

      {/* ══════════════ TRUST STRIP ══════════════ */}
      <div className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
          {TRUST.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 px-4 sm:px-6 py-4">
              <Icon size={18} strokeWidth={1.5} style={{ color: BRAND }} className="shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-gray-800">{label}</p>
                <p className="text-[11px] text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ QUICK CATEGORY PILLS ══════════════ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
        <div className="flex gap-3 flex-wrap">
          {[
            { label:'New In',     href:'/products?badge=New',         active: true },
            { label:'Best Sellers',href:'/products?sort=best',        active: false },
            { label:'Dresses',    href:'/products?category=Dress',    active: false },
            { label:'Bags',       href:'/products?category=Bag',      active: false },
            { label:'Jewelry',    href:'/products?category=Jewelry',  active: false },
            { label:'Accessories',href:'/products?category=Accessory',active: false },
            { label:'Sale',       href:'/products?sale=true',         active: false },
          ].map(({ label, href }) => (
            <Link key={label} href={href}
              className="px-5 py-2 border border-gray-200 rounded-full text-[13px] font-medium text-gray-600 hover:border-[#C2185B] hover:text-[#C2185B] transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ══════════════ CATEGORY-WISE SECTIONS ══════════════ */}

      {/* Dresses */}
      <CategorySection title="Dresses" products={BY_CAT('Dress')} href="/products?category=Dress" />

      {/* Mid banner */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4">
        <div className="relative overflow-hidden rounded-none" style={{ minHeight: 160, background: '#FFF0F4' }}>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 px-8 sm:px-14 py-8">
            <div>
              <p className="text-[10px] font-bold tracking-[.25em] uppercase mb-1" style={{ color: BRAND }}>Limited Time</p>
              <h3 className="font-display text-[26px] sm:text-[32px] font-black text-gray-900 leading-tight">
                Eid Edit '25 — Up to <span style={{ color: BRAND }}>50% OFF</span>
              </h3>
            </div>
            <Link href="/products">
              <span className="inline-flex items-center gap-2 text-white text-[12px] font-bold tracking-widest uppercase px-8 py-4 hover:opacity-90 transition-opacity"
                style={{ background: BRAND }}>
                SHOP NOW <ArrowRight size={13} />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bags */}
      <CategorySection title="Bags & Totes" products={BY_CAT('Bag')} href="/products?category=Bag" />

      {/* Jewelry */}
      <CategorySection title="Jewelry" products={BY_CAT('Jewelry')} href="/products?category=Jewelry" />

      {/* Mid banner 2 */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { bg:'#E8F4FD', accent:'#1565C0', tag:'Best Sellers', title:'Bags from ৳1,999', href:'/products?category=Bag' },
            { bg:'#FFF3E0', accent:'#E65100', tag:'Flash Sale',   title:'Up to 40% Off', href:'/products?sale=true' },
          ].map(({ bg, accent, tag, title, href }) => (
            <Link key={title} href={href}>
              <div className="flex items-center justify-between px-8 py-7 transition-opacity hover:opacity-90" style={{ background: bg }}>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: accent }}>{tag}</p>
                  <h4 className="font-display text-[22px] font-black text-gray-900">{title}</h4>
                </div>
                <span className="text-[12px] font-bold tracking-widest uppercase flex items-center gap-1" style={{ color: accent }}>
                  SHOP <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Accessories */}
      <CategorySection title="Accessories" products={BY_CAT('Accessory')} href="/products?category=Accessory" />

      {/* ══════════════ RATINGS STRIP ══════════════ */}
      <div className="border-y border-gray-100 bg-gray-50 py-8 mt-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { val:'4.8', label:'Average Rating', sub:'Based on 2,400+ reviews' },
              { val:'50K+', label:'Happy Customers', sub:'Across Bangladesh' },
              { val:'500+', label:'Products', sub:'New styles every week' },
              { val:'Free', label:'Delivery', sub:'On orders above ৳2,000' },
            ].map(({ val, label, sub }) => (
              <div key={label}>
                <p className="font-display text-3xl font-black text-gray-900 mb-1">{val}</p>
                {val === '4.8' && (
                  <div className="flex justify-center gap-0.5 mb-1">
                    {[1,2,3,4,5].map(n => <Star key={n} size={12} className="fill-amber-400 text-amber-400" />)}
                  </div>
                )}
                <p className="text-[13px] font-semibold text-gray-700">{label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ NEWSLETTER ══════════════ */}
      <section className="bg-[#111]">
        <div className="max-w-[480px] mx-auto px-6 py-16 text-center">
          <p className="text-[10px] font-bold tracking-[.3em] uppercase mb-3" style={{ color: BRAND }}>Stay Connected</p>
          <h3 className="font-display text-2xl font-black text-white mb-2">Get the latest drops first.</h3>
          <p className="text-[12px] text-white/40 mb-7">New arrivals, exclusive offers & style edits — straight to your inbox.</p>
          <form className="flex gap-0 max-w-sm mx-auto" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email"
              className="flex-1 px-4 py-3 text-[13px] bg-white/8 border border-white/10 text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors" />
            <button type="submit" className="px-5 py-3 text-white text-[11px] font-bold tracking-widest uppercase shrink-0 transition-colors hover:opacity-90" style={{ background: BRAND }}>
              JOIN
            </button>
          </form>
        </div>
      </section>

    </main>
  )
}
