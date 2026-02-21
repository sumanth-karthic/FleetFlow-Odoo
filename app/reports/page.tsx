'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { KPICard } from '@/components/dashboard/kpi-card'
import { BarChart3, TrendingUp, Zap, Shield } from 'lucide-react'
import { fetchKPIs, fetchVehicles, fetchFuelLogs, fetchMaintenance, fetchTrips } from '@/lib/api'
import { PageTransition, FadeSlideIn, AnimatedTableRow, AnimatedProgressBar, AnimatedCounter, SkeletonShimmer } from '@/components/animations/motion'
import { motion } from 'framer-motion'

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
  const totalExpenses = totalFuelCost + totalMaintenanceCost

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

  const fuelPct = totalExpenses > 0 ? Math.round((totalFuelCost / totalExpenses) * 100) : 0
  const maintPct = totalExpenses > 0 ? Math.round((totalMaintenanceCost / totalExpenses) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar title="Reports & Analytics" subtitle="Business intelligence and performance metrics" />

      <PageTransition className="ml-64 pt-20 pb-12 px-8">
        {/* KPI Cards */}
        <section className="mb-8">
          <FadeSlideIn delay={0.05}>
            <h2 className="text-2xl font-bold text-foreground mb-6">Performance Metrics</h2>
          </FadeSlideIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Fuel Cost"
              value={loading ? '...' : `₹${totalFuelCost.toLocaleString()}`}
              subtitle="All time"
              icon={<BarChart3 className="w-8 h-8" />}
              variant="default"
              index={0}
            />
            <KPICard
              title="Trip Completion"
              value={loading ? '...' : `${completionRate}%`}
              subtitle={`${completedTrips} of ${totalTrips} trips`}
              icon={<TrendingUp className="w-8 h-8" />}
              variant="success"
              index={1}
            />
            <KPICard
              title="Utilization Rate"
              value={loading ? '...' : kpis?.utilization_rate || '0%'}
              subtitle="Fleet efficiency"
              icon={<Zap className="w-8 h-8" />}
              variant="default"
              index={2}
            />
            <KPICard
              title="Fleet Health"
              value={loading ? '...' : `${kpis?.fleet_health_score || 0}/100`}
              subtitle="Overall score"
              icon={<Shield className="w-8 h-8" />}
              variant={kpis?.fleet_health_score >= 70 ? 'success' : 'warning'}
              index={3}
            />
          </div>
        </section>

        {/* Cost Breakdown */}
        <section className="mb-8">
          <FadeSlideIn delay={0.4}>
            <h2 className="text-2xl font-bold text-foreground mb-6">Cost Breakdown</h2>
          </FadeSlideIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeSlideIn delay={0.5}>
              <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-6">Expense Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fuel Costs</span>
                    <span className="text-foreground font-semibold">₹{totalFuelCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <AnimatedProgressBar
                    value={fuelPct}
                    className="w-full bg-secondary rounded-full h-2"
                    barClassName="bg-blue-500 h-2 rounded-full"
                    duration={0.8}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Maintenance Costs</span>
                    <span className="text-foreground font-semibold">₹{totalMaintenanceCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <AnimatedProgressBar
                    value={maintPct}
                    className="w-full bg-secondary rounded-full h-2"
                    barClassName="bg-yellow-500 h-2 rounded-full"
                    duration={0.8}
                  />
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-foreground font-semibold">Total</span>
                    <span className="text-accent text-xl font-bold">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </FadeSlideIn>

            <FadeSlideIn delay={0.6}>
              <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-6">Trip Statistics</h3>
                <div className="space-y-4">
                  {['Completed', 'Dispatched', 'Draft', 'Cancelled'].map((status, i) => {
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
                        <AnimatedProgressBar
                          value={pct}
                          className="w-full bg-secondary rounded-full h-2"
                          barClassName={`${colors[status]} h-2 rounded-full`}
                          duration={0.6 + i * 0.15}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </FadeSlideIn>
          </div>
        </section>

        {/* Per-Vehicle Report */}
        <section>
          <FadeSlideIn delay={0.7}>
            <h2 className="text-2xl font-bold text-foreground mb-6">Vehicle Performance</h2>
          </FadeSlideIn>
          <FadeSlideIn delay={0.8}>
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
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={6} className="px-6 py-4">
                            <SkeletonShimmer className="h-5 w-full" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      vehicleStats.map((v, i) => (
                        <AnimatedTableRow key={v.id} index={i} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 text-sm text-foreground font-medium">{v.plate} - {v.name}</td>
                          <td className="px-6 py-4 text-sm text-foreground">₹{v.fuelCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-sm text-foreground">₹{v.maintCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-accent">₹{v.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{v.tripCount}</td>
                          <td className="px-6 py-4 text-sm text-green-400 font-semibold">{v.completedTrips}</td>
                        </AnimatedTableRow>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeSlideIn>
        </section>
      </PageTransition>
    </div>
  )
}
