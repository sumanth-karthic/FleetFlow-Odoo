/**
 * FleetFlow Express Application
 * 
 * Central app configuration: middleware, CORS, routes.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// ── Global Middleware ──
app.use(cors());                    // Allow cross-origin requests from Next.js frontend
app.use(express.json());             // Parse JSON request bodies
app.use(morgan('dev'));              // HTTP request logging

// ── Health Check ──
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚛 FleetFlow API is running',
        version: '1.0.0',
    });
});

// ── Route Mounting ──
app.use('/auth', require('./routes/auth.routes'));
app.use('/vehicles', require('./routes/vehicles.routes'));
app.use('/drivers', require('./routes/drivers.routes'));
app.use('/trips', require('./routes/trips.routes'));
app.use('/maintenance', require('./routes/maintenance.routes'));
app.use('/fuel', require('./routes/fuel.routes'));
app.use('/dashboard', require('./routes/dashboard.routes'));

// ── 404 Handler ──
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// ── Global Error Handler ──
app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});

module.exports = app;
