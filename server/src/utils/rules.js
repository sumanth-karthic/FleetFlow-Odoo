/**
 * Business Rules & AI/Rule-Based Features
 * 
 * Centralised module for all fleet management business logic validations
 * and rule-based intelligence features.
 */

/**
 * Check if cargo weight exceeds vehicle capacity.
 * @returns {{ valid: boolean, message?: string }}
 */
const checkCargoWeight = (cargoWeight, vehicleCapacity) => {
    if (cargoWeight > vehicleCapacity) {
        return {
            valid: false,
            message: `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicleCapacity} kg)`,
        };
    }
    return { valid: true };
};

/**
 * Check if a driver's license has expired.
 * @param {string} licenseExpiry - ISO date string of license expiry
 * @returns {{ valid: boolean, message?: string }}
 */
const checkLicenseExpiry = (licenseExpiry) => {
    const expiryDate = new Date(licenseExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only

    if (expiryDate < today) {
        return {
            valid: false,
            message: `Driver license expired on ${licenseExpiry}. Cannot assign to trip.`,
        };
    }
    return { valid: true };
};

/**
 * Predictive Maintenance Flag
 * If vehicle odometer exceeds 5000 km, flag as "Service Due Soon".
 * 
 * @param {number} odometer - Current odometer reading in km
 * @returns {string|null} Flag message or null
 */
const predictiveMaintenanceFlag = (odometer) => {
    if (odometer > 5000) {
        return 'Service Due Soon';
    }
    return null;
};

/**
 * Fleet Health Score
 * Formula: score = 100 - (maintenance_count * 5) - (cancelled_trips * 3)
 * Score is clamped between 0 and 100.
 * 
 * @param {number} maintenanceCount - Total maintenance logs for the vehicle
 * @param {number} cancelledTrips - Total cancelled trips for the vehicle
 * @returns {number} Health score (0-100)
 */
const fleetHealthScore = (maintenanceCount, cancelledTrips) => {
    const score = 100 - (maintenanceCount * 5) - (cancelledTrips * 3);
    return Math.max(0, Math.min(100, score));
};

module.exports = {
    checkCargoWeight,
    checkLicenseExpiry,
    predictiveMaintenanceFlag,
    fleetHealthScore,
};
