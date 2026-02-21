'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { StatusPill } from '@/components/dashboard/status-pill'
import { Modal } from '@/components/dashboard/modal'
import { Button } from '@/components/ui/button'
import { Plus, Star } from 'lucide-react'
import { fetchDrivers, createDriver, statusToFrontend } from '@/lib/api'
import { cn } from '@/lib/utils'
import { PageTransition, FadeSlideIn, AnimatedTableRow, MagneticButton, SkeletonShimmer } from '@/components/animations/motion'

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    license_expiry: '',
  })

  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    setLoading(true)
    try {
      const data = await fetchDrivers()
      setDrivers(data)
    } catch (err) {
      console.error('Failed to load drivers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.license_expiry) {
      setError('Name and license expiry are required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createDriver({
        name: formData.name,
        license_expiry: formData.license_expiry,
      })
      setIsModalOpen(false)
      setFormData({ name: '', license_expiry: '' })
      await loadDrivers()
    } catch (err: any) {
      setError(err.message || 'Failed to create driver')
    } finally {
      setSubmitting(false)
    }
  }

  const isExpired = (date: string) => new Date(date) < new Date()
  const isExpiringSoon = (date: string) => {
    const expiry = new Date(date)
    const inThreeMonths = new Date()
    inThreeMonths.setMonth(inThreeMonths.getMonth() + 3)
    return expiry <= inThreeMonths && expiry >= new Date()
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar title="Human Capital" subtitle="DRIVER PERSONNEL & CERTIFICATIONS" />

      <PageTransition className="ml-64 pt-20 pb-12 px-8">
        <div className="flex justify-between items-center mb-8">
          <FadeSlideIn>
            <h2 className="text-2xl font-black text-white tracking-tight">Personnel Directory</h2>
          </FadeSlideIn>
          <MagneticButton
            onClick={() => { setError(''); setIsModalOpen(true) }}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Driver
          </MagneticButton>
        </div>

        <FadeSlideIn delay={0.2} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Name</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">License Expiry</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">License Status</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-6"><SkeletonShimmer className="h-4 w-full" /></td>
                    </tr>
                  ))
                ) : (
                  drivers.map((driver, i) => {
                    const lStatus = isExpired(driver.license_expiry)
                      ? { label: 'Expired', color: 'text-red-400' }
                      : isExpiringSoon(driver.license_expiry)
                        ? { label: 'Expiring Soon', color: 'text-yellow-400' }
                        : { label: 'Valid', color: 'text-green-400' }

                    return (
                      <AnimatedTableRow key={driver.id} index={i} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{driver.name}</p>
                          <p className="text-[10px] text-muted-foreground/40 tracking-wider">ID: D-{(driver.id + 100).toString()}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                          {new Date(driver.license_expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className={cn('px-6 py-4 text-xs font-bold tracking-tight', lStatus.color)}>
                          {lStatus.label}
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill status={statusToFrontend(driver.status) as any} />
                        </td>
                      </AnimatedTableRow>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </FadeSlideIn>
      </PageTransition>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Driver"
        onSubmit={handleSubmit}
        submitLabel={submitting ? 'Adding...' : 'Add Driver'}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g., Rajesh Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">License Expiry Date</label>
            <input
              type="date"
              value={formData.license_expiry}
              onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
