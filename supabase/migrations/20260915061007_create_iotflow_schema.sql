/*
# IoTFlow - Complete Database Schema

## Overview
Creates the full database schema for IoTFlow, an IoT platform for ESP32 devices.

## New Tables
1. profiles - User profile info (full_name, avatar_url)
2. devices - ESP32 devices (name, device_id, device_token, type, status, last_seen)
3. dashboards - Dashboard configurations per device
4. widgets - Individual widgets on dashboards (type, config, position, size)
5. sensor_data - JSONB dynamic sensor readings from ESP32
6. commands - Commands sent from dashboard to ESP32
7. alerts - Alert rules and triggered alerts

## Security
- RLS enabled on ALL tables
- Owner-scoped policies: users can only CRUD their own data
- device_id/token validated server-side via API endpoints
- sensor_data and commands accessible via device ownership check (not direct user_id)
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'student',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  device_id text NOT NULL UNIQUE,
  device_token text NOT NULL,
  device_type text NOT NULL DEFAULT 'ESP32',
  status text NOT NULL DEFAULT 'offline',
  last_seen timestamptz,
  firmware_version text,
  ip_address text,
  uptime text,
  battery text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_devices" ON devices;
CREATE POLICY "select_own_devices" ON devices FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_devices" ON devices;
CREATE POLICY "insert_own_devices" ON devices FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_devices" ON devices;
CREATE POLICY "update_own_devices" ON devices FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_devices" ON devices;
CREATE POLICY "delete_own_devices" ON devices FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_dashboards" ON dashboards;
CREATE POLICY "select_own_dashboards" ON dashboards FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_dashboards" ON dashboards;
CREATE POLICY "insert_own_dashboards" ON dashboards FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_dashboards" ON dashboards;
CREATE POLICY "update_own_dashboards" ON dashboards FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_dashboards" ON dashboards;
CREATE POLICY "delete_own_dashboards" ON dashboards FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Widgets table
CREATE TABLE IF NOT EXISTS widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL DEFAULT 'Widget',
  data_key text,
  unit text,
  config jsonb NOT NULL DEFAULT '{}',
  position jsonb NOT NULL DEFAULT '{"x": 0, "y": 0}',
  size jsonb NOT NULL DEFAULT '{"w": 1, "h": 1}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_widgets" ON widgets;
CREATE POLICY "select_own_widgets" ON widgets FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dashboards WHERE dashboards.id = widgets.dashboard_id AND dashboards.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_widgets" ON widgets;
CREATE POLICY "insert_own_widgets" ON widgets FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dashboards WHERE dashboards.id = widgets.dashboard_id AND dashboards.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_widgets" ON widgets;
CREATE POLICY "update_own_widgets" ON widgets FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dashboards WHERE dashboards.id = widgets.dashboard_id AND dashboards.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dashboards WHERE dashboards.id = widgets.dashboard_id AND dashboards.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_widgets" ON widgets;
CREATE POLICY "delete_own_widgets" ON widgets FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dashboards WHERE dashboards.id = widgets.dashboard_id AND dashboards.user_id = auth.uid())
  );

-- Sensor data table (JSONB for dynamic fields)
CREATE TABLE IF NOT EXISTS sensor_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sensor_data_device_id ON sensor_data(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at ON sensor_data(created_at);

ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sensor_data" ON sensor_data;
CREATE POLICY "select_own_sensor_data" ON sensor_data FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM devices WHERE devices.id = sensor_data.device_id AND devices.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_sensor_data" ON sensor_data;
CREATE POLICY "insert_own_sensor_data" ON sensor_data FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM devices WHERE devices.id = sensor_data.device_id AND devices.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_sensor_data" ON sensor_data;
CREATE POLICY "delete_own_sensor_data" ON sensor_data FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM devices WHERE devices.id = sensor_data.device_id AND devices.user_id = auth.uid())
  );

-- Commands table
CREATE TABLE IF NOT EXISTS commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  command text NOT NULL,
  value jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  executed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_commands_device_id ON commands(device_id);
CREATE INDEX IF NOT EXISTS idx_commands_status ON commands(status);

ALTER TABLE commands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_commands" ON commands;
CREATE POLICY "select_own_commands" ON commands FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM devices WHERE devices.id = commands.device_id AND devices.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_commands" ON commands;
CREATE POLICY "insert_own_commands" ON commands FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM devices WHERE devices.id = commands.device_id AND devices.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_commands" ON commands;
CREATE POLICY "update_own_commands" ON commands FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM devices WHERE devices.id = commands.device_id AND devices.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM devices WHERE devices.id = commands.device_id AND devices.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_commands" ON commands;
CREATE POLICY "delete_own_commands" ON commands FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM devices WHERE devices.id = commands.device_id AND devices.user_id = auth.uid())
  );

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  value text,
  status text NOT NULL DEFAULT 'active',
  rule_config jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_alerts" ON alerts;
CREATE POLICY "select_own_alerts" ON alerts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_alerts" ON alerts;
CREATE POLICY "insert_own_alerts" ON alerts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_alerts" ON alerts;
CREATE POLICY "update_own_alerts" ON alerts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_alerts" ON alerts;
CREATE POLICY "delete_own_alerts" ON alerts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Trigger: auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
