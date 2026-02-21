'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { StatusPill } from '@/components/dashboard/status-pill'
import { Modal } from '@/components/dashboard/modal'
import { Button } from '@/components/ui/button'
import { Plus, AlertTriangle } from 'lucide-react'
import { fetchVehicles, createVehicle, statusToFrontend } from '@/lib/api'

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
      await loadVehicles() // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create vehicle')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar title="Vehicle Registry" subtitle="Manage your fleet inventory" />

      <main className="ml-64 pt-20 pb-12 px-8">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">All Vehicles</h2>
          <Button
            onClick={handleAddVehicle}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Vehicle
          </Button>
        </div>

        {/* Vehicles Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Plate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Model</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Capacity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Odometer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Loading vehicles...</td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No vehicles found</td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{vehicle.name}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{vehicle.plate}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{vehicle.model}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{Number(vehicle.capacity).toLocaleString()} kg</td>
                      <td className="px-6 py-4 text-sm text-foreground">{Number(vehicle.odometer).toLocaleString()} km</td>
                      <td className="px-6 py-4 text-sm">
                        <StatusPill status={statusToFrontend(vehicle.status) as any} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {vehicle.maintenance_flag ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-900/30 text-yellow-300 border border-yellow-800">
                            <AlertTriangle className="w-3 h-3" />
                            {vehicle.maintenance_flag}
                          </span>
                        ) : (
                          <span className="text-green-400 text-xs font-medium">Healthy</span>
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
              placeholder="e.g., Freightliner Cascadia"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">License Plate</label>
            <input
              type="text"
              placeholder="e.g., FL-001"
              value={formData.plate}
              onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Model</label>
            <input
              type="text"
              placeholder="e.g., Cascadia 126"
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
