'use client'
export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AuthPage() {
  const [mode,       setMode]       = useState<'login' | 'signup'>('login')
  const [loading,    setLoading]    = useState(false)
  const [showPass,   setShowPass]   = useState(false)
  const [sent,       setSent]       = useState(false)   // email confirmation sent
  const [form,       setForm]       = useState({ email: '', password: '', full_name: '' })

  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null)
  if (!supabaseRef.current) supabaseRef.current = createBrowserClient()
  const supabase = supabaseRef.current
  const router   = useRouter()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function friendlyError(msg: string): string {
    if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.'
    if (msg.includes('Email not confirmed'))        return 'Please confirm your email first. Check your inbox.'
    if (msg.includes('User already registered'))    return 'An account with this email already exists. Try signing in.'
    if (msg.includes('Password should be'))         return 'Password must be at least 6 characters.'
    if (msg.includes('rate limit'))                 return 'Too many attempts. Please wait a moment.'
    if (msg.includes('fetch') || msg.includes('network')) return 'Connection error. Check your internet.'
    return msg
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error) { toast.error(friendlyError(error.message)); return }
        toast.success('Welcome back!')
        router.push('/')
        router.refresh()

      } else {
        const { data, error } = await supabase.auth.signUp({
          email:    form.email,
          password: form.password,
          options:  { data: { full_name: form.full_name } },
        })
        if (error) { toast.error(friendlyError(error.message)); return }

        // If identities is empty, email already registered
        if (data.user && data.user.identities?.length === 0) {
          toast.error('An account with this email already exists. Try signing in.')
          setMode('login')
          return
        }

        setSent(true)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? friendlyError(err.message) : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) toast.error(friendlyError(error.message))
  }

  const resendConfirmation = async () => {
    const { error } = await supabase.auth.resend({ type: 'signup', email: form.email })
    if (error) toast.error(friendlyError(error.message))
    else toast.success('Confirmation email resent!')
  }

  // ── Email sent confirmation screen ──────────────────────────
  if (sent) {
    return (
      <div className="min-h-screen bg-[#FFF0F4] flex items-center justify-center p-4">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h2 className="text-[22px] font-black text-gray-900 mb-2">Check your email</h2>
          <p className="text-[14px] text-gray-500 mb-1">We sent a confirmation link to</p>
          <p className="text-[14px] font-bold text-[#D81B60] mb-6">{form.email}</p>
          <p className="text-[12px] text-gray-400 mb-6">Click the link in the email to activate your account, then come back to sign in.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setSent(false); setMode('login') }}
              className="w-full py-3 rounded-full text-white font-bold text-[14px]"
              style={{ background: '#D81B60' }}>
              Go to Sign In
            </button>
            <button onClick={resendConfirmation}
              className="w-full py-3 rounded-full border border-gray-200 text-gray-500 font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} /> Resend email
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF0F4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="text-center mb-8">
          <Link href="/" className="font-display text-4xl font-black text-gray-900">
            Shaj<span style={{ color:'#D81B60' }}>pori</span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">Your favourite fashion destination</p>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
          className="bg-white rounded-3xl shadow-lg p-8">

          {/* Mode toggle */}
          <div className="flex bg-gray-50 rounded-2xl p-1 mb-8">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="relative flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors">
                {mode === m && (
                  <motion.div layoutId="authTab"
                    className="absolute inset-0 bg-white shadow-sm rounded-xl" />
                )}
                <span className={`relative z-10 ${mode === m ? 'text-gray-900' : 'text-gray-400'}`}>
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div key="name"
                  initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input type="text" value={form.full_name} onChange={set('full_name')}
                      placeholder="Your full name" required={mode === 'signup'}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D81B60] focus:ring-2 focus:ring-[#D81B60]/20 outline-none text-sm transition-all" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="hello@example.com" required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D81B60] focus:ring-2 focus:ring-[#D81B60]/20 outline-none text-sm transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="••••••••" required minLength={6}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-gray-200 focus:border-[#D81B60] focus:ring-2 focus:ring-[#D81B60]/20 outline-none text-sm transition-all" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <Link href="/auth/reset" className="text-xs text-[#D81B60] hover:opacity-80 font-medium">
                  Forgot password?
                </Link>
              </div>
            )}

            <motion.button type="submit" disabled={loading}
              className="w-full text-white rounded-full py-3.5 font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-60 transition-opacity"
              style={{ background: '#D81B60' }}
              whileTap={{ scale: 0.98 }}>
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>{mode === 'login' ? 'Sign In' : 'Create Account'}<ArrowRight size={16} /></>}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or continue with</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Google */}
          <motion.button onClick={handleGoogle} whileTap={{ scale:0.97 }}
            className="w-full border-2 border-gray-100 rounded-full py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:border-[#D81B60]/30 transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-[#D81B60] hover:underline">Terms</Link> &{' '}
          <Link href="/privacy" className="text-[#D81B60] hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
