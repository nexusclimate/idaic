-- Update the users table role constraint to allow 'new' and 'declined' roles
-- Run this SQL in your Supabase SQL editor to fix the constraint error

-- First, drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Then, add the new constraint with 'new' and 'declined' included
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('member', 'moderator', 'admin', 'new', 'declined'));

