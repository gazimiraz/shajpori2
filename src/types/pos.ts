// src/types/pos.ts — POS, Barcode, and Attribute types

export type BarcodeType = 'EAN13' | 'CODE128' | 'QR' | 'UPC' | 'ITF14'
export type PaymentMethod = 'cash' | 'card' | 'bkash' | 'nagad' | 'cod' | 'split'
export type POSSessionStatus = 'Open' | 'Closed'
export type ProductStatus = 'active' | 'draft' | 'archived'

// ── BARCODE ───────────────────────────────────────────────────
export interface Barcode {
  id: string
  barcode_value: string
  barcode_type: BarcodeType
  product_id?: string
  variant_id?: string
  is_active: boolean
  printed_count: number
  last_printed?: string
  created_at: string
}

// ── ATTRIBUTES ────────────────────────────────────────────────
export interface AttributeGroup {
  id: string
  name: string
  slug: string
  type: 'select' | 'multiselect' | 'text' | 'number' | 'boolean' | 'color'
  is_variant: boolean // true = generates product variants
  sort_order: number
  is_active: boolean
  values?: AttributeValue[]
}

export interface AttributeValue {
  id: string
  group_id: string
  value: string
  hex_code?: string
  sort_order: number
  is_active: boolean
}

// ── BRAND & UNIT ──────────────────────────────────────────────
export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  is_active: boolean
  sort_order: number
}

export interface Unit {
  id: string
  name: string      // Piece, Pair, Set
  short_name: string // pcs, pr, set
  is_active: boolean
}

// ── EXTENDED PRODUCT FORM ─────────────────────────────────────
export interface ProductFormData {
  // Basic
  name: string
  sku: string
  slug?: string
  description?: string
  short_description?: string
  status: ProductStatus

  // Classification
  category: string
  category_id?: string
  brand_id?: string
  unit_id?: string
  unit_name?: string

  // Attributes
  available_sizes: string[]
  colors: string[]
  materials: string[]
  tags: string[]
  badge?: string
  sort_order: number

  // Pricing
  price: number
  compare_at_price?: number
  cost_price?: number
  tax_rate?: number

  // Inventory
  track_inventory: boolean
  total_stock: number
  low_stock_alert: number
  reorder_quantity?: number
  supplier_id?: string
  warehouse_location?: string

  // Barcode
  barcode?: string
  barcode_type?: BarcodeType

  // Media
  image_urls: string[]
  thumbnail_url?: string

  // Display
  is_featured: boolean
  is_active: boolean
  published_at?: string
}

// ── POS CART ─────────────────────────────────────────────────
export interface POSCartItem {
  product_id: string
  variant_id?: string
  name: string
  sku: string
  barcode?: string
  emoji?: string
  size: string
  colour: string
  unit_price: number
  qty: number
  discount_pct: number
  total_price: number
  max_stock: number
  thumbnail_url?: string
}

export interface POSCart {
  items: POSCartItem[]
  customer_name?: string
  customer_phone?: string
  discount_pct: number
  discount_amt: number
  delivery_charge: number
  tax_amount: number
  subtotal: number
  total: number
  payment_method: PaymentMethod
  amount_tendered?: number
  change_given?: number
  notes?: string
}

// ── POS SESSION ───────────────────────────────────────────────
export interface POSSession {
  id: string
  session_number: string
  cashier_id?: string
  terminal_name: string
  opened_at: string
  closed_at?: string
  opening_cash: number
  closing_cash?: number
  total_sales: number
  total_orders: number
  status: POSSessionStatus
}

// ── POS SALE ─────────────────────────────────────────────────
export interface POSSale {
  id: string
  sale_number: string
  session_id?: string
  cashier_id?: string
  customer_name?: string
  customer_phone?: string
  items: POSCartItem[]
  subtotal: number
  discount_pct: number
  discount_amt: number
  delivery_charge: number
  tax_amount: number
  total_amount: number
  payment_method: PaymentMethod
  amount_tendered?: number
  change_given?: number
  notes?: string
  is_returned: boolean
  created_at: string
}

// ── LABEL SETTINGS ────────────────────────────────────────────
export interface LabelSettings {
  barcode_type: BarcodeType
  label_size: '40mm × 25mm' | '50mm × 30mm' | '60mm × 40mm' | 'A4 sheet'
  copies: number
  show_brand: boolean
  show_product_name: boolean
  show_barcode: boolean
  show_price: boolean
  show_size_colour: boolean
  show_sku: boolean
  show_qr: boolean
}

// ── POS DAILY SUMMARY ─────────────────────────────────────────
export interface POSDailySummary {
  sale_date: string
  total_transactions: number
  total_revenue: number
  product_revenue: number
  total_discounts: number
  avg_transaction: number
  cash_revenue: number
  card_revenue: number
  bkash_revenue: number
  nagad_revenue: number
}
