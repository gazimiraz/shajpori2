import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface AdminProfile {
  name:       string
  email:      string
  title:      string
  avatarColor:string
  avatarText: string
  phone:      string
  bio:        string
}

export interface AdminPreferences {
  compactSidebar:   boolean
  showQuickStats:   boolean
  defaultOrderView: 'all' | 'pending' | 'processing'
  dateFormat:       'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  currency:         'BDT' | 'USD'
  notifyNewOrder:   boolean
  notifyLowStock:   boolean
  notifyNewCustomer:boolean
  language:         'en' | 'bn'
}

interface AdminStore {
  profile:     AdminProfile
  preferences: AdminPreferences
  lastLogin:   string

  setProfile:     (p: Partial<AdminProfile>)     => void
  setPreferences: (p: Partial<AdminPreferences>) => void
  setLastLogin:   (d: string)                    => void
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      profile: {
        name:        'Admin',
        email:       'admin@shajpori.com',
        title:       'Store Manager',
        avatarColor: '#D81B60',
        avatarText:  'A',
        phone:       '',
        bio:         '',
      },
      preferences: {
        compactSidebar:    false,
        showQuickStats:    true,
        defaultOrderView:  'all',
        dateFormat:        'DD/MM/YYYY',
        currency:          'BDT',
        notifyNewOrder:    true,
        notifyLowStock:    true,
        notifyNewCustomer: false,
        language:          'en',
      },
      lastLogin: new Date().toISOString(),

      setProfile:     (p) => set(s => ({ profile:     { ...s.profile,     ...p } })),
      setPreferences: (p) => set(s => ({ preferences: { ...s.preferences, ...p } })),
      setLastLogin:   (d) => set({ lastLogin: d }),
    }),
    { name: 'shajpori-admin', storage: createJSONStorage(() => localStorage) }
  )
)
