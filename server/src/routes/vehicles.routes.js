/**
 * Vehicle Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { createVehicle, getVehicles } = require('../controllers/vehicles.controller');

// POST /vehicles — Create a new vehicle (Manager only)
router.post('/', authMiddleware, allowRoles(['Manager']), createVehicle);

// GET /vehicles — List all vehicles (Manager, Dispatcher)
// Query: ?available=true to exclude "In Shop" vehicles
router.get('/', authMiddleware, allowRoles(['Manager', 'Dispatcher']), getVehicles);

module.exports = router;
