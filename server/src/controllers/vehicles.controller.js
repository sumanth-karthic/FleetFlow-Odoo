/**
 * Vehicles Controller
 * 
 * Handles CRUD operations for fleet vehicles.
 * Includes predictive maintenance flagging and available-vehicle filtering.
 */

const supabase = require('../config/supabase');
const { predictiveMaintenanceFlag } = require('../utils/rules');

/**
 * POST /vehicles
 * Body: { name, plate, model, capacity, odometer, status }
 * Roles: Manager
 */
const createVehicle = async (req, res) => {
    try {
        const { name, plate, model, capacity, odometer, status } = req.body;

        if (!name || !plate || !model || capacity == null) {
            return res.status(400).json({
                success: false,
                error: 'name, plate, model, and capacity are required',
            });
        }

        const { data, error } = await supabase
            .from('vehicles')
            .insert([{
                name,
                plate,
                model,
                capacity,
                odometer: odometer || 0,
                status: status || 'Available',
            }])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(201).json({ success: true, data });
    } catch (err) {
        console.error('Create vehicle error:', err.message);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * GET /vehicles
 * Query params:
 *   ?available=true → returns only vehicles NOT "In Shop"
 * 
 * Each vehicle includes a `maintenance_flag` field via predictive maintenance rule.
 * Roles: Manager, Dispatcher
 */
const getVehicles = async (req, res) => {
    try {
        let query = supabase.from('vehicles').select('*');

        // Filter out "In Shop" vehicles when ?available=true
        if (req.query.available === 'true') {
            query = query.neq('status', 'In Shop');
        }

        const { data, error } = await query.order('id', { ascending: true });

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        // Attach predictive maintenance flag to each vehicle
        const vehicles = data.map((vehicle) => ({
            ...vehicle,
            maintenance_flag: predictiveMaintenanceFlag(vehicle.odometer),
        }));

        return res.status(200).json({ success: true, data: vehicles });
    } catch (err) {
        console.error('Get vehicles error:', err.message);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

module.exports = { createVehicle, getVehicles };
