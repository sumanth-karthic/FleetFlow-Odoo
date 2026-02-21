-- ============================================================
-- FleetFlow Seed Data
-- Run this SQL AFTER schema.sql to populate demo data.
--
-- NOTE: User IDs must match Supabase Auth users.
-- Create users in Supabase Auth first, then insert rows here
-- using the generated UUIDs.
-- ============================================================

-- ── Example: Insert users (replace UUIDs with actual Supabase Auth user IDs) ──
-- INSERT INTO users (id, name, email, role) VALUES
--   ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Alice Manager',    'alice@fleetflow.io',  'Manager'),
--   ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bob Dispatcher',   'bob@fleetflow.io',    'Dispatcher'),
--   ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Carol Safety',     'carol@fleetflow.io',  'SafetyOfficer'),
--   ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Dave Finance',     'dave@fleetflow.io',   'FinancialAnalyst');

-- ── Vehicles ──
INSERT INTO vehicles (name, plate, model, capacity, odometer, status) VALUES
  ('Freightliner Cascadia',  'FL-1001', 'Cascadia 126',  25000, 4200,  'Available'),
  ('Volvo VNL 860',          'VL-2002', 'VNL 860',       22000, 8700,  'Available'),
  ('Kenworth T680',          'KW-3003', 'T680 Next Gen', 24000, 3100,  'Available'),
  ('Peterbilt 579',          'PB-4004', '579 UltraLoft', 23000, 12500, 'Available'),
  ('Mack Anthem',            'MA-5005', 'Anthem 64T',    26000, 6800,  'On Trip'),
  ('International LT',       'IL-6006', 'LT Series',     20000, 1500,  'In Shop');

-- ── Drivers ──
INSERT INTO drivers (name, license_expiry, status) VALUES
  ('John Carter',     '2027-06-15', 'On Duty'),
  ('Sarah Mitchell',  '2026-12-01', 'On Duty'),
  ('Mike Rodriguez',  '2026-03-10', 'On Trip'),
  ('Emily Chen',      '2025-01-20', 'On Duty'),       -- License EXPIRED (for testing rejection)
  ('James Wilson',    '2027-09-30', 'Suspended');

-- ── Trips ──
INSERT INTO trips (vehicle_id, driver_id, origin, destination, cargo_weight, status) VALUES
  (1, 1, 'Los Angeles, CA', 'Phoenix, AZ',       18000, 'Draft'),
  (2, 2, 'Dallas, TX',      'Houston, TX',       15000, 'Draft'),
  (5, 3, 'Chicago, IL',     'Indianapolis, IN',  20000, 'Dispatched'),
  (3, 1, 'Miami, FL',       'Atlanta, GA',       12000, 'Completed'),
  (4, 2, 'Seattle, WA',     'Portland, OR',       8000, 'Cancelled');

-- ── Maintenance Logs ──
INSERT INTO maintenance_logs (vehicle_id, note, cost, date) VALUES
  (6, 'Engine overhaul — coolant leak detected',       4500.00, '2026-02-18'),
  (2, 'Brake pad replacement — routine check',          800.00, '2026-02-10'),
  (4, 'Transmission fluid flush',                       350.00, '2026-01-28');

-- ── Fuel Logs ──
INSERT INTO fuel_logs (vehicle_id, liters, cost, date) VALUES
  (1, 320, 512.00,  '2026-02-19'),
  (2, 280, 448.00,  '2026-02-18'),
  (5, 400, 640.00,  '2026-02-17'),
  (3, 250, 400.00,  '2026-02-15'),
  (4, 310, 496.00,  '2026-02-14');
