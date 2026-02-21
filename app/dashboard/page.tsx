'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { KPICard } from '@/components/dashboard/kpi-card'
import { StatusPill } from '@/components/dashboard/status-pill'
import { Truck, AlertTriangle, Zap, Package } from 'lucide-react'
import { fetchKPIs, fetchTrips, fetchVehicles, fetchDrivers, statusToFrontend, getVehicleName, getDriverName } from '@/lib/api'

export default function DashboardPage() {
  const [kpis, setKpis] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [kpiData, tripData, vehicleData, driverData] = await Promise.all([
        fetchKPIs(),
        fetchTrips(),
        fetchVehicles(),
        fetchDrivers(),
      ])
      setKpis(kpiData)
      setTrips(tripData)
      setVehicles(vehicleData)
      setDrivers(driverData)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar title="Command Center" subtitle="Fleet Overview & Real-time Metrics" />

      {/* Main Content */}
      <main className="ml-64 pt-20 pb-12 px-8">
        {/* KPI Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Active Fleet"
              value={loading ? '...' : `${kpis?.active_fleet || 0}`}
              subtitle={`of ${kpis?.total_vehicles || 0} total vehicles`}
              icon={<Truck className="w-8 h-8" />}
              variant="success"
            />
            <KPICard
              title="Maintenance Alerts"
              value={loading ? '...' : `${kpis?.maintenance_alerts || 0}`}
              subtitle="Service due soon"
              icon={<AlertTriangle className="w-8 h-8" />}
              variant="warning"
            />
            <KPICard
              title="Utilization Rate"
              value={loading ? '...' : `${kpis?.utilization_rate || '0%'}`}
              subtitle="Fleet efficiency"
              icon={<Zap className="w-8 h-8" />}
              variant="default"
            />
            <KPICard
              title="Pending Cargo"
              value={loading ? '...' : `${(kpis?.pending_cargo_kg || 0).toLocaleString()} kg`}
              subtitle="Shipments waiting"
              icon={<Package className="w-8 h-8" />}
              variant="default"
            />
          </div>

          {/* Fleet Health Score */}
          {kpis && (
            <div className="mt-6 bg-card border border-border rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Fleet Health Score</h3>
                  <p className="text-sm text-muted-foreground">Based on maintenance history and trip cancellations</p>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-bold ${kpis.fleet_health_score >= 70 ? 'text-green-400' : kpis.fleet_health_score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {kpis.fleet_health_score}
                  </p>
                  <p className="text-sm text-muted-foreground">out of 100</p>
                </div>
              </div>
              <div className="mt-4 w-full bg-secondary rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${kpis.fleet_health_score >= 70 ? 'bg-green-500' : kpis.fleet_health_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${kpis.fleet_health_score}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Recent Trips Table */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Trips</h2>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading trips...</td>
                    </tr>
                  ) : trips.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No trips found</td>
                    </tr>
                  ) : (
                    trips.slice(0, 5).map((trip) => (
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
