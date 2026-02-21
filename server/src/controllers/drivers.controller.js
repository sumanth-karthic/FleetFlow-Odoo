/**
 * Drivers Controller
 * 
 * Handles CRUD operations for fleet drivers.
 */

const supabase = require('../config/supabase');

/**
 * POST /drivers
 * Body: { name, license_expiry, status }
 * Roles: Manager, SafetyOfficer
 */
const createDriver = async (req, res) => {
    try {
        const { name, license_expiry, status } = req.body;

        if (!name || !license_expiry) {
            return res.status(400).json({
                success: false,
                error: 'name and license_expiry are required',
            });
        }

        const { data, error } = await supabase
            .from('drivers')
            .insert([{
                name,
                license_expiry,
                status: status || 'On Duty',
            }])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(201).json({ success: true, data });
    } catch (err) {
        console.error('Create driver error:', err.message);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * GET /drivers
 * Returns all drivers ordered by id.
 * Roles: Manager, SafetyOfficer, Dispatcher
 */
const getDrivers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Get drivers error:', err.message);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

module.exports = { createDriver, getDrivers };
