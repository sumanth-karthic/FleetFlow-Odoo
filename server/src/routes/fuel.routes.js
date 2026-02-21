/**
 * Fuel Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { addFuelLog, getFuelLogs } = require('../controllers/fuel.controller');

// GET /fuel — List all fuel logs (Manager, FinancialAnalyst)
router.get('/', authMiddleware, allowRoles(['Manager', 'FinancialAnalyst']), getFuelLogs);

// POST /fuel — Add a fuel consumption log (Manager, FinancialAnalyst)
router.post('/', authMiddleware, allowRoles(['Manager', 'FinancialAnalyst']), addFuelLog);

module.exports = router;
