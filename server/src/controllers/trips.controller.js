/**
 * Trips Controller
 * 
 * Core business logic for trip management including:
 * - Cargo weight vs vehicle capacity validation
 * - Driver license expiry validation
 * - Status transition side-effects (vehicle & driver status updates)
 */

const supabase = require('../config/supabase');
const { checkCargoWeight, checkLicenseExpiry } = require('../utils/rules');

/**
 * POST /trips
 * Body: { vehicle_id, driver_id, origin, destination, cargo_weight }
 * 
 * Business Rules:
 *   1. cargo_weight must NOT exceed vehicle.capacity
 *   2. driver.license_expiry must NOT be before today
 * 
 * Roles: Manager, Dispatcher
 */
const createTrip = async (req, res) => {
    try {
        const { vehicle_id, driver_id, origin, destination, cargo_weight } = req.body;

        if (!vehicle_id || !driver_id || !origin || !destination || cargo_weight == null) {
            return res.status(400).json({
                success: false,
                error: 'vehicle_id, driver_id, origin, destination, and cargo_weight are required',
            });
        }

        // ── Rule 1: Check vehicle capacity ──
        const { data: vehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .select('id, capacity, status')
            .eq('id', vehicle_id)
            .single();

        if (vehicleError || !vehicle) {
            return res.status(404).json({ success: false, error: 'Vehicle not found' });
        }

        // Prevent assigning vehicles that are "In Shop"
        if (vehicle.status === 'In Shop') {
            return res.status(400).json({
                success: false,
                error: 'Vehicle is currently In Shop and cannot be assigned to a trip',
            });
        }

        const cargoCheck = checkCargoWeight(cargo_weight, vehicle.capacity);
        if (!cargoCheck.valid) {
            return res.status(400).json({ success: false, error: cargoCheck.message });
        }

        // ── Rule 2: Check driver license expiry ──
        const { data: driver, error: driverError } = await supabase
            .from('drivers')
            .select('id, license_expiry, status')
            .eq('id', driver_id)
            .single();

        if (driverError || !driver) {
            return res.status(404).json({ success: false, error: 'Driver not found' });
        }

        const licenseCheck = checkLicenseExpiry(driver.license_expiry);
        if (!licenseCheck.valid) {
            return res.status(400).json({ success: false, error: licenseCheck.message });
        }

        // ── Create the trip with "Draft" status ──
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .insert([{
                vehicle_id,
                driver_id,
                origin,
                destination,
                cargo_weight,
                status: 'Draft',
            }])
            .select()
            .single();

        if (tripError) {
            return res.status(400).json({ success: false, error: tripError.message });
        }

        return res.status(201).json({ success: true, data: trip });
    } catch (err) {
        console.error('Create trip error:', err.message);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * PUT /trips/:id/status
 * Body: { status } — one of 'Draft', 'Dispatched', 'Completed', 'Cancelled'
 * 
 * Side-effects on status change:
 *   "Dispatched" → vehicle.status = "On Trip", driver.status = "On Trip"
 *   "Completed"  → vehicle.status = "Available", driver.status = "On Duty"
 * 
 * Roles: Manager, Dispatcher
 */
const updateTripStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        // Fetch the current trip to get vehicle_id and driver_id
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('*')
            .eq('id', id)
            .single();

        if (tripError || !trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        // ── Side-effects based on new status ──
        if (status === 'Dispatched') {
            // Set vehicle and driver to "On Trip"
            await supabase
                .from('vehicles')
                .update({ status: 'On Trip' })
                .eq('id', trip.vehicle_id);

            await supabase
                .from('drivers')
                .update({ status: 'On Trip' })
                .eq('id', trip.driver_id);
        }

        if (status === 'Completed') {
            // Restore vehicle to "Available" and driver to "On Duty"
            await supabase
                .from('vehicles')
                .update({ status: 'Available' })
                .eq('id', trip.vehicle_id);

            await supabase
                .from('drivers')
                .update({ status: 'On Duty' })
                .eq('id', trip.driver_id);
        }

        // ── Update the trip status ──
        const { data: updatedTrip, error: updateError } = await supabase
            .from('trips')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return res.status(400).json({ success: false, error: updateError.message });
        }

        return res.status(200).json({
            success: true,
            data: updatedTrip,
            message: `Trip status updated to "${status}"`,
        });
    } catch (err) {
        console.error('Update trip status error:', err.message);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

module.exports = { createTrip, updateTripStatus };
