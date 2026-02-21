/**
 * FleetFlow API Service Layer
 * 
 * Handles all communication with the backend API.
 * All data is fetched from / written to Supabase via the Express backend.
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
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })
    const data = await res.json()
    if (!res.ok || data.success === false) {
        throw new Error(data.error || `API error: ${res.status}`)
    }
    return data
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
        'Cancelled': 'cancelled',
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
// API FUNCTIONS — always call backend
// ══════════════════════════════════════════════

// ── Vehicles ──
export async function fetchVehicles(available = false): Promise<any[]> {
    const qs = available ? '?available=true' : ''
    const data = await apiFetch(`/vehicles${qs}`)
    return data.data
}

export async function createVehicle(vehicle: { name: string; plate: string; model: string; capacity: number; odometer?: number }): Promise<any> {
    const data = await apiFetch('/vehicles', { method: 'POST', body: JSON.stringify(vehicle) })
    return data.data
}

// ── Drivers ──
export async function fetchDrivers(): Promise<any[]> {
    const data = await apiFetch('/drivers')
    return data.data
}

export async function createDriver(driver: { name: string; license_expiry: string; status?: string }): Promise<any> {
    const data = await apiFetch('/drivers', { method: 'POST', body: JSON.stringify(driver) })
    return data.data
}

// ── Trips ──
export async function fetchTrips(): Promise<any[]> {
    const data = await apiFetch('/trips')
    return data.data
}

export async function createTrip(trip: { vehicle_id: number; driver_id: number; origin: string; destination: string; cargo_weight: number }): Promise<any> {
    const data = await apiFetch('/trips', { method: 'POST', body: JSON.stringify(trip) })
    return data.data
}

export async function updateTripStatus(tripId: number, status: string, cancel_reason?: string): Promise<any> {
    const body: any = { status }
    if (cancel_reason) body.cancel_reason = cancel_reason
    const data = await apiFetch(`/trips/${tripId}/status`, { method: 'PUT', body: JSON.stringify(body) })
    return data.data
}

// ── Maintenance ──
export async function fetchMaintenance(): Promise<any[]> {
    const data = await apiFetch('/maintenance')
    return data.data
}

export async function addMaintenance(log: { vehicle_id: number; note: string; cost: number; date: string }): Promise<any> {
    const data = await apiFetch('/maintenance', { method: 'POST', body: JSON.stringify(log) })
    return data.data
}

// ── Fuel ──
export async function fetchFuelLogs(): Promise<any[]> {
    const data = await apiFetch('/fuel')
    return data.data
}

export async function addFuelLog(log: { vehicle_id: number; liters: number; cost: number; date: string }): Promise<any> {
    const data = await apiFetch('/fuel', { method: 'POST', body: JSON.stringify(log) })
    return data.data
}

// ── Dashboard KPIs ──
export async function fetchKPIs(): Promise<any> {
    const data = await apiFetch('/dashboard/kpis')
    return data.data
}
