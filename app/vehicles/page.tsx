'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { StatusPill } from '@/components/dashboard/status-pill'
import { Modal } from '@/components/dashboard/modal'
import { Button } from '@/components/ui/button'
import { Plus, AlertTriangle } from 'lucide-react'
import { fetchVehicles, createVehicle, statusToFrontend } from '@/lib/api'
import { cn } from '@/lib/utils'
import { PageTransition, FadeSlideIn, AnimatedTableRow, MagneticButton, SkeletonShimmer } from '@/components/animations/motion'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    plate: '',
    model: '',
    capacity: '',
    odometer: '',
  })

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    setLoading(true)
    try {
      const data = await fetchVehicles()
      setVehicles(data)
    } catch (err) {
      console.error('Failed to load vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = () => {
    setFormData({ name: '', plate: '', model: '', capacity: '', odometer: '' })
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.plate || !formData.model || !formData.capacity) {
      setError('All fields are required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createVehicle({
        name: formData.name,
        plate: formData.plate,
        model: formData.model,
        capacity: Number(formData.capacity),
        odometer: Number(formData.odometer) || 0,
      })
      setIsModalOpen(false)
      setFormData({ name: '', plate: '', model: '', capacity: '', odometer: '' })
      await loadVehicles()
    } catch (err: any) {
      setError(err.message || 'Failed to create vehicle')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar title="Vehicle Assets" subtitle="FLEET INVENTORY & STATUS MONITORING" />

      <PageTransition className="ml-64 pt-20 pb-12 px-8">
        <div className="flex justify-between items-center mb-8">
          <FadeSlideIn>
            <h2 className="text-2xl font-black text-white tracking-tight">Fleet Registry</h2>
          </FadeSlideIn>
          <MagneticButton
            onClick={handleAddVehicle}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Vehicle
          </MagneticButton>
        </div>

        <FadeSlideIn delay={0.2} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Name</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Plate No</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Model</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Capacity</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Odometer</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Status</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-6"><SkeletonShimmer className="h-4 w-full" /></td>
                    </tr>
                  ))
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No vehicles found</td>
                  </tr>
                ) : (
                  vehicles.map((vehicle, i) => (
                    <AnimatedTableRow key={vehicle.id} index={i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{vehicle.name}</p>
                        <p className="text-[10px] text-muted-foreground/40 font-mono tracking-tighter">ID: V-{vehicle.id + 100}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">{vehicle.plate}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{vehicle.model}</td>
                      <td className="px-6 py-4 text-xs text-foreground font-semibold">{(vehicle.capacity / 1000).toFixed(1)}t</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground font-mono">{Number(vehicle.odometer).toLocaleString()} km</td>
                      <td className="px-6 py-4"><StatusPill status={statusToFrontend(vehicle.status) as any} /></td>
                      <td className="px-6 py-4">
                        {vehicle.maintenance_flag ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 uppercase tracking-tight">
                            <AlertTriangle className="w-3 h-3" />
                            {vehicle.maintenance_flag}
                          </span>
                        ) : (
                          <span className="text-primary text-[10px] font-bold uppercase tracking-widest">Optimal</span>
                        )}
                      </td>
                    </AnimatedTableRow>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </FadeSlideIn>
      </PageTransition>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Vehicle"
        onSubmit={handleSubmit}
        submitLabel={submitting ? 'Adding...' : 'Add Vehicle'}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Vehicle Name</label>
            <input
              type="text"
              placeholder="e.g., Tata Prima 4928"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">License Plate</label>
            <input
              type="text"
              placeholder="e.g., MH-12-AB-1001"
              value={formData.plate}
              onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Model</label>
            <input
              type="text"
              placeholder="e.g., Prima 4928.S"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Capacity (kg)</label>
              <input
                type="number"
                placeholder="e.g., 20000"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Odometer (km)</label>
              <input
                type="number"
                placeholder="e.g., 0"
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
