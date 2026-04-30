import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface StoreSettings {
  logoDataUrl:      string | null
  faviconDataUrl:   string | null
  storeName:        string
  announcement:     string
  invoiceTemplate:  string
  setLogo:          (dataUrl: string | null) => void
  setFavicon:       (dataUrl: string | null) => void
  setStoreName:     (name: string) => void
  setAnnouncement:  (text: string) => void
  setInvoiceTemplate:(t: string)  => void
}

export const useSettingsStore = create<StoreSettings>()(
  persist(
    (set) => ({
      logoDataUrl:      null,
      faviconDataUrl:   null,
      storeName:        'Shajpori',
      announcement:     'FREE DELIVERY on orders above ৳2,000 ❖ Use code SHAJPORI10 for 10% off',
      invoiceTemplate:  'classic',
      setLogo:          (dataUrl) => set({ logoDataUrl: dataUrl }),
      setFavicon:       (dataUrl) => set({ faviconDataUrl: dataUrl }),
      setStoreName:     (name)    => set({ storeName: name }),
      setAnnouncement:  (text)    => set({ announcement: text }),
      setInvoiceTemplate:(t)      => set({ invoiceTemplate: t }),
    }),
    { name: 'shajpori-settings', storage: createJSONStorage(() => localStorage) }
  )
)
