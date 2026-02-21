/**
 * FleetFlow API Service Layer
 * 
 * Handles all communication with the backend API.
 * Uses demo fallback data when the backend is unreachable (no Supabase configured).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// ── Helper: get auth token from localStorage ──
function getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('fleetflow_token')
}

// ── Helper: authenticated fetch ──
async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = getToken()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    }
    if (token && token !== 'demo-token') {
        headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })
    return res.json()
}

// ── Status mapping: backend uses "Available", frontend uses "available" ──
export function statusToFrontend(status: string): string {
    const map: Record<string, string> = {
        'Available': 'available',
        'On Trip': 'on-trip',
        'In Shop': 'in-shop',
        'On Duty': 'available',
        'Suspended': 'error',
        'Draft': 'pending',
        'Dispatched': 'on-trip',
        'Completed': 'completed',
        'Cancelled': 'error',
    }
    return map[status] || status.toLowerCase()
}

export function statusToBackend(status: string): string {
    const map: Record<string, string> = {
        'available': 'Available',
        'on-trip': 'On Trip',
        'in-shop': 'In Shop',
    }
    return map[status] || status
}

// ══════════════════════════════════════════════
// DEMO FALLBACK DATA
// Used when backend is unreachable (no Supabase)
// ══════════════════════════════════════════════

let demoVehicles = [
    { id: 1, name: 'Freightliner Cascadia', plate: 'FL-1001', model: 'Cascadia 126', capacity: 25000, odometer: 4200, status: 'Available', maintenance_flag: null },
    { id: 2, name: 'Volvo VNL 860', plate: 'VL-2002', model: 'VNL 860', capacity: 22000, odometer: 8700, status: 'Available', maintenance_flag: 'Service Due Soon' },
    { id: 3, name: 'Kenworth T680', plate: 'KW-3003', model: 'T680 Next Gen', capacity: 24000, odometer: 3100, status: 'Available', maintenance_flag: null },
    { id: 4, name: 'Peterbilt 579', plate: 'PB-4004', model: '579 UltraLoft', capacity: 23000, odometer: 12500, status: 'Available', maintenance_flag: 'Service Due Soon' },
    { id: 5, name: 'Mack Anthem', plate: 'MA-5005', model: 'Anthem 64T', capacity: 26000, odometer: 6800, status: 'On Trip', maintenance_flag: 'Service Due Soon' },
    { id: 6, name: 'International LT', plate: 'IL-6006', model: 'LT Series', capacity: 20000, odometer: 1500, status: 'In Shop', maintenance_flag: null },
]

let demoDrivers = [
    { id: 1, name: 'John Carter', license_expiry: '2027-06-15', status: 'On Duty' },
    { id: 2, name: 'Sarah Mitchell', license_expiry: '2026-12-01', status: 'On Duty' },
    { id: 3, name: 'Mike Rodriguez', license_expiry: '2026-03-10', status: 'On Trip' },
    { id: 4, name: 'Emily Chen', license_expiry: '2025-01-20', status: 'On Duty' },
    { id: 5, name: 'James Wilson', license_expiry: '2027-09-30', status: 'Suspended' },
]

let demoTrips = [
    { id: 1, vehicle_id: 1, driver_id: 1, origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', cargo_weight: 18000, status: 'Draft', created_at: '2026-02-20T08:00:00Z' },
    { id: 2, vehicle_id: 2, driver_id: 2, origin: 'Dallas, TX', destination: 'Houston, TX', cargo_weight: 15000, status: 'Draft', created_at: '2026-02-20T09:00:00Z' },
    { id: 3, vehicle_id: 5, driver_id: 3, origin: 'Chicago, IL', destination: 'Indianapolis, IN', cargo_weight: 20000, status: 'Dispatched', created_at: '2026-02-19T10:00:00Z' },
    { id: 4, vehicle_id: 3, driver_id: 1, origin: 'Miami, FL', destination: 'Atlanta, GA', cargo_weight: 12000, status: 'Completed', created_at: '2026-02-18T11:00:00Z' },
    { id: 5, vehicle_id: 4, driver_id: 2, origin: 'Seattle, WA', destination: 'Portland, OR', cargo_weight: 8000, status: 'Cancelled', created_at: '2026-02-17T12:00:00Z' },
]

let demoMaintenance = [
    { id: 1, vehicle_id: 6, note: 'Engine overhaul — coolant leak detected', cost: 4500, date: '2026-02-18' },
    { id: 2, vehicle_id: 2, note: 'Brake pad replacement — routine check', cost: 800, date: '2026-02-10' },
    { id: 3, vehicle_id: 4, note: 'Transmission fluid flush', cost: 350, date: '2026-01-28' },
]

let demoFuelLogs = [
    { id: 1, vehicle_id: 1, liters: 320, cost: 512, date: '2026-02-19' },
    { id: 2, vehicle_id: 2, liters: 280, cost: 448, date: '2026-02-18' },
    { id: 3, vehicle_id: 5, liters: 400, cost: 640, date: '2026-02-17' },
    { id: 4, vehicle_id: 3, liters: 250, cost: 400, date: '2026-02-15' },
    { id: 5, vehicle_id: 4, liters: 310, cost: 496, date: '2026-02-14' },
]

let demoIdCounter = 100

// Helper to find vehicle name by ID
export function getVehicleName(id: number, vehicles: any[]): string {
    const v = vehicles.find((v: any) => v.id === id)
    return v ? `${v.plate} - ${v.name}` : `Vehicle #${id}`
}

export function getDriverName(id: number, drivers: any[]): string {
    const d = drivers.find((d: any) => d.id === id)
    return d ? d.name : `Driver #${id}`
}

// ══════════════════════════════════════════════
// API FUNCTIONS with demo fallback
// ══════════════════════════════════════════════

// ── Vehicles ──
export async function fetchVehicles(available = false): Promise<any[]> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        const qs = available ? '?available=true' : ''
        const data = await apiFetch(`/vehicles${qs}`)
        if (data.success) return data.data
        throw new Error(data.error)
    } catch {
        if (available) return demoVehicles.filter(v => v.status !== 'In Shop')
        return [...demoVehicles]
    }
}

export async function createVehicle(vehicle: { name: string; plate: string; model: string; capacity: number; odometer?: number }): Promise<any> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        const data = await apiFetch('/vehicles', { method: 'POST', body: JSON.stringify(vehicle) })
        if (data.success) return data.data
        throw new Error(data.error)
    } catch {
        const newVehicle = {
            id: ++demoIdCounter,
            ...vehicle,
            odometer: vehicle.odometer || 0,
            status: 'Available',
            maintenance_flag: null,
        }
        demoVehicles.push(newVehicle)
        return newVehicle
    }
}

// ── Drivers ──
export async function fetchDrivers(): Promise<any[]> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        const data = await apiFetch('/drivers')
        if (data.success) return data.data
        throw new Error(data.error)
    } catch {
        return [...demoDrivers]
    }
}

export async function createDriver(driver: { name: string; license_expiry: string; status?: string }): Promise<any> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        const data = await apiFetch('/drivers', { method: 'POST', body: JSON.stringify(driver) })
        if (data.success) return data.data
        throw new Error(data.error)
    } catch {
        const newDriver = { id: ++demoIdCounter, ...driver, status: driver.status || 'On Duty' }
        demoDrivers.push(newDriver)
        return newDriver
    }
}

// ── Trips ──
export async function fetchTrips(): Promise<any[]> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        const data = await apiFetch('/trips')
        if (data.success) return data.data
        throw new Error(data.error)
    } catch {
        return [...demoTrips]
    }
}

export async function createTrip(trip: { vehicle_id: number; driver_id: number; origin: string; destination: string; cargo_weight: number }): Promise<any> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        const data = await apiFetch('/trips', { method: 'POST', body: JSON.stringify(trip) })
        if (data.success) return data.data
        throw new Error(data.error)
    } catch {
        // Validate business rules locally for demo mode
        const vehicle = demoVehicles.find(v => v.id === trip.vehicle_id)
        if (vehicle && trip.cargo_weight > vehicle.capacity) {
            throw new Error(`Cargo weight (${trip.cargo_weight} kg) exceeds vehicle capacity (${vehicle.capacity} kg)`)
        }
        const driver = demoDrivers.find(d => d.id === trip.driver_id)
        if (driver && new Date(driver.license_expiry) < new Date()) {
            throw new Error(`Driver license expired on ${driver.license_expiry}`)
        }
        if (vehicle && vehicle.status === 'In Shop') {
            throw new Error('Vehicle is currently In Shop and cannot be assigned')
        }
        const newTrip = { id: ++demoIdCounter, ...trip, status: 'Draft', created_at: new Date().toISOString() }
        demoTrips.push(newTrip)
        return newTrip
    }
}

export async function updateTripStatus(tripId: number, status: string): Promise<any> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        const data = await apiFetch(`/trips/${tripId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
        if (data.success) return data.data
        throw new Error(data.error)
    } catch {
        const trip = demoTrips.find(t => t.id === tripId)
        if (!trip) throw new Error('Trip not found')
        trip.status = status
        // Side-effects
        if (status === 'Dispatched') {
            const v = demoVehicles.find(v => v.id === trip.vehicle_id)
            const d = demoDrivers.find(d => d.id === trip.driver_id)
            if (v) v.status = 'On Trip'
            if (d) d.status = 'On Trip'
        }
        if (status === 'Completed') {
            const v = demoVehicles.find(v => v.id === trip.vehicle_id)
            const d = demoDrivers.find(d => d.id === trip.driver_id)
            if (v) v.status = 'Available'
            if (d) d.status = 'On Duty'
        }
        return trip
    }
}

// ── Maintenance ──
export async function fetchMaintenance(): Promise<any[]> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        // Backend doesn't have GET /maintenance, return demo
        throw new Error('no endpoint')
    } catch {
        return [...demoMaintenance]
    }
}

export async function addMaintenance(log: { vehicle_id: number; note: string; cost: number; date: string }): Promise<any> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        const data = await apiFetch('/maintenance', { method: 'POST', body: JSON.stringify(log) })
        if (data.success) return data.data
        throw new Error(data.error)
    } catch {
        const newLog = { id: ++demoIdCounter, ...log }
        demoMaintenance.push(newLog)
        // Side-effect: set vehicle to "In Shop"
        const v = demoVehicles.find(v => v.id === log.vehicle_id)
        if (v) v.status = 'In Shop'
        return newLog
    }
}

// ── Fuel ──
export async function fetchFuelLogs(): Promise<any[]> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        throw new Error('no endpoint')
    } catch {
        return [...demoFuelLogs]
    }
}

export async function addFuelLog(log: { vehicle_id: number; liters: number; cost: number; date: string }): Promise<any> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        const data = await apiFetch('/fuel', { method: 'POST', body: JSON.stringify(log) })
        if (data.success) return data.data
        throw new Error(data.error)
    } catch {
        const newLog = { id: ++demoIdCounter, ...log }
        demoFuelLogs.push(newLog)
        return newLog
    }
}

// ── Dashboard KPIs ──
export async function fetchKPIs(): Promise<any> {
    try {
        const token = getToken()
        if (token === 'demo-token') throw new Error('demo')
        const data = await apiFetch('/dashboard/kpis')
        if (data.success) return data.data
        throw new Error(data.error)
    } catch {
        const activeFleet = demoVehicles.filter(v => v.status !== 'In Shop').length
        const onTrip = demoVehicles.filter(v => v.status === 'On Trip').length
        const total = demoVehicles.length
        const maintenanceAlerts = demoVehicles.filter(v => v.odometer > 5000).length
        const utilizationRate = total > 0 ? Math.round((onTrip / total) * 100) : 0
        const pendingCargo = demoTrips
            .filter(t => t.status === 'Draft' || t.status === 'Dispatched')
            .reduce((sum, t) => sum + t.cargo_weight, 0)
        const healthScore = Math.max(0, 100 - (demoMaintenance.length * 5) - (demoTrips.filter(t => t.status === 'Cancelled').length * 3))

        return {
            active_fleet: activeFleet,
            total_vehicles: total,
            maintenance_alerts: maintenanceAlerts,
            utilization_rate: `${utilizationRate}%`,
            pending_cargo_kg: pendingCargo,
            fleet_health_score: healthScore,
        }
    }
}
