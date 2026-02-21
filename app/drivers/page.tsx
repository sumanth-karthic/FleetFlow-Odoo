'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { StatusPill } from '@/components/dashboard/status-pill'
import { Modal } from '@/components/dashboard/modal'
import { Button } from '@/components/ui/button'
import { Plus, Star } from 'lucide-react'
import { fetchDrivers, createDriver, statusToFrontend } from '@/lib/api'

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
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar title="Driver Management" subtitle="Monitor driver performance and assignments" />

      <main className="ml-64 pt-20 pb-12 px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">All Drivers</h2>
          <Button
            onClick={() => { setError(''); setIsModalOpen(true) }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Driver
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">License Expiry</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">License Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading drivers...</td>
                  </tr>
                ) : drivers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No drivers found</td>
                  </tr>
                ) : (
                  drivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{driver.name}</td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {new Date(driver.license_expiry).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StatusPill status={statusToFrontend(driver.status) as any} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {isExpired(driver.license_expiry) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-900/30 text-red-300 border border-red-800">
                            ⚠ Expired
                          </span>
                        ) : isExpiringSoon(driver.license_expiry) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-900/30 text-yellow-300 border border-yellow-800">
                            Expiring Soon
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-400 text-xs font-medium">
                            <Star className="w-3 h-3" /> Valid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

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
              placeholder="e.g., John Carter"
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
