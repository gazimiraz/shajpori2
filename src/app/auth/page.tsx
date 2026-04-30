'use client'
// src/app/(store)/auth/page.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const supabase = createBrowserClient()
  const router = useRouter()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error) throw error
        toast.success('Welcome back! 🎉')
        router.push('/')
        router.refresh()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.full_name } },
        })
        if (error) throw error

        // Create user profile
        if (data.user) {
          await supabase.from('users').insert({
            id: data.user.id,
            email: form.email,
            full_name: form.full_name,
          })
        }
        toast.success('Account created! Check your email to verify. 💕')
        setMode('login')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-pale-pink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="font-display text-4xl font-black text-charcoal">
            Shaj<span className="text-pink">pori</span>
          </Link>
          <p className="text-muted text-sm mt-2">Your favourite fashion destination</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white rounded-3xl shadow-lift p-8"
        >
          {/* Mode toggle */}
          <div className="flex bg-gray-50 rounded-2xl p-1 mb-8">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="relative flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors"
              >
                {mode === m && (
                  <motion.div
                    layoutId="authTab"
                    className="absolute inset-0 bg-white shadow-sm rounded-xl"
                  />
                )}
                <span className={`relative z-10 ${mode === m ? 'text-charcoal' : 'text-muted'}`}>
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={set('full_name')}
                      placeholder="Your full name"
                      required={mode === 'signup'}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border focus:border-pink focus:ring-2 focus:ring-pink/20 outline-none text-sm transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="hello@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border focus:border-pink focus:ring-2 focus:ring-pink/20 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-border focus:border-pink focus:ring-2 focus:ring-pink/20 outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <Link href="/auth/reset" className="text-xs text-pink hover:text-pink-hot font-medium">Forgot password?</Link>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-pink text-white rounded-full py-3.5 font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              whileHover={{ backgroundColor: '#FF1493' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted font-medium">or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google */}
          <motion.button
            onClick={handleGoogle}
            className="w-full border-2 border-border rounded-full py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:border-pink/50 transition-colors"
            whileTap={{ scale: 0.97 }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>
        </motion.div>

        <p className="text-center text-xs text-muted mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-pink hover:underline">Terms</Link> &{' '}
          <Link href="/privacy" className="text-pink hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
