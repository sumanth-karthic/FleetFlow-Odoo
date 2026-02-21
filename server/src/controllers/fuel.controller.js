/**
 * Fuel Controller
 * 
 * Handles creation of fuel consumption logs.
 */

const supabase = require('../config/supabase');

/**
 * POST /fuel
 * Body: { vehicle_id, liters, cost, date }
 * Roles: Manager, FinancialAnalyst
 */
const addFuelLog = async (req, res) => {
    try {
        const { vehicle_id, liters, cost, date } = req.body;

        if (!vehicle_id || liters == null || cost == null || !date) {
            return res.status(400).json({
                success: false,
                error: 'vehicle_id, liters, cost, and date are required',
            });
        }

        // Verify vehicle exists
        const { data: vehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .select('id')
            .eq('id', vehicle_id)
            .single();

        if (vehicleError || !vehicle) {
            return res.status(404).json({ success: false, error: 'Vehicle not found' });
        }

        const { data: log, error: logError } = await supabase
            .from('fuel_logs')
            .insert([{ vehicle_id, liters, cost, date }])
            .select()
            .single();

        if (logError) {
            return res.status(400).json({ success: false, error: logError.message });
        }

        return res.status(201).json({ success: true, data: log });
    } catch (err) {
        console.error('Add fuel log error:', err.message);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

module.exports = { addFuelLog };
