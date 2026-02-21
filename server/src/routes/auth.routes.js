/**
 * Auth Routes
 */
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controller');

// POST /auth/login — Authenticate user with email & password
router.post('/login', login);

module.exports = router;
