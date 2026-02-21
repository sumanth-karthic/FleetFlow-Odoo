/**
 * Maintenance Controller
 * 
 * Handles creation of maintenance logs.
 * Business Rule: When a maintenance log is created, the associated
 * vehicle's status is automatically set to "In Shop".
 */

const supabase = require('../config/supabase');

/**
 * POST /maintenance
 * Body: { vehicle_id, note, cost, date }
 * 
 * Side-effect: Sets vehicle.status = "In Shop"
 * Roles: Manager, SafetyOfficer
 */
const addMaintenance = async (req, res) => {
    try {
        const { vehicle_id, note, cost, date } = req.body;

        if (!vehicle_id || !note || cost == null || !date) {
            return res.status(400).json({
                success: false,
                error: 'vehicle_id, note, cost, and date are required',
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

        // Insert maintenance log
        const { data: log, error: logError } = await supabase
            .from('maintenance_logs')
            .insert([{ vehicle_id, note, cost, date }])
            .select()
            .single();

        if (logError) {
            return res.status(400).json({ success: false, error: logError.message });
        }

        // ── Business Rule: Set vehicle status to "In Shop" ──
        await supabase
            .from('vehicles')
            .update({ status: 'In Shop' })
            .eq('id', vehicle_id);

        return res.status(201).json({
            success: true,
            data: log,
            message: `Maintenance log created. Vehicle #${vehicle_id} status set to "In Shop".`,
        });
    } catch (err) {
        console.error('Add maintenance error:', err.message);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

module.exports = { addMaintenance };
