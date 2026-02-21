/**
 * Fuel Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { addFuelLog } = require('../controllers/fuel.controller');

// POST /fuel — Add a fuel consumption log (Manager, FinancialAnalyst)
router.post('/', authMiddleware, allowRoles(['Manager', 'FinancialAnalyst']), addFuelLog);

module.exports = router;
