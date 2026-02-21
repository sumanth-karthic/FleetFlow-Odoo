'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { Modal } from '@/components/dashboard/modal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { fetchMaintenance, fetchVehicles, addMaintenance, getVehicleName, statusToFrontend } from '@/lib/api'
import { cn } from '@/lib/utils'
import { PageTransition, FadeSlideIn, AnimatedTableRow, MagneticButton, SkeletonShimmer } from '@/components/animations/motion'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen">
      <Sidebar />
      <Topbar title="Asset Maintenance" subtitle="SERVICE HISTORY & TECHNICAL LOGS" />

      <PageTransition className="ml-64 pt-20 pb-12 px-8">
        <div className="flex justify-between items-center mb-8">
          <FadeSlideIn>
            <h2 className="text-2xl font-black text-white tracking-tight">Maintenance Logs</h2>
          </FadeSlideIn>
          <MagneticButton
            onClick={() => { setError(''); setIsModalOpen(true) }}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Service Entry
          </MagneticButton>
        </div>

        <FadeSlideIn delay={0.2} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Vehicle</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Service Description</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Cost (INR)</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-6"><SkeletonShimmer className="h-4 w-full" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground font-mono text-xs italic opacity-50">No service records found in repository</td>
                  </tr>
                ) : (
                  logs.map((log, i) => (
                    <AnimatedTableRow key={log.id} index={i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-white">{getVehicleName(log.vehicle_id, vehicles)}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground/80">{log.note}</td>
                      <td className="px-6 py-4 text-xs font-mono text-primary font-bold">₹{Number(log.cost).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </AnimatedTableRow>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </FadeSlideIn>
      </PageTransition>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Engineering Service Registry"
        onSubmit={handleSubmit}
        submitLabel={submitting ? 'Archiving...' : 'Register Service'}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Asset Selection</label>
              <select
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
              >
                <option value="" className="bg-[#080808]">Select Portfolio Asset</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#080808]">{v.name} ({v.plate})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Technical Description</label>
              <textarea
                placeholder="Major engine overhaul, technical audit, etc."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Audit Cost (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Log Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
