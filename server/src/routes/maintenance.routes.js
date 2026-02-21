/**
 * Maintenance Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { addMaintenance, getMaintenance } = require('../controllers/maintenance.controller');

// GET /maintenance — List all maintenance logs (Manager, SafetyOfficer)
router.get('/', authMiddleware, allowRoles(['Manager', 'SafetyOfficer']), getMaintenance);

// POST /maintenance — Add a maintenance log (Manager, SafetyOfficer)
router.post('/', authMiddleware, allowRoles(['Manager', 'SafetyOfficer']), addMaintenance);

module.exports = router;
