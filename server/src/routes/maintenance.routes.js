/**
 * Maintenance Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { addMaintenance } = require('../controllers/maintenance.controller');

// POST /maintenance — Add a maintenance log (Manager, SafetyOfficer)
router.post('/', authMiddleware, allowRoles(['Manager', 'SafetyOfficer']), addMaintenance);

module.exports = router;
