-- ============================================================
-- FleetFlow Database Schema
-- Run this SQL in your Supabase SQL Editor to create all tables.
-- ============================================================

-- ── Custom ENUM Types ──
CREATE TYPE vehicle_status AS ENUM ('Available', 'On Trip', 'In Shop');
CREATE TYPE driver_status AS ENUM ('On Duty', 'On Trip', 'Suspended');
CREATE TYPE trip_status AS ENUM ('Draft', 'Dispatched', 'Completed', 'Cancelled');

-- ── Users Table ──
-- Linked to Supabase Auth via id (UUID)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Manager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Vehicles Table ──
CREATE TABLE vehicles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  plate TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  capacity NUMERIC NOT NULL DEFAULT 0,    -- max cargo weight in kg
  odometer NUMERIC NOT NULL DEFAULT 0,    -- current odometer reading in km
  status vehicle_status NOT NULL DEFAULT 'Available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Drivers Table ──
CREATE TABLE drivers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  license_expiry DATE NOT NULL,
  status driver_status NOT NULL DEFAULT 'On Duty',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Trips Table ──
CREATE TABLE trips (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id BIGINT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  cargo_weight NUMERIC NOT NULL DEFAULT 0,
  status trip_status NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Maintenance Logs Table ──
CREATE TABLE maintenance_logs (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Fuel Logs Table ──
CREATE TABLE fuel_logs (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  liters NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes for Performance ──
CREATE INDEX idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_maintenance_vehicle_id ON maintenance_logs(vehicle_id);
CREATE INDEX idx_fuel_vehicle_id ON fuel_logs(vehicle_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- ── Row Level Security (enable but use service role on backend) ──
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;

-- Allow service_role to bypass RLS (default behavior with service role key)
-- Frontend should NOT access these tables directly.
