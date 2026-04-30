'use client'
import Link from 'next/link'
import { Instagram, Facebook, Youtube } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'

const COLS = {
  'Quick Links': [
    ['New Arrivals', '/products?badge=New'],
    ['Dresses',      '/products?category=Dress'],
    ['Bags',         '/products?category=Bag'],
    ['Accessories',  '/products?category=Accessory'],
    ['Jewelry',      '/products?category=Jewelry'],
    ['Sale',         '/products?sale=true'],
  ],
  'Help': [
    ['Size Guide',      '/size-guide'],
    ['Track Your Order', '/track-order'],
    ['Return Policy',   '/returns'],
    ['Shipping Info',   '/shipping'],
    ['FAQs',            '/faq'],
    ['Contact Us',      '/contact'],
  ],
  'Company': [
    ['About Us',       '/about'],
    ['Blog',           '/blog'],
    ['Careers',        '/careers'],
    ['Privacy Policy', '/privacy'],
    ['Terms of Use',   '/terms'],
  ],
}

const SOCIALS = [
  { name: 'Instagram', Icon: Instagram, href: '#' },
  { name: 'Facebook',  Icon: Facebook,  href: '#' },
  { name: 'YouTube',   Icon: Youtube,   href: '#' },
]

export default function Footer() {
  const { storeName, logoDataUrl } = useSettingsStore()
  return (
    <footer className="bg-[#3A0A12] text-white">
      {/* Main */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12 grid grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand */}
        <div className="col-span-2">
          <Link href="/" className="block mb-4">
            {logoDataUrl
              ? <img src={logoDataUrl} alt={storeName} className="h-8 max-w-[160px] object-contain brightness-0 invert" />
              : <span className="text-[22px] font-black font-display tracking-tight">{storeName.slice(0,-3) || 'Shaj'}<span className="text-brand">{storeName.slice(-3) || 'ori'}</span></span>
            }
          </Link>
          <p className="text-[13px] text-white/50 leading-relaxed mb-6 max-w-[260px]">
            Bangladesh's favourite destination for modern western dresses, designer bags & accessories.
          </p>
          <div className="flex gap-2.5">
            {SOCIALS.map(({ name, Icon, href }) => (
              <a key={name} href={href} aria-label={name}
                className="w-8 h-8 border border-white/20 flex items-center justify-center text-white/50 hover:border-brand hover:text-brand transition-colors">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(COLS).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="text-[10px] font-bold tracking-[.15em] uppercase text-white/30 mb-4">{heading}</h4>
            <ul className="space-y-2.5">
              {links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-[13px] text-white/55 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/30">© 2025 {storeName}. All rights reserved. Made with ❤️ in Bangladesh.</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/25 mr-1">We accept:</span>
            {['bKash','Nagad','Rocket','COD','Card'].map(p => (
              <span key={p} className="text-[10px] font-semibold border border-white/15 px-2 py-0.5 text-white/40 rounded-sm">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
