'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Truck, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

    // Demo bypass — allow demo credentials to work without Supabase setup
    const isDemoLogin = email === 'demo@fleetflow.com' && password === 'demo123'

    try {
      // Call the backend login API
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        // If demo credentials were used but backend auth failed, bypass to dashboard
        if (isDemoLogin) {
          loginAsDemo()
          return
        }
        setError(data.error || 'Invalid email or password')
        setIsLoading(false)
        return
      }

      // Store token and user profile in localStorage
      localStorage.setItem('fleetflow_token', data.data.access_token)
      localStorage.setItem('fleetflow_user', JSON.stringify(data.data.user))

      // Navigate to dashboard
      router.push('/dashboard')
    } catch {
      // If backend is unreachable, use demo bypass
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">FleetFlow</h1>
          <p className="text-muted-foreground">Fleet & Logistics Management Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-foreground mb-6">Welcome Back</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-secondary border-border cursor-pointer"
                />
                <span className="text-foreground">Remember me</span>
              </label>
              <Link
                href="#"
                className="text-primary hover:text-primary/90 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-semibold mt-6"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Demo Account</span>
            </div>
          </div>

          {/* Demo Info */}
          <div className="bg-secondary/50 border border-border rounded-lg p-4 text-sm">
            <p className="text-muted-foreground mb-2">
              <strong className="text-foreground">Demo Email:</strong> demo@fleetflow.com
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Demo Password:</strong> demo123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Made with &hearts; by FleetFlow Team
        </p>
      </div>
    </div>
  )
}
