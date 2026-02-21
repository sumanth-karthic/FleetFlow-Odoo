/**
 * FleetFlow Database Setup Script
 * 
 * Connects to Supabase PostgreSQL directly to create tables and seed data.
 * Uses the Supabase database connection string.
 * 
 * Usage: node setup-db.js
 * 
 * You'll need to set the DATABASE_URL in .env:
 *   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 */
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║  DATABASE_URL not set in server/.env                    ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log('║                                                         ║');
        console.log('║  To find your database URL:                             ║');
        console.log('║  1. Go to https://supabase.com/dashboard                ║');
        console.log('║  2. Select your project                                 ║');
        console.log('║  3. Go to Settings → Database                           ║');
        console.log('║  4. Copy the "Connection string" (URI format)           ║');
        console.log('║  5. Add to server/.env:                                 ║');
        console.log('║     DATABASE_URL=postgresql://postgres:...               ║');
        console.log('║                                                         ║');
        console.log('║  OR: Run schema.sql and seed.sql in SQL Editor:         ║');
        console.log('║  1. Go to SQL Editor in your Supabase dashboard         ║');
        console.log('║  2. Paste & run server/database/schema.sql              ║');
        console.log('║  3. Paste & run server/database/seed.sql                ║');
        console.log('║                                                         ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log('');
        process.exit(1);
    }

    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

    try {
        console.log('🔌 Connecting to Supabase PostgreSQL...');
        await client.connect();
        console.log('✅ Connected!\n');

        // Run schema
        console.log('── Creating tables (schema.sql) ──');
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf-8');
        await client.query(schemaSQL);
        console.log('✅ Tables created!\n');

        // Run seed
        console.log('── Inserting seed data (seed.sql) ──');
        const seedSQL = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf-8');
        await client.query(seedSQL);
        console.log('✅ Seed data inserted!\n');

        // Verify
        const { rows: vehicles } = await client.query('SELECT count(*) FROM vehicles');
        const { rows: drivers } = await client.query('SELECT count(*) FROM drivers');
        const { rows: trips } = await client.query('SELECT count(*) FROM trips');
        console.log(`📊 Verification:`);
        console.log(`   Vehicles: ${vehicles[0].count}`);
        console.log(`   Drivers:  ${drivers[0].count}`);
        console.log(`   Trips:    ${trips[0].count}`);
        console.log('\n🚛 FleetFlow database is ready!');

    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.message.includes('already exists')) {
            console.log('\n⚠️  Tables may already exist. If you want to re-create them, drop them first.');
            console.log('   Or just run the seed.sql separately.');
        }
    } finally {
        await client.end();
    }
}

main();
