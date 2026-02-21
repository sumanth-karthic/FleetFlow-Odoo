'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { StatusPill } from '@/components/dashboard/status-pill'
import { Modal } from '@/components/dashboard/modal'
import { Button } from '@/components/ui/button'
import { Plus, Play, CheckCircle, XCircle, Info } from 'lucide-react'
import { fetchTrips, fetchVehicles, fetchDrivers, createTrip, updateTripStatus, statusToFrontend, getVehicleName, getDriverName } from '@/lib/api'
import { cn } from '@/lib/utils'
import { PageTransition, FadeSlideIn, AnimatedTableRow, MagneticButton, SkeletonShimmer } from '@/components/animations/motion'
import { motion } from 'framer-motion'

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelTripId, setCancelTripId] = useState<number | null>(null)
  const [cancelTripStatus, setCancelTripStatus] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    origin: '',
    destination: '',
    cargo_weight: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tripData, vehicleData, driverData] = await Promise.all([
        fetchTrips(),
        fetchVehicles(true),
        fetchDrivers(),
      ])
      setTrips(tripData)
      setVehicles(vehicleData)
      setDrivers(driverData)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTrip = async () => {
    if (!formData.vehicle_id || !formData.driver_id || !formData.origin || !formData.destination || !formData.cargo_weight) {
      setError('All fields are required')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await createTrip({
        vehicle_id: Number(formData.vehicle_id),
        driver_id: Number(formData.driver_id),
        origin: formData.origin,
        destination: formData.destination,
        cargo_weight: Number(formData.cargo_weight),
      })
      setSuccess('Trip created successfully!')
      setFormData({ vehicle_id: '', driver_id: '', origin: '', destination: '', cargo_weight: '' })
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to create trip')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (tripId: number, newStatus: string, reason?: string) => {
    try {
      await updateTripStatus(tripId, newStatus, reason)
      setSuccess(`Trip status updated to "${newStatus}"`)
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    }
  }

  const handleCancelClick = (tripId: number, tripStatus: string) => {
    if (tripStatus === 'Dispatched') {
      setCancelTripId(tripId)
      setCancelTripStatus(tripStatus)
      setCancelReason('')
      setCancelModalOpen(true)
    } else {
      handleStatusUpdate(tripId, 'Cancelled')
    }
  }

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) {
      setError('Cancel reason is required for dispatched trips')
      return
    }
    setCancelModalOpen(false)
    if (cancelTripId) {
      await handleStatusUpdate(cancelTripId, 'Cancelled', cancelReason.trim())
    }
    setCancelTripId(null)
    setCancelReason('')
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar title="Trip Dispatcher" subtitle="Create and manage deliveries" />

      <PageTransition className="ml-64 pt-20 pb-12 px-8">
        {/* Notifications */}
        {error && (
          <motion.div
            className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
            <button onClick={() => setError('')} className="float-right text-red-400 hover:text-red-300">×</button>
          </motion.div>
        )}
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

        {/* Create Trip Form */}
        <FadeSlideIn delay={0.05}>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Create New Trip</h2>
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Vehicle</label>
                  <select
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select vehicle...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plate} - {v.name} ({Number(v.capacity).toLocaleString()} kg)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Driver</label>
                  <select
                    value={formData.driver_id}
                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select driver...</option>
                    {drivers.filter(d => d.status !== 'Suspended').map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Origin</label>
                  <input
                    type="text"
                    placeholder="Departure city"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Destination</label>
                  <input
                    type="text"
                    placeholder="Arrival city"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="kg"
                    value={formData.cargo_weight}
                    onChange={(e) => setFormData({ ...formData, cargo_weight: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="mt-6">
                <MagneticButton
                  onClick={handleCreateTrip}
                  disabled={submitting}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {submitting ? 'Initializing...' : 'Dispatch Trip'}
                </MagneticButton>
              </div>
            </div>
          </section>
        </FadeSlideIn>

        {/* Trips Table */}
        <FadeSlideIn delay={0.2} className="glass-card rounded-2xl overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01]">
            <h2 className="text-lg font-black text-white tracking-tight uppercase">Active Logistics Hub</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Vehicle</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Driver</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Route</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Cargo Weight</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Status</th>
                  <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-6"><SkeletonShimmer className="h-4 w-full" /></td>
                    </tr>
                  ))
                ) : trips.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No dispatch logs found</td>
                  </tr>
                ) : (
                  trips.map((trip, i) => (
                    <AnimatedTableRow key={trip.id} index={i} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {getVehicleName(trip.vehicle_id, vehicles)}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {getDriverName(trip.driver_id, drivers)}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {trip.origin} → {trip.destination}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {Number(trip.cargo_weight).toLocaleString()} kg
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <StatusPill status={statusToFrontend(trip.status) as any} />
                          {trip.status === 'Cancelled' && trip.cancel_reason && (
                            <span
                              title={trip.cancel_reason}
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-900/30 border border-red-800 text-red-300 cursor-help"
                            >
                              <Info className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1">
                          {trip.status === 'Draft' && (
                            <motion.button
                              title="Dispatch"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                              onClick={() => handleStatusUpdate(trip.id, 'Dispatched')}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Play className="w-4 h-4" />
                            </motion.button>
                          )}
                          {trip.status === 'Dispatched' && (
                            <motion.button
                              title="Complete"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-green-400 hover:text-green-300 hover:bg-green-900/20"
                              onClick={() => handleStatusUpdate(trip.id, 'Completed')}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>
                          )}
                          {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                            <motion.button
                              title={trip.status === 'Dispatched' ? 'Cancel (reason required)' : 'Cancel'}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              onClick={() => handleCancelClick(trip.id, trip.status)}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <XCircle className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
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
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Dispatched Trip"
        onSubmit={handleCancelSubmit}
        submitLabel="Confirm Cancellation"
      >
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-3 py-2 rounded-lg text-sm">
            ⚠ This trip is currently <strong>on-trip (Dispatched)</strong>. A cancel reason is required.
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Cancel Reason</label>
            <textarea
              placeholder="e.g., Road closure, vehicle breakdown, client request..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={3}
              autoFocus
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
