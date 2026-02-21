-- ============================================================
-- FleetFlow Seed Data (India Edition — INR ₹)
-- Run this SQL AFTER schema.sql to populate demo data.
--
-- NOTE: User IDs must match Supabase Auth users.
-- Create users in Supabase Auth first, then insert rows here
-- using the generated UUIDs.
-- ============================================================

-- ── Example: Insert users (replace UUIDs with actual Supabase Auth user IDs) ──
-- INSERT INTO users (id, name, email, role) VALUES
--   ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Amit Sharma',    'amit@fleetflow.in',    'Manager'),
--   ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Priya Verma',    'priya@fleetflow.in',   'Dispatcher'),
--   ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ravi Iyer',      'ravi@fleetflow.in',    'SafetyOfficer'),
--   ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Neha Gupta',     'neha@fleetflow.in',    'FinancialAnalyst');

-- ── Vehicles (Indian Trucks) ──
INSERT INTO vehicles (name, plate, model, capacity, odometer, status) VALUES
  ('Tata Prima 4928.S',      'MH-12-AB-1001', 'Prima 4928.S',        25000, 4200,  'Available'),
  ('Ashok Leyland 4825',     'KA-01-CD-2002', 'Captain 4825',        22000, 8700,  'Available'),
  ('Mahindra Blazo X 46',    'TN-09-EF-3003', 'Blazo X 46',         24000, 3100,  'Available'),
  ('BharatBenz 4228R',       'DL-01-GH-4004', '4228R Heavy Duty',   23000, 12500, 'Available'),
  ('Eicher Pro 6049',        'GJ-05-IJ-5005', 'Pro 6049',           26000, 6800,  'On Trip'),
  ('Tata Signa 4825.TK',    'AP-28-KL-6006', 'Signa 4825.TK',     20000, 1500,  'In Shop');

-- ── Drivers (Indian Names) ──
INSERT INTO drivers (name, license_expiry, status) VALUES
  ('Rajesh Kumar',     '2027-06-15', 'On Duty'),
  ('Suresh Patel',     '2026-12-01', 'On Duty'),
  ('Vikram Singh',     '2026-03-10', 'On Trip'),
  ('Arun Nair',        '2025-01-20', 'On Duty'),       -- License EXPIRED (for testing rejection)
  ('Manoj Yadav',      '2027-09-30', 'Suspended');

-- ── Trips (Indian Routes) ──
INSERT INTO trips (vehicle_id, driver_id, origin, destination, cargo_weight, status) VALUES
  (1, 1, 'Mumbai, Maharashtra',       'Pune, Maharashtra',                18000, 'Draft'),
  (2, 2, 'Bengaluru, Karnataka',      'Chennai, Tamil Nadu',              15000, 'Draft'),
  (5, 3, 'Delhi, NCR',                'Jaipur, Rajasthan',                20000, 'Dispatched'),
  (3, 1, 'Hyderabad, Telangana',      'Visakhapatnam, Andhra Pradesh',    12000, 'Completed'),
  (4, 2, 'Ahmedabad, Gujarat',        'Surat, Gujarat',                    8000, 'Cancelled');

-- ── Maintenance Logs (Costs in INR ₹) ──
INSERT INTO maintenance_logs (vehicle_id, note, cost, date) VALUES
  (6, 'Engine overhaul — coolant leak detected',       35000.00, '2026-02-18'),
  (2, 'Brake pad replacement — routine check',          8500.00, '2026-02-10'),
  (4, 'Transmission fluid flush',                       4200.00, '2026-01-28');

-- ── Fuel Logs (Costs in INR ₹, diesel ~₹90/litre) ──
INSERT INTO fuel_logs (vehicle_id, liters, cost, date) VALUES
  (1, 320, 28800.00,  '2026-02-19'),
  (2, 280, 25200.00,  '2026-02-18'),
  (5, 400, 36000.00,  '2026-02-17'),
  (3, 250, 22500.00,  '2026-02-15'),
  (4, 310, 27900.00,  '2026-02-14');
