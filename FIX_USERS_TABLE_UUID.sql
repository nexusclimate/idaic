-- Ensure the users table has a UUID column with a default value
-- This script will add a default UUID generator if it doesn't exist

-- First, check if we need to add the extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Alter the users table to have a default UUID for the id column
ALTER TABLE users 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- If gen_random_uuid() doesn't work, try uuid_generate_v4()
-- ALTER TABLE users 
--   ALTER COLUMN id SET DEFAULT uuid_generate_v4();

