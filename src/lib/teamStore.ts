import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MemberStatus = 'active' | 'inactive'

export interface TeamMember {
  id: string
  employeeId: string   // e.g. SHJ-001
  name: string
  email: string
  phone: string
  role: string
  status: MemberStatus
  joinedAt: string
  avatar: string       // hex color fallback
  image?: string       // base64 data URL
  bio?: string
  department?: string
}

export const ROLES = ['Super Admin', 'Store Manager', 'Sales Staff', 'Inventory Manager', 'Accountant']

export const ROLE_COLORS: Record<string, string> = {
  'Super Admin':       '#C2185B',
  'Store Manager':     '#7C3AED',
  'Sales Staff':       '#0284C7',
  'Inventory Manager': '#059669',
  'Accountant':        '#B45309',
}

export const AVATAR_COLORS = [
  '#C2185B', '#7C3AED', '#1D4ED8', '#0F766E',
  '#B45309', '#374151', '#DC2626', '#059669',
]

export const SEED_DEPARTMENTS = [
  'Management', 'Operations', 'Sales', 'Warehouse',
  'Finance', 'Marketing', 'Customer Support', 'Tailoring',
]

const SEED: TeamMember[] = [
  { id: 'm1', employeeId: 'SHJ-001', name: 'Miraz Gazi',    email: 'gazimiraz@gmail.com',  phone: '01700000001', role: 'Super Admin',       status: 'active',   joinedAt: '2024-01-01', avatar: '#C2185B', department: 'Management' },
  { id: 'm2', employeeId: 'SHJ-002', name: 'Riya Akter',    email: 'riya@shajpori.com',     phone: '01700000002', role: 'Store Manager',     status: 'active',   joinedAt: '2024-03-15', avatar: '#7C3AED', department: 'Operations' },
  { id: 'm3', employeeId: 'SHJ-003', name: 'Kabir Hossain', email: 'kabir@shajpori.com',    phone: '01700000003', role: 'Sales Staff',       status: 'active',   joinedAt: '2024-05-10', avatar: '#1D4ED8', department: 'Sales' },
  { id: 'm4', employeeId: 'SHJ-004', name: 'Nasrin Begum',  email: 'nasrin@shajpori.com',   phone: '01700000004', role: 'Inventory Manager', status: 'active',   joinedAt: '2024-06-20', avatar: '#0F766E', department: 'Warehouse' },
  { id: 'm5', employeeId: 'SHJ-005', name: 'Rahim Uddin',   email: 'rahim@shajpori.com',    phone: '01700000005', role: 'Accountant',        status: 'inactive', joinedAt: '2024-08-01', avatar: '#B45309', department: 'Finance' },
]

interface TeamStore {
  members:     TeamMember[]
  departments: string[]
  nextSeq:     number   // auto-increment for employee IDs

  addMember:       (m: TeamMember) => void
  updateMember:    (m: TeamMember) => void
  deleteMember:    (id: string)    => void
  toggleStatus:    (id: string)    => void
  addDepartment:   (name: string)  => void
  removeDepartment:(name: string)  => void
  nextEmployeeId:  () => string
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      members:     SEED,
      departments: SEED_DEPARTMENTS,
      nextSeq:     6,   // SEED has 5 members, next is 6

      addMember: (m) => set(s => ({ members: [...s.members, m], nextSeq: s.nextSeq + 1 })),
      updateMember: (m) => set(s => ({ members: s.members.map(x => x.id === m.id ? m : x) })),
      deleteMember: (id) => set(s => ({ members: s.members.filter(m => m.id !== id) })),
      toggleStatus: (id) => set(s => ({
        members: s.members.map(m => m.id === id
          ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' }
          : m
        ),
      })),

      addDepartment: (name) => set(s => ({
        departments: s.departments.includes(name) ? s.departments : [...s.departments, name],
      })),
      removeDepartment: (name) => set(s => ({
        departments: s.departments.filter(d => d !== name),
      })),

      nextEmployeeId: () => {
        const seq = get().nextSeq
        return `SHJ-${String(seq).padStart(3, '0')}`
      },
    }),
    { name: 'shajpori-team' }
  )
)
