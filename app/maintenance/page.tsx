'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { Modal } from '@/components/dashboard/modal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { fetchMaintenance, fetchVehicles, addMaintenance, getVehicleName } from '@/lib/api'

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    vehicle_id: '',
    note: '',
    cost: '',
    date: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [logData, vehicleData] = await Promise.all([
        fetchMaintenance(),
        fetchVehicles(),
      ])
      setLogs(logData)
      setVehicles(vehicleData)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.vehicle_id || !formData.note || !formData.cost || !formData.date) {
      setError('All fields are required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await addMaintenance({
        vehicle_id: Number(formData.vehicle_id),
        note: formData.note,
        cost: Number(formData.cost),
        date: formData.date,
      })
      setIsModalOpen(false)
      setFormData({ vehicle_id: '', note: '', cost: '', date: '' })
      setSuccess('Maintenance log added. Vehicle set to "In Shop".')
      await loadData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(err.message || 'Failed to add maintenance')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar title="Maintenance Logs" subtitle="Track vehicle maintenance and repairs" />

      <main className="ml-64 pt-20 pb-12 px-8">
        {success && (
          <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Maintenance Records</h2>
          <Button
            onClick={() => { setError(''); setIsModalOpen(true) }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Maintenance
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Vehicle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Service Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Cost</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No maintenance records</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {getVehicleName(log.vehicle_id, vehicles)}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{log.note}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-accent">
                        ${Number(log.cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {new Date(log.date).toLocaleDateString()}
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
        title="Add Maintenance Record"
        onSubmit={handleSubmit}
        submitLabel={submitting ? 'Adding...' : 'Add Record'}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Vehicle</label>
            <select
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plate} - {v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Service Description</label>
            <textarea
              placeholder="Describe the maintenance work..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Cost ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
