/**
 * Dashboard Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { getKPIs } = require('../controllers/dashboard.controller');

// GET /dashboard/kpis — Get fleet KPIs (Manager, Dispatcher, FinancialAnalyst)
router.get('/kpis', authMiddleware, allowRoles(['Manager', 'Dispatcher', 'FinancialAnalyst']), getKPIs);

module.exports = router;
