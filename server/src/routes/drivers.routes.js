/**
 * Driver Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { createDriver, getDrivers } = require('../controllers/drivers.controller');

// POST /drivers — Create a new driver (Manager, SafetyOfficer)
router.post('/', authMiddleware, allowRoles(['Manager', 'SafetyOfficer']), createDriver);

// GET /drivers — List all drivers (Manager, SafetyOfficer, Dispatcher)
router.get('/', authMiddleware, allowRoles(['Manager', 'SafetyOfficer', 'Dispatcher']), getDrivers);

module.exports = router;
