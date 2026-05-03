import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import FaviconSync from '@/components/layout/FaviconSync'
import TrackingScripts from '@/components/layout/TrackingScripts'
import './globals.css'

const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-display', display:'swap' })
const dmSans = DM_Sans({ subsets:['latin'], variable:'--font-body', display:'swap' })

export const metadata: Metadata = {
  title: { default:"Shajpori — Modern Women's Fashion", template:'%s | Shajpori' },
  description:"Bangladesh's favourite destination for modern western dresses, designer bags & accessories.",
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
