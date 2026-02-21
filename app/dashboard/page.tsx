'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { KPICard } from '@/components/dashboard/kpi-card'
import { StatusPill } from '@/components/dashboard/status-pill'
import { Truck, AlertTriangle, Zap, Package } from 'lucide-react'
import { fetchKPIs, fetchTrips, fetchVehicles, fetchDrivers, statusToFrontend, getVehicleName, getDriverName } from '@/lib/api'
import { cn } from '@/lib/utils'
import { PageTransition, FadeSlideIn, AnimatedTableRow, AnimatedProgressBar, AnimatedCounter, SkeletonShimmer, MagneticButton } from '@/components/animations/motion'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

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

  // Mock data for charts
  const performanceData = [
    { name: 'Mon', trips: 12, fuel: 400 },
    { name: 'Tue', trips: 15, fuel: 350 },
    { name: 'Wed', trips: 22, fuel: 500 },
    { name: 'Thu', trips: 18, fuel: 420 },
    { name: 'Fri', trips: 25, fuel: 600 },
    { name: 'Sat', trips: 14, fuel: 300 },
    { name: 'Sun', trips: 10, fuel: 200 },
  ]

  const expenseData = [
    { name: 'Fuel', value: 65, color: '#4ade80' },
    { name: 'Maintenance', value: 25, color: '#facc15' },
    { name: 'Operational', value: 10, color: '#60a5fa' },
  ]

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar title="Command Center" subtitle="REAL-TIME INTELLIGENCE & ANALYTICS" />

      <PageTransition className="ml-64 pt-20 pb-12 px-8 relative">
        {/* KPI Section */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Active Fleet"
              value={loading ? '...' : `${kpis?.active_fleet || 0}`}
              subtitle={`Utilization Rate: ${kpis?.utilization_rate || '0%'}`}
              icon={<Truck className="w-8 h-8" />}
              variant="success"
              index={0}
            />
            <KPICard
              title="Alerts"
              value={loading ? '...' : `${kpis?.maintenance_alerts || 0}`}
              subtitle="Service requirements"
              icon={<AlertTriangle className="w-8 h-8" />}
              variant="warning"
              index={1}
            />
            <KPICard
              title="In Operation"
              value={loading ? '...' : `${trips.filter(t => t.status === 'Dispatched').length}`}
              subtitle="Live trip tracking"
              icon={<Zap className="w-8 h-8" />}
              variant="default"
              index={2}
            />
            <KPICard
              title="Revenue/Cargo"
              value={loading ? '...' : `${(kpis?.pending_cargo_kg || 0 / 1000).toFixed(1)}t`}
              subtitle="Pending tonnage"
              icon={<Package className="w-8 h-8" />}
              variant="default"
              index={3}
            />
          </div>
        </section>

        {/* Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Chart */}
          <FadeSlideIn delay={0.4} className="lg:col-span-2 glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Fleet Performance Trend</h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Trips
                </div>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.4 0.11 142.5)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.4 0.11 142.5)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#ffffff20"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#ffffff20"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="trips"
                    stroke="oklch(0.4 0.11 142.5)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTrips)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </FadeSlideIn>

          {/* Distribution Chart */}
          <FadeSlideIn delay={0.5} className="glass-card p-6 rounded-2xl flex flex-col items-center">
            <h3 className="text-lg font-bold text-white tracking-tight self-start mb-4">Expense Distribution</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 w-full mt-4">
              {expenseData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </FadeSlideIn>
        </section>

        {/* Fleet Health & Recent Trips */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Health Score */}
          {kpis && (
            <FadeSlideIn delay={0.6} className="glass-card p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Fleet Health Score</h3>
                <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mt-1">Real-time status</p>
              </div>
              <div className="py-6 text-center">
                <p className={cn(
                  'text-5xl font-black font-mono tracking-tighter',
                  kpis.fleet_health_score >= 70 ? 'text-green-400' : kpis.fleet_health_score >= 40 ? 'text-yellow-400' : 'text-red-400'
                )}>
                  <AnimatedCounter value={kpis.fleet_health_score} />
                </p>
                <div className="mt-4 px-2">
                  <AnimatedProgressBar
                    value={kpis.fleet_health_score}
                    className="w-full bg-white/5 rounded-full h-1.5"
                    barClassName={cn(
                      'h-1.5 rounded-full',
                      kpis.fleet_health_score >= 70 ? 'bg-green-500' : kpis.fleet_health_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    duration={1.2}
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/60 text-center italic">
                Maintenance performance is within optimal range.
              </p>
            </FadeSlideIn>
          )}

          {/* Trips Table */}
          <FadeSlideIn delay={0.7} className="lg:col-span-3 glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-lg font-bold text-white tracking-tight">Active Dispatches</h3>
              <MagneticButton className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
                View All
              </MagneticButton>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-white/[0.01]">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Vehicle</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Route</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Load</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={4} className="px-6 py-6"><SkeletonShimmer className="h-4 w-full" /></td>
                      </tr>
                    ))
                  ) : (
                    trips.slice(0, 4).map((trip, i) => (
                      <AnimatedTableRow key={trip.id} index={i} className="group">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{getVehicleName(trip.vehicle_id, vehicles)}</p>
                          <p className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">ID: {trip.id}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                          {trip.origin.split(',')[0]} → {trip.destination.split(',')[0]}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-foreground font-semibold">
                          {(trip.cargo_weight / 1000).toFixed(1)}t
                        </td>
                        <td className="px-6 py-4"><StatusPill status={statusToFrontend(trip.status) as any} /></td>
                      </AnimatedTableRow>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </FadeSlideIn>
        </section>
      </PageTransition>
    </div>
  )
}
