import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MenuLink {
  id: string
  label: string
  href: string
}

export interface MegaCol {
  id: string
  heading: string
  links: MenuLink[]
}

export interface MegaPromo {
  label: string
  tag: string
  color: string
  accent: string
}

export interface NavItem {
  id: string
  label: string
  href: string
  sale?: boolean
  mega: {
    cols: MegaCol[]
    promo: MegaPromo | null
  } | null
}

const uid = () => Math.random().toString(36).slice(2, 9)

const SEED_NAV: NavItem[] = [
  { id: uid(), label: 'New In',      href: '/products?badge=New',           sale: false, mega: null },
  { id: uid(), label: 'Best Sellers',href: '/products?sort=best',           sale: false, mega: null },
  {
    id: uid(), label: 'Dresses', href: '/products?category=Dress', sale: false,
    mega: {
      cols: [
        { id: uid(), heading: 'By Style', links: [
          { id: uid(), label: 'All Dresses',   href: '/products?category=Dress' },
          { id: uid(), label: 'Maxi Dress',    href: '/products?category=Dress&style=Maxi' },
          { id: uid(), label: 'Midi Dress',    href: '/products?category=Dress&style=Midi' },
          { id: uid(), label: 'Mini Dress',    href: '/products?category=Dress&style=Mini' },
          { id: uid(), label: 'Kurti Set',     href: '/products?category=Dress&style=Kurti' },
          { id: uid(), label: 'Party Wear',    href: '/products?category=Dress&style=Party' },
        ]},
        { id: uid(), heading: 'By Occasion', links: [
          { id: uid(), label: 'Casual',        href: '/products?category=Dress&occasion=Casual' },
          { id: uid(), label: 'Festive / Eid', href: '/products?category=Dress&occasion=Festive' },
          { id: uid(), label: 'Office Wear',   href: '/products?category=Dress&occasion=Office' },
          { id: uid(), label: 'Wedding',       href: '/products?category=Dress&occasion=Wedding' },
        ]},
      ],
      promo: { label: 'Eid Edit', tag: 'Up to 50% Off', color: '#FFF0F4', accent: '#C2185B' },
    },
  },
  {
    id: uid(), label: 'Bags', href: '/products?category=Bag', sale: false,
    mega: {
      cols: [
        { id: uid(), heading: 'By Type', links: [
          { id: uid(), label: 'All Bags',      href: '/products?category=Bag' },
          { id: uid(), label: 'Tote Bags',     href: '/products?category=Bag&type=Tote' },
          { id: uid(), label: 'Clutches',      href: '/products?category=Bag&type=Clutch' },
          { id: uid(), label: 'Sling Bags',    href: '/products?category=Bag&type=Sling' },
          { id: uid(), label: 'Backpacks',     href: '/products?category=Bag&type=Backpack' },
        ]},
        { id: uid(), heading: 'By Material', links: [
          { id: uid(), label: 'Leather',       href: '/products?category=Bag&material=Leather' },
          { id: uid(), label: 'Woven / Straw', href: '/products?category=Bag&material=Woven' },
          { id: uid(), label: 'Quilted',       href: '/products?category=Bag&material=Quilted' },
          { id: uid(), label: 'Canvas',        href: '/products?category=Bag&material=Canvas' },
        ]},
      ],
      promo: { label: 'New Arrivals', tag: 'Fresh Styles', color: '#EEF4FF', accent: '#1565C0' },
    },
  },
  {
    id: uid(), label: 'Jewelry', href: '/products?category=Jewelry', sale: false,
    mega: {
      cols: [
        { id: uid(), heading: 'Jewelry', links: [
          { id: uid(), label: 'All Jewelry',   href: '/products?category=Jewelry' },
          { id: uid(), label: 'Earrings',      href: '/products?category=Jewelry&type=Earrings' },
          { id: uid(), label: 'Necklaces',     href: '/products?category=Jewelry&type=Necklaces' },
          { id: uid(), label: 'Bracelets',     href: '/products?category=Jewelry&type=Bracelets' },
          { id: uid(), label: 'Rings',         href: '/products?category=Jewelry&type=Rings' },
        ]},
      ],
      promo: { label: 'Gold & Silver', tag: 'Premium Picks', color: '#FFFBEA', accent: '#B8860B' },
    },
  },
  {
    id: uid(), label: 'Accessories', href: '/products?category=Accessory', sale: false,
    mega: {
      cols: [
        { id: uid(), heading: 'Accessories', links: [
          { id: uid(), label: 'All Accessories',   href: '/products?category=Accessory' },
          { id: uid(), label: 'Scarves',            href: '/products?category=Accessory&type=Scarf' },
          { id: uid(), label: 'Belts',              href: '/products?category=Accessory&type=Belt' },
          { id: uid(), label: 'Hair Accessories',   href: '/products?category=Accessory&type=Hair' },
          { id: uid(), label: 'Sunglasses',         href: '/products?category=Accessory&type=Sunglasses' },
        ]},
      ],
      promo: { label: 'Style Extras', tag: 'Complete the Look', color: '#F0FDF4', accent: '#166534' },
    },
  },
  { id: uid(), label: 'Footwear',  href: '/products?category=Footwear', sale: false, mega: null },
  { id: uid(), label: 'Sale',      href: '/products?sale=true',          sale: true,  mega: null },
]

interface MenuStore {
  items: NavItem[]
  setItems:      (items: NavItem[]) => void
  addItem:       (item: NavItem)    => void
  updateItem:    (item: NavItem)    => void
  removeItem:    (id: string)       => void
  moveItem:      (id: string, dir: 'up' | 'down') => void
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      items: SEED_NAV,
      setItems:   (items) => set({ items }),
      addItem:    (item)  => set(s => ({ items: [...s.items, item] })),
      updateItem: (item)  => set(s => ({ items: s.items.map(x => x.id === item.id ? item : x) })),
      removeItem: (id)    => set(s => ({ items: s.items.filter(x => x.id !== id) })),
      moveItem: (id, dir) => set(s => {
        const arr = [...s.items]
        const i = arr.findIndex(x => x.id === id)
        if (dir === 'up'   && i > 0)              [arr[i-1], arr[i]] = [arr[i], arr[i-1]]
        if (dir === 'down' && i < arr.length - 1) [arr[i], arr[i+1]] = [arr[i+1], arr[i]]
        return { items: arr }
      }),
    }),
    { name: 'shajpori-menu' }
  )
)

export { uid }
