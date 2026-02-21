'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Truck, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { LiquidEther } from '@/components/animations/liquid-ether'
import { FadeSlideIn, MagneticButton } from '@/components/animations/motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const isDemoLogin = email === 'demo@fleetflow.com' && password === 'demo123'

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (isDemoLogin) {
          loginAsDemo()
          return
        }
        setError(data.error || 'Invalid email or password')
        setIsLoading(false)
        return
      }

      localStorage.setItem('fleetflow_token', data.data.access_token)
      localStorage.setItem('fleetflow_user', JSON.stringify(data.data.user))
      router.push('/dashboard')
    } catch {
      loginAsDemo()
    } finally {
      setIsLoading(false)
    }
  }

  const loginAsDemo = () => {
    localStorage.setItem('fleetflow_token', 'demo-token')
    localStorage.setItem('fleetflow_user', JSON.stringify({
      id: 'demo',
      name: 'Demo Manager',
      email: 'demo@fleetflow.com',
      role: 'Manager',
    }))
    router.push('/dashboard')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <LiquidEther
        colors={['#5227FF', '#FF9FFC', '#B19EEF']}
        mouseForce={20}
        cursorSize={100}
        isViscous
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
        color0="#5227FF"
        color1="#FF9FFC"
        color2="#B19EEF"
      />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <FadeSlideIn direction="up" delay={0.1}>
            <div className="flex justify-center mb-4">
              <motion.div
                className="w-16 h-16 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.2)]"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <Truck className="w-8 h-8 text-primary" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">FleetFlow</h1>
            <p className="text-muted-foreground/60 text-xs font-bold tracking-[0.2em] uppercase">Logistics Intelligence</p>
          </FadeSlideIn>
        </div>

        {/* Login Card */}
        <FadeSlideIn delay={0.2} className="glass-card p-8 rounded-3xl border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative z-10">
            <h2 className="text-xl font-black text-white mb-6 tracking-tight uppercase">Security Access</h2>

            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-xs font-bold uppercase tracking-wider"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                  Identifier
                </label>
                <input
                  type="email"
                  placeholder="name@fleetflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                  Passkey
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <label className="flex items-center gap-2 cursor-pointer group/check">
                  <div className="w-4 h-4 rounded border border-white/10 bg-white/5 flex items-center justify-center transition-colors group-hover/check:border-primary/50">
                    <input type="checkbox" className="hidden" />
                  </div>
                  <span className="text-muted-foreground group-hover/check:text-white transition-colors">Persistent Session</span>
                </label>
                <Link href="#" className="text-primary/70 hover:text-primary transition-colors">
                  Lost Credentials?
                </Link>
              </div>

              <MagneticButton
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:brightness-110 transition-all mt-4"
              >
                {isLoading ? 'Verifying...' : 'Authenticate Access'}
              </MagneticButton>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold tracking-widest uppercase">
                <span className="px-4 bg-[#0a0a0a]/50 backdrop-blur-md text-muted-foreground/40">Diagnostic Access</span>
              </div>
            </div>

            {/* Demo Info */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">System ID</span>
                <span className="text-[10px] font-mono text-primary/80">demo@fleetflow.com</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Access Key</span>
                <span className="text-[10px] font-mono text-primary/80">demo123</span>
              </div>
            </div>
          </div>
        </FadeSlideIn>

        {/* Footer */}
        <FadeSlideIn delay={0.4} direction="up" className="text-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em] mt-10">
          Built with &hearts; for the FleetFlow Ecosystem v1.2
        </FadeSlideIn>
      </motion.div>
    </div>
  )
}
