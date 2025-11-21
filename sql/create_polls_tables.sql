-- Polls Management System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. POLLS TABLE
-- ============================================
-- This table stores polls for events
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  time_slots JSONB NOT NULL, -- Array of 3 datetime strings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id) -- One poll per event
);

-- Create index on event_id for faster queries
CREATE INDEX IF NOT EXISTS idx_polls_event_id ON polls(event_id);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);

-- Add comment to table
COMMENT ON TABLE polls IS 'Stores polls for events with 3 time slot options';

-- ============================================
-- 2. POLL_VOTES TABLE
-- ============================================
-- This table stores votes for polls
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  time_slot_index INTEGER NOT NULL CHECK (time_slot_index >= 0 AND time_slot_index <= 2),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One vote per email per poll (can update their vote)
  UNIQUE(poll_id, email)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_email ON poll_votes(email);
CREATE INDEX IF NOT EXISTS idx_poll_votes_time_slot ON poll_votes(poll_id, time_slot_index);
CREATE INDEX IF NOT EXISTS idx_poll_votes_created_at ON poll_votes(created_at DESC);

-- Add comment to table
COMMENT ON TABLE poll_votes IS 'Stores votes for poll time slots';

-- ============================================
-- 3. ADD POLL_ID COLUMN TO EVENTS TABLE
-- ============================================
-- Add poll_id column to events table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'poll_id'
  ) THEN
    ALTER TABLE events ADD COLUMN poll_id UUID REFERENCES polls(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_events_poll_id ON events(poll_id);
  END IF;
END $$;

-- ============================================
-- 4. TRIGGER TO UPDATE updated_at TIMESTAMP
-- ============================================
-- Automatically update the updated_at column when a row is modified

-- Trigger for polls table
DROP TRIGGER IF EXISTS update_polls_updated_at ON polls;
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for poll_votes table
DROP TRIGGER IF EXISTS update_poll_votes_updated_at ON poll_votes;
CREATE TRIGGER update_poll_votes_updated_at
  BEFORE UPDATE ON poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on both tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls table policies
-- Allow anyone to read polls (for public poll pages)
CREATE POLICY "Polls are viewable by everyone"
  ON polls FOR SELECT
  USING (true);

-- Only authenticated users with admin/moderator role can insert/update/delete polls
CREATE POLICY "Only admins can insert polls"
  ON polls FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Only admins can update polls"
  ON polls FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Only admins can delete polls"
  ON polls FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Poll votes table policies
-- Allow anyone to insert/update votes (for public voting)
CREATE POLICY "Anyone can vote in polls"
  ON poll_votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their vote"
  ON poll_votes FOR UPDATE
  USING (true);

-- Allow anyone to read votes (for displaying vote counts)
CREATE POLICY "Votes are viewable by everyone"
  ON poll_votes FOR SELECT
  USING (true);

-- ============================================
-- NOTES:
-- ============================================
-- 1. The polls table uses JSONB to store an array of 3 datetime strings
--    Example: ["2024-01-15T10:00:00Z", "2024-01-15T14:00:00Z", "2024-01-15T18:00:00Z"]
--
-- 2. The poll_votes table stores which time slot (0, 1, or 2) each person voted for
--
-- 3. Users can update their vote by submitting again with the same email
--
-- 4. The events table has a poll_id column that links to the poll
--
-- 5. RLS policies allow:
--    - Public read access to polls and votes (for public poll pages)
--    - Public insert/update access to poll_votes (for public voting)
--    - Admin/moderator access for managing polls
--
-- 6. If you're using the service role key in Netlify functions, RLS policies
--    won't apply to those requests (service role bypasses RLS)

