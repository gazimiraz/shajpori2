'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const BRAND = '#D81B60'

function LoginForm() {
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading,  setLoading]    = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const from         = searchParams.get('from') ?? '/admin/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        toast.error('Incorrect password')
        setLoading(false)
        return
      }
      toast.success('Welcome back!')
      router.push(from)
      router.refresh()
    } catch {
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Logo card */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: BRAND }}>
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-[22px] font-black text-gray-900">Admin Panel</h1>
          <p className="text-[13px] text-gray-400 mt-1">Shajpori — Restricted Access</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-transparent transition-all"
                />
                <button type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !password}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-white text-[14px] font-bold tracking-wide transition-opacity disabled:opacity-50"
              style={{ background: BRAND }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : 'Enter Admin Panel'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          Shajpori Admin · Authorized access only
        </p>
      </motion.div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
