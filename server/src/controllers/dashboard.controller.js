/**
 * Dashboard Controller
 * 
 * Provides Key Performance Indicators (KPIs) for the fleet dashboard.
 * 
 * KPIs:
 *   - Active Fleet: count of vehicles not "In Shop"
 *   - Maintenance Alerts: vehicles with odometer > 5000 (service due soon)
 *   - Utilization Rate: percentage of vehicles currently "On Trip"
 *   - Pending Cargo: total cargo weight of trips with status "Draft" or "Dispatched"
 *   - Fleet Health Score: overall fleet health based on maintenance and cancellations
 */

const supabase = require('../config/supabase');
const { fleetHealthScore } = require('../utils/rules');

/**
 * GET /dashboard/kpis
 * Roles: Manager, Dispatcher, FinancialAnalyst
 */
const getKPIs = async (req, res) => {
    try {
        // ── 1. Active Fleet (vehicles not "In Shop") ──
        const { data: allVehicles, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('id, status, odometer');

        if (vehiclesError) {
            return res.status(400).json({ success: false, error: vehiclesError.message });
        }

        const totalVehicles = allVehicles.length;
        const activeFleet = allVehicles.filter((v) => v.status !== 'In Shop').length;
        const onTripVehicles = allVehicles.filter((v) => v.status === 'On Trip').length;

        // ── 2. Maintenance Alerts (odometer > 5000) ──
        const maintenanceAlerts = allVehicles.filter((v) => v.odometer > 5000).length;

        // ── 3. Utilization Rate ──
        const utilizationRate = totalVehicles > 0
            ? Math.round((onTripVehicles / totalVehicles) * 100)
            : 0;

        // ── 4. Pending Cargo ──
        const { data: pendingTrips, error: tripsError } = await supabase
            .from('trips')
            .select('cargo_weight')
            .in('status', ['Draft', 'Dispatched']);

        if (tripsError) {
            return res.status(400).json({ success: false, error: tripsError.message });
        }

        const pendingCargo = pendingTrips.reduce(
            (sum, trip) => sum + (trip.cargo_weight || 0),
            0
        );

        // ── 5. Fleet Health Score ──
        const { count: maintenanceCount, error: mCountError } = await supabase
            .from('maintenance_logs')
            .select('id', { count: 'exact', head: true });

        const { count: cancelledTrips, error: cCountError } = await supabase
            .from('trips')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'Cancelled');

        if (mCountError || cCountError) {
            return res.status(400).json({ success: false, error: 'Failed to compute fleet health' });
        }

        const healthScore = fleetHealthScore(maintenanceCount || 0, cancelledTrips || 0);

        return res.status(200).json({
            success: true,
            data: {
                active_fleet: activeFleet,
                total_vehicles: totalVehicles,
                maintenance_alerts: maintenanceAlerts,
                utilization_rate: `${utilizationRate}%`,
                pending_cargo_kg: pendingCargo,
                fleet_health_score: healthScore,
            },
        });
    } catch (err) {
        console.error('Dashboard KPI error:', err.message);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

module.exports = { getKPIs };
