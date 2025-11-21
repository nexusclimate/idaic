-- Events Management System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. EVENTS TABLE
-- ============================================
-- This table stores event information
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  description TEXT,
  agenda TEXT,
  registration_link TEXT,
  is_idaic_event BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on event_date for faster queries
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Add comment to table
COMMENT ON TABLE events IS 'Stores event information for IDAIC events';

-- ============================================
-- 2. EVENT_REGISTRATIONS TABLE
-- ============================================
-- This table stores registrations for events
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  title TEXT, -- Job title/position
  registration_type TEXT NOT NULL CHECK (registration_type IN ('internal', 'external', 'new')),
  user_role TEXT, -- Role from users table (admin, moderator, member, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate registrations for the same event and email
  UNIQUE(event_id, email)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_created_at ON event_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_registrations_type ON event_registrations(registration_type);

-- Add comment to table
COMMENT ON TABLE event_registrations IS 'Stores registrations for events, distinguishing between internal and external members';

-- ============================================
-- 3. TRIGGER TO UPDATE updated_at TIMESTAMP
-- ============================================
-- Automatically update the updated_at column when a row is modified

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for events table
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for event_registrations table
DROP TRIGGER IF EXISTS update_event_registrations_updated_at ON event_registrations;
CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on both tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Events table policies
-- Allow anyone to read events (for public event pages)
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

-- Only authenticated users with admin/moderator role can insert/update/delete events
CREATE POLICY "Only admins can insert events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Only admins can update events"
  ON events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Only admins can delete events"
  ON events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Event registrations table policies
-- Allow anyone to insert registrations (for public registration)
CREATE POLICY "Anyone can register for events"
  ON event_registrations FOR INSERT
  WITH CHECK (true);

-- Only authenticated users with admin/moderator role can view registrations
CREATE POLICY "Admins can view all registrations"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Only admins can delete registrations
CREATE POLICY "Only admins can delete registrations"
  ON event_registrations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- NOTES:
-- ============================================
-- 1. The events table uses UUID as primary key, which allows custom UUIDs
--    to be set when creating events (as required by the application)
--
-- 2. The event_registrations table has a UNIQUE constraint on (event_id, email)
--    to prevent duplicate registrations
--
-- 3. The registration_type is automatically set by the backend function:
--    - 'internal' if the email exists in the users table
--    - 'external' if the email does not exist in the users table
--
-- 4. RLS policies allow:
--    - Public read access to events (for public event pages)
--    - Public insert access to event_registrations (for public registration)
--    - Admin/moderator access for managing events and viewing registrations
--
-- 5. If you're using the service role key in Netlify functions, RLS policies
--    won't apply to those requests (service role bypasses RLS)

