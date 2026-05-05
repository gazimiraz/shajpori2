import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import FaviconSync from '@/components/layout/FaviconSync'
import TrackingScripts from '@/components/layout/TrackingScripts'
import './globals.css'

const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-display', display:'swap' })
const dmSans = DM_Sans({ subsets:['latin'], variable:'--font-body', display:'swap' })

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shajpori2.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default:"Shajpori — Modern Women's Fashion", template:'%s | Shajpori' },
  description:"Bangladesh's favourite destination for modern western dresses, designer bags & accessories.",
  keywords: ['western dress', 'women fashion', 'designer bags', 'accessories', 'bangladesh fashion', 'shajpori'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Shajpori',
    title: "Shajpori — Modern Women's Fashion",
    description: "Bangladesh's favourite destination for modern western dresses, designer bags & accessories.",
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Shajpori Fashion' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Shajpori — Modern Women's Fashion",
    description: "Bangladesh's favourite destination for modern western dresses, designer bags & accessories.",
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({ children }:{ children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-white text-[#111] antialiased" suppressHydrationWarning>
        <FaviconSync />
        <TrackingScripts />
        {children}
        <Toaster position="bottom-center" toastOptions={{ style:{ background:'#1A1A2E', color:'#fff', borderRadius:'50px', padding:'12px 24px', fontFamily:'var(--font-body)', fontSize:'14px' }, success:{ iconTheme:{ primary:'#FF69B4', secondary:'#fff' } } }} />
      </body>
    </html>
  )
}
