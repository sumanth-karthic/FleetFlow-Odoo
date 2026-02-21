'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { KPICard } from '@/components/dashboard/kpi-card'
import { BarChart3, TrendingUp, Zap, Shield } from 'lucide-react'
import { fetchKPIs, fetchVehicles, fetchFuelLogs, fetchMaintenance, fetchTrips } from '@/lib/api'

export default function ReportsPage() {
  const [kpis, setKpis] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [fuelLogs, setFuelLogs] = useState<any[]>([])
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([])
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [kpiData, vehicleData, fuelData, maintenanceData, tripData] = await Promise.all([
        fetchKPIs(),
        fetchVehicles(),
        fetchFuelLogs(),
        fetchMaintenance(),
        fetchTrips(),
      ])
      setKpis(kpiData)
      setVehicles(vehicleData)
      setFuelLogs(fuelData)
      setMaintenanceLogs(maintenanceData)
      setTrips(tripData)
    } catch (err) {
      console.error('Failed to load report data:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0)
  const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + Number(log.cost), 0)
  const completedTrips = trips.filter(t => t.status === 'Completed').length
  const totalTrips = trips.length
  const completionRate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0

  // Per-vehicle analysis
  const vehicleStats = vehicles.map(v => {
    const vFuel = fuelLogs.filter(f => f.vehicle_id === v.id)
    const vMaint = maintenanceLogs.filter(m => m.vehicle_id === v.id)
    const vTrips = trips.filter(t => t.vehicle_id === v.id)
    const completedVTrips = vTrips.filter(t => t.status === 'Completed').length
    const fuelCost = vFuel.reduce((s, f) => s + Number(f.cost), 0)
    const maintCost = vMaint.reduce((s, m) => s + Number(m.cost), 0)
    return {
      ...v,
      fuelCost,
      maintCost,
      totalCost: fuelCost + maintCost,
      tripCount: vTrips.length,
      completedTrips: completedVTrips,
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar title="Reports & Analytics" subtitle="Business intelligence and performance metrics" />

      <main className="ml-64 pt-20 pb-12 px-8">
        {/* KPI Cards */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Fuel Cost"
              value={loading ? '...' : `$${totalFuelCost.toLocaleString()}`}
              subtitle="All time"
              icon={<BarChart3 className="w-8 h-8" />}
              variant="default"
            />
            <KPICard
              title="Trip Completion"
              value={loading ? '...' : `${completionRate}%`}
              subtitle={`${completedTrips} of ${totalTrips} trips`}
              icon={<TrendingUp className="w-8 h-8" />}
              variant="success"
            />
            <KPICard
              title="Utilization Rate"
              value={loading ? '...' : kpis?.utilization_rate || '0%'}
              subtitle="Fleet efficiency"
              icon={<Zap className="w-8 h-8" />}
              variant="default"
            />
            <KPICard
              title="Fleet Health"
              value={loading ? '...' : `${kpis?.fleet_health_score || 0}/100`}
              subtitle="Overall score"
              icon={<Shield className="w-8 h-8" />}
              variant={kpis?.fleet_health_score >= 70 ? 'success' : 'warning'}
            />
          </div>
        </section>

        {/* Cost Breakdown */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Cost Breakdown</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-6">Expense Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fuel Costs</span>
                  <span className="text-foreground font-semibold">${totalFuelCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${totalFuelCost + totalMaintenanceCost > 0 ? (totalFuelCost / (totalFuelCost + totalMaintenanceCost)) * 100 : 0}%` }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Maintenance Costs</span>
                  <span className="text-foreground font-semibold">${totalMaintenanceCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${totalFuelCost + totalMaintenanceCost > 0 ? (totalMaintenanceCost / (totalFuelCost + totalMaintenanceCost)) * 100 : 0}%` }} />
                </div>
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="text-accent text-xl font-bold">${(totalFuelCost + totalMaintenanceCost).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-6">Trip Statistics</h3>
              <div className="space-y-4">
                {['Completed', 'Dispatched', 'Draft', 'Cancelled'].map(status => {
                  const count = trips.filter(t => t.status === status).length
                  const pct = totalTrips > 0 ? Math.round((count / totalTrips) * 100) : 0
                  const colors: Record<string, string> = {
                    Completed: 'bg-green-500',
                    Dispatched: 'bg-blue-500',
                    Draft: 'bg-orange-500',
                    Cancelled: 'bg-red-500',
                  }
                  return (
                    <div key={status}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground">{status}</span>
                        <span className="text-foreground font-medium">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className={`${colors[status]} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Per-Vehicle Report */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Vehicle Performance</h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Vehicle</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fuel Cost</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Maintenance Cost</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total Cost</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Trips</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                    </tr>
                  ) : (
                    vehicleStats.map((v) => (
                      <tr key={v.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground font-medium">{v.plate} - {v.name}</td>
                        <td className="px-6 py-4 text-sm text-foreground">${v.fuelCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-foreground">${v.maintCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-accent">${v.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{v.tripCount}</td>
                        <td className="px-6 py-4 text-sm text-green-400 font-semibold">{v.completedTrips}</td>
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
