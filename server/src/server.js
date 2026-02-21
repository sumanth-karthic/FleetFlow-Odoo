/**
 * FleetFlow Server Entry Point
 * 
 * Starts the Express server on the configured PORT.
 */

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚛 FleetFlow API Server`);
    console.log(`   ├── Status: Running`);
    console.log(`   ├── Port:   ${PORT}`);
    console.log(`   ├── Mode:   ${process.env.NODE_ENV || 'development'}`);
    console.log(`   └── URL:    http://localhost:${PORT}\n`);
});
