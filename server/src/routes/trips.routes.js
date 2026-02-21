/**
 * Trip Routes
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { createTrip, updateTripStatus } = require('../controllers/trips.controller');

// POST /trips — Create a new trip (Manager, Dispatcher)
router.post('/', authMiddleware, allowRoles(['Manager', 'Dispatcher']), createTrip);

// PUT /trips/:id/status — Update trip status with side-effects (Manager, Dispatcher)
router.put('/:id/status', authMiddleware, allowRoles(['Manager', 'Dispatcher']), updateTripStatus);

module.exports = router;
