'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { StatusPill } from '@/components/dashboard/status-pill'
import { Button } from '@/components/ui/button'
import { Plus, Play, CheckCircle, XCircle } from 'lucide-react'
import { fetchTrips, fetchVehicles, fetchDrivers, createTrip, updateTripStatus, statusToFrontend, getVehicleName, getDriverName } from '@/lib/api'

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
        fetchVehicles(true), // Only available vehicles
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

  const handleStatusUpdate = async (tripId: number, newStatus: string) => {
    try {
      await updateTripStatus(tripId, newStatus)
      setSuccess(`Trip status updated to "${newStatus}"`)
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar title="Trip Dispatcher" subtitle="Create and manage deliveries" />

      <main className="ml-64 pt-20 pb-12 px-8">
        {/* Notifications */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
            <button onClick={() => setError('')} className="float-right text-red-400 hover:text-red-300">×</button>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Create Trip Form */}
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
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
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
              <Button
                onClick={handleCreateTrip}
                disabled={submitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Plus className="w-5 h-5" />
                {submitting ? 'Creating...' : 'Create Trip'}
              </Button>
            </div>
          </div>
        </section>

        {/* Trips Table */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">All Trips</h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Vehicle</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Driver</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Route</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Cargo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading trips...</td>
                    </tr>
                  ) : trips.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No trips found</td>
                    </tr>
                  ) : (
                    trips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-secondary/20 transition-colors">
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
                          <StatusPill status={statusToFrontend(trip.status) as any} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-1">
                            {trip.status === 'Draft' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Dispatch"
                                className="w-8 h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                onClick={() => handleStatusUpdate(trip.id, 'Dispatched')}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            {trip.status === 'Dispatched' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Complete"
                                className="w-8 h-8 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                onClick={() => handleStatusUpdate(trip.id, 'Completed')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Cancel"
                                className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={() => handleStatusUpdate(trip.id, 'Cancelled')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
