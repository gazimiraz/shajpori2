'use client'
import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

export default function FaviconSync() {
  const faviconDataUrl = useSettingsStore(s => s.faviconDataUrl)

  useEffect(() => {
    // find or create the <link rel="icon"> tag
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }

    if (faviconDataUrl) {
      link.href = faviconDataUrl
      // also update apple-touch-icon if present
      const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
      if (apple) apple.href = faviconDataUrl
    } else {
      link.href = '/favicon.ico'
    }
  }, [faviconDataUrl])

  return null
}
