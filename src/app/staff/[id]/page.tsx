'use client'
import { use } from 'react'
import { useTeamStore, ROLE_COLORS } from '@/lib/teamStore'
import { Mail, Phone, Building2, ShieldCheck, Calendar, CheckCircle2, XCircle, Hash } from 'lucide-react'

const BRAND = '#C2185B'

export default function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const member = useTeamStore(s => s.members.find(m => m.id === id))

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-sm w-full">
          <XCircle size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="font-bold text-gray-800 text-lg">Employee not found</p>
          <p className="text-[13px] text-gray-500 mt-1">This QR code may be outdated or the employee no longer exists.</p>
        </div>
      </div>
    )
  }

  const roleColor = ROLE_COLORS[member.role] ?? '#374151'
  const initials  = member.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const joined    = new Date(member.joinedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #f0f4ff 100%)' }}>
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Banner */}
          <div className="h-28 relative" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)` }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            {/* Company badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="w-4 h-4 rounded-sm flex items-center justify-center text-white text-[9px] font-black" style={{ background: BRAND }}>S</span>
              <span className="text-white text-[10px] font-semibold">Shajpori</span>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center -mt-14 mb-4">
            <div className="ring-4 ring-white rounded-full shadow-lg">
              {member.image ? (
                <img src={member.image} alt={member.name}
                  className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-black"
                  style={{ background: member.avatar }}>
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="px-6 pb-6 text-center space-y-3">
            <div>
              <h1 className="text-[22px] font-black text-gray-900 leading-tight">{member.name}</h1>
              <span className="inline-flex items-center gap-1 mt-1.5 text-[12px] font-mono font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                <Hash size={10} />{member.employeeId}
              </span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold"
                  style={{ background: roleColor + '18', color: roleColor }}>
                  <ShieldCheck size={11} />{member.role}
                </span>
                {member.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-600">
                    <CheckCircle2 size={10} />Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">
                    <XCircle size={10} />Inactive
                  </span>
                )}
              </div>
            </div>

            {member.bio && (
              <p className="text-[13px] text-gray-500 leading-relaxed">{member.bio}</p>
            )}

            {/* Details list */}
            <div className="space-y-2.5 text-left mt-4 pt-4 border-t border-gray-100">
              {member.department && (
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Building2 size={14} className="text-gray-500" />
                  </span>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Department</p>
                    <p className="text-[13px] font-semibold text-gray-800">{member.department}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-gray-500" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Email</p>
                  <p className="text-[13px] font-semibold text-gray-800 truncate">{member.email}</p>
                </div>
              </div>

              {member.phone && (
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-gray-500" />
                  </span>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Phone</p>
                    <p className="text-[13px] font-semibold text-gray-800">{member.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-gray-500" />
                </span>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Joined</p>
                  <p className="text-[13px] font-semibold text-gray-800">{joined}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-center gap-2">
              <span className="w-5 h-5 rounded-sm flex items-center justify-center text-white text-[9px] font-black" style={{ background: BRAND }}>S</span>
              <span className="text-[11px] text-gray-400">Official Shajpori Employee ID</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          This page is auto-generated from the Shajpori admin panel.
        </p>
      </div>
    </div>
  )
}
