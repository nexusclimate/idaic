-- Migration script to add agenda column to events table
-- and user_role column to event_registrations table
-- Run this if you already have the events tables created

-- Add agenda column to events table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'agenda'
  ) THEN
    ALTER TABLE events ADD COLUMN agenda TEXT;
  END IF;
END $$;

-- Add user_role column to event_registrations table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'event_registrations' AND column_name = 'user_role'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN user_role TEXT;
  END IF;
END $$;

-- Update the check constraint to include 'new' as a valid registration_type
DO $$
BEGIN
  -- Drop the existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'event_registrations_registration_type_check'
  ) THEN
    ALTER TABLE event_registrations 
    DROP CONSTRAINT event_registrations_registration_type_check;
  END IF;
  
  -- Add the new constraint with 'new' included
  ALTER TABLE event_registrations 
  ADD CONSTRAINT event_registrations_registration_type_check 
  CHECK (registration_type IN ('internal', 'external', 'new'));
END $$;

-- Update existing registrations to check user roles
-- This will set user_role for existing internal registrations
UPDATE event_registrations er
SET user_role = u.role
FROM users u
WHERE er.email = u.email 
  AND er.registration_type = 'internal'
  AND er.user_role IS NULL;

-- Mark registrations as 'new' if they were internal but user no longer exists
UPDATE event_registrations er
SET registration_type = 'new', user_role = NULL
WHERE er.registration_type = 'internal'
  AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = er.email
  );

