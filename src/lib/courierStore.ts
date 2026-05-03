import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/* ── Types ───────────────────────────────────────────────────────────────── */
export type CourierSlug = 'steadfast' | 'pathao' | 'paperfly' | 'redx' | 'ecourier' | 'sundarban' | 'carrybee'

export interface CourierConfig {
  enabled:    boolean
  apiKey:     string
  apiSecret:  string
  storeId:    string   // used by some couriers
  baseUrl:    string
}

export type ShipmentStatus =
  | 'pending' | 'in_review' | 'partially_dispatched'
  | 'dispatched' | 'partial_delivered' | 'delivered'
  | 'partial_returned' | 'returned' | 'cancelled' | 'hold'

export interface Shipment {
  id:              string
  orderId:         string
  orderNumber:     string
  courier:         CourierSlug
  consignmentId:   string   // courier's reference
  trackingCode:    string
  recipientName:   string
  recipientPhone:  string
  recipientAddress:string
  codAmount:       number
  weight:          number   // kg
  note:            string
  status:          ShipmentStatus
  createdAt:       string
  updatedAt:       string
}

/* ── Store ───────────────────────────────────────────────────────────────── */
interface CourierStore {
  configs:   Record<CourierSlug, CourierConfig>
  shipments: Shipment[]

  setConfig:    (slug: CourierSlug, cfg: Partial<CourierConfig>) => void
  addShipment:  (s: Shipment)  => void
  updateShipment:(id: string, s: Partial<Shipment>) => void
  deleteShipment:(id: string)  => void
}

const DEFAULTS: Record<CourierSlug, CourierConfig> = {
  steadfast: { enabled: false, apiKey: '', apiSecret: '', storeId: '', baseUrl: 'https://portal.steadfast.com.bd/public-api/v1' },
  pathao:    { enabled: false, apiKey: '', apiSecret: '', storeId: '', baseUrl: 'https://api-hermes.pathao.com' },
  paperfly:  { enabled: false, apiKey: '', apiSecret: '', storeId: '', baseUrl: 'https://api.paperfly.com.bd' },
  redx:      { enabled: false, apiKey: '', apiSecret: '', storeId: '', baseUrl: 'https://openapi.redx.com.bd' },
  ecourier:  { enabled: false, apiKey: '', apiSecret: '', storeId: '', baseUrl: 'https://ecourier.com.bd/api' },
  sundarban: { enabled: false, apiKey: '', apiSecret: '', storeId: '', baseUrl: '' },
  carrybee:  { enabled: false, apiKey: '', apiSecret: '', storeId: '', baseUrl: 'https://carrybee.com.bd/api/v1' },
}

export const useCourierStore = create<CourierStore>()(
  persist(
    (set) => ({
      configs:   { ...DEFAULTS },
      shipments: [],
      setConfig:     (slug, cfg) => set(s => ({ configs: { ...s.configs, [slug]: { ...s.configs[slug], ...cfg } } })),
      addShipment:   (sh)        => set(s => ({ shipments: [sh, ...s.shipments] })),
      updateShipment:(id, sh)    => set(s => ({ shipments: s.shipments.map(x => x.id === id ? { ...x, ...sh } : x) })),
      deleteShipment:(id)        => set(s => ({ shipments: s.shipments.filter(x => x.id !== id) })),
    }),
    { name: 'shajpori-courier', storage: createJSONStorage(() => localStorage) }
  )
)
