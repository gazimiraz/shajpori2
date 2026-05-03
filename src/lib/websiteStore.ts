import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/* ── Types ───────────────────────────────────────────────────────────────── */
export interface TrackingPixel {
  enabled: boolean
  id:      string
}

export interface TrackingSettings {
  ga4:       TrackingPixel   // Google Analytics 4
  gtm:       TrackingPixel   // Google Tag Manager
  fbPixel:   TrackingPixel   // Facebook / Meta Pixel
  tiktok:    TrackingPixel   // TikTok Pixel
  snapchat:  TrackingPixel   // Snapchat Pixel
  twitter:   TrackingPixel   // Twitter / X Pixel
  hotjar:    TrackingPixel   // Hotjar
  clarity:   TrackingPixel   // Microsoft Clarity
  customHead: string          // Raw <script> injected in <head>
  customBody: string          // Raw <script> injected after <body>
}


export interface AnnouncementSettings {
  enabled:     boolean
  text:        string
  bgColor:     string
  textColor:   string
  link:        string
  dismissible: boolean
}

export interface HeaderSettings {
  sticky:      boolean
  showSearch:  boolean
  showCart:    boolean
  bgColor:     string
  textColor:   string
}

export interface HeroSlide {
  id:             string
  title:          string
  subtitle:       string
  buttonText:     string
  buttonLink:     string
  image:          string
  overlayColor:   string
  overlayOpacity: number
  align:          'left' | 'center' | 'right'
}

export interface ContentBlock {
  id:      string
  type:    'featured_products' | 'categories' | 'banner' | 'testimonials' | 'newsletter' | 'brands'
  label:   string
  enabled: boolean
}

export interface FooterColumn {
  id:    string
  heading: string
  links: { label: string; href: string }[]
}

export interface FooterSettings {
  tagline:       string
  copyright:     string
  showSocials:   boolean
  facebookUrl:   string
  instagramUrl:  string
  whatsapp:      string
  youtubeUrl:    string
  columns:       FooterColumn[]
}

/* ── Store ───────────────────────────────────────────────────────────────── */
interface WebsiteStore {
  announcement: AnnouncementSettings
  header:       HeaderSettings
  slides:       HeroSlide[]
  blocks:       ContentBlock[]
  footer:       FooterSettings
  tracking:     TrackingSettings

  setAnnouncement: (s: AnnouncementSettings) => void
  setHeader:       (s: HeaderSettings)       => void
  setSlides:       (s: HeroSlide[])          => void
  addSlide:        (s: HeroSlide)            => void
  updateSlide:     (id: string, s: Partial<HeroSlide>) => void
  deleteSlide:     (id: string)              => void
  setBlocks:       (b: ContentBlock[])       => void
  toggleBlock:     (id: string)              => void
  setFooter:       (f: FooterSettings)       => void
  setTracking:     (t: TrackingSettings)     => void
}

const DEFAULT_TRACKING: TrackingSettings = {
  ga4:        { enabled: false, id: '' },
  gtm:        { enabled: false, id: '' },
  fbPixel:    { enabled: false, id: '' },
  tiktok:     { enabled: false, id: '' },
  snapchat:   { enabled: false, id: '' },
  twitter:    { enabled: false, id: '' },
  hotjar:     { enabled: false, id: '' },
  clarity:    { enabled: false, id: '' },
  customHead: '',
  customBody: '',
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 's1', title: 'New Season Collection',
    subtitle: 'Discover bold styles crafted for you',
    buttonText: 'Shop Now', buttonLink: '/products',
    image: '', overlayColor: '#000000', overlayOpacity: 40, align: 'center',
  },
  {
    id: 's2', title: 'Bags & Accessories',
    subtitle: 'Complete your look with our latest arrivals',
    buttonText: 'Explore', buttonLink: '/products',
    image: '', overlayColor: '#C2185B', overlayOpacity: 30, align: 'left',
  },
]

const DEFAULT_BLOCKS: ContentBlock[] = [
  { id: 'b1', type: 'featured_products', label: 'Featured Products',  enabled: true  },
  { id: 'b2', type: 'categories',        label: 'Shop by Category',   enabled: true  },
  { id: 'b3', type: 'banner',            label: 'Promo Banner',       enabled: true  },
  { id: 'b4', type: 'testimonials',      label: 'Customer Reviews',   enabled: false },
  { id: 'b5', type: 'newsletter',        label: 'Newsletter Signup',  enabled: true  },
  { id: 'b6', type: 'brands',            label: 'Brand Logos',        enabled: false },
]

const DEFAULT_FOOTER: FooterSettings = {
  tagline: "Bangladesh's favourite women's fashion destination.",
  copyright: '© 2025 Shajpori. All rights reserved.',
  showSocials: true,
  facebookUrl: '', instagramUrl: '', whatsapp: '', youtubeUrl: '',
  columns: [
    { id: 'fc1', heading: 'Shop', links: [
      { label: 'Dresses',     href: '/products' },
      { label: 'Bags',        href: '/products' },
      { label: 'Jewelry',     href: '/products' },
      { label: 'Accessories', href: '/products' },
    ]},
    { id: 'fc2', heading: 'Help', links: [
      { label: 'Track Order',      href: '#' },
      { label: 'Returns Policy',   href: '#' },
      { label: 'Shipping Info',    href: '#' },
      { label: 'Size Guide',       href: '#' },
    ]},
    { id: 'fc3', heading: 'Company', links: [
      { label: 'About Us',    href: '#' },
      { label: 'Contact',     href: '#' },
      { label: 'Careers',     href: '#' },
      { label: 'Blog',        href: '#' },
    ]},
  ],
}

export const useWebsiteStore = create<WebsiteStore>()(
  persist(
    (set) => ({
      announcement: {
        enabled: true,
        text: 'FREE DELIVERY on orders above ৳2,000 ❖ Use code SHAJPORI10 for 10% off',
        bgColor: '#C2185B', textColor: '#ffffff', link: '', dismissible: true,
      },
      header: {
        sticky: true, showSearch: true, showCart: true,
        bgColor: '#ffffff', textColor: '#111827',
      },
      slides:   DEFAULT_SLIDES,
      blocks:   DEFAULT_BLOCKS,
      footer:   DEFAULT_FOOTER,
      tracking: DEFAULT_TRACKING,

      setAnnouncement: (s) => set({ announcement: s }),
      setHeader:       (s) => set({ header: s }),
      setSlides:       (s) => set({ slides: s }),
      addSlide:        (s) => set(st => ({ slides: [...st.slides, s] })),
      updateSlide:     (id, s) => set(st => ({ slides: st.slides.map(sl => sl.id === id ? { ...sl, ...s } : sl) })),
      deleteSlide:     (id) => set(st => ({ slides: st.slides.filter(sl => sl.id !== id) })),
      setBlocks:       (b) => set({ blocks: b }),
      toggleBlock:     (id) => set(st => ({ blocks: st.blocks.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b) })),
      setFooter:       (f) => set({ footer: f }),
      setTracking:     (t) => set({ tracking: t }),
    }),
    { name: 'shajpori-website', storage: createJSONStorage(() => localStorage) }
  )
)
