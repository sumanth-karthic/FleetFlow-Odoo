'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { KPICard } from '@/components/dashboard/kpi-card'
import { Modal } from '@/components/dashboard/modal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { fetchFuelLogs, fetchVehicles, addFuelLog, getVehicleName, statusToFrontend } from '@/lib/api'
import { cn } from '@/lib/utils'
import { PageTransition, FadeSlideIn, AnimatedTableRow, MagneticButton, SkeletonShimmer } from '@/components/animations/motion'
import { motion } from 'framer-motion'

export default function ExpensesPage() {
  const [fuelLogs, setFuelLogs] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    vehicle_id: '',
    liters: '',
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
        fetchFuelLogs(),
        fetchVehicles(),
      ])
      setFuelLogs(logData)
      setVehicles(vehicleData)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.vehicle_id || !formData.liters || !formData.cost || !formData.date) {
      setError('All fields are required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await addFuelLog({
        vehicle_id: Number(formData.vehicle_id),
        liters: Number(formData.liters),
        cost: Number(formData.cost),
        date: formData.date,
      })
      setIsModalOpen(false)
      setFormData({ vehicle_id: '', liters: '', cost: '', date: '' })
      setSuccess('Fuel log added successfully!')
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to add fuel log')
    } finally {
      setSubmitting(false)
    }
  }

  const totalFuel = fuelLogs.reduce((sum, log) => sum + Number(log.liters), 0)
  const totalCost = fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar title="Fuel & Expenses" subtitle="Monitor fuel consumption and operational costs" />

      <PageTransition className="ml-64 pt-20 pb-12 px-8">
        {success && (
          <motion.div
            className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {success}
          </motion.div>
        )}

        {/* Summary Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              title="Total Records"
              value={loading ? '...' : fuelLogs.length}
              index={0}
            />
            <KPICard
              title="Total Fuel Used"
              value={loading ? '...' : `${totalFuel.toLocaleString()} L`}
              index={1}
            />
            <KPICard
              title="Total Cost"
              value={loading ? '...' : `₹${totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              variant="warning"
              index={2}
            />
          </div>
        </section>

        <div className="flex justify-between items-center mb-8">
          <FadeSlideIn>
            <h2 className="text-2xl font-black text-white tracking-tight">Fuel & Expenses</h2>
          </FadeSlideIn>
          <MagneticButton
            onClick={() => { setError(''); setIsModalOpen(true) }}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Log Fuel Receipt
          </MagneticButton>
        </div>

        <FadeSlideIn delay={0.2} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Vehicle</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Volume (L)</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Amount (INR)</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Rate (₹/L)</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-6"><SkeletonShimmer className="h-4 w-full" /></td>
                    </tr>
                  ))
                ) : fuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground font-mono text-xs italic opacity-50">No expense records found in repository</td>
                  </tr>
                ) : (
                  fuelLogs.map((log, i) => (
                    <AnimatedTableRow key={log.id} index={i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-white">{getVehicleName(log.vehicle_id, vehicles)}</td>
                      <td className="px-6 py-4 text-xs font-mono text-foreground font-semibold">{log.liters} L</td>
                      <td className="px-6 py-4 text-xs font-mono text-primary font-bold">₹{Number(log.cost).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground font-mono">₹{(Number(log.cost) / Number(log.liters)).toFixed(2)}/L</td>
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
        title="Fuel Receipt Entry"
        onSubmit={handleSubmit}
        submitLabel={submitting ? 'Auditing...' : 'Archive Receipt'}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Volume (Liters)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.liters}
                  onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
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
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Transaction Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
