-- Extension to existing users table for IDAIC Portal
-- This adds the new profile fields to your existing users table

-- Add new columns to the existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS category VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS other_category TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_description TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_decarbonisation TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS challenges TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contribution TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS projects TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS share_projects VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_tools TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_users_category ON users(category);
CREATE INDEX IF NOT EXISTS idx_users_approval ON users(approval);
CREATE INDEX IF NOT EXISTS idx_users_profile_updated ON users(profile_updated_at);

-- Create trigger to update profile_updated_at timestamp when profile fields change
CREATE OR REPLACE FUNCTION update_users_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if profile-related fields have changed
    IF (OLD.category IS DISTINCT FROM NEW.category) OR
       (OLD.other_category IS DISTINCT FROM NEW.other_category) OR
       (OLD.organization_description IS DISTINCT FROM NEW.organization_description) OR
       (OLD.ai_decarbonisation IS DISTINCT FROM NEW.ai_decarbonisation) OR
       (OLD.challenges IS DISTINCT FROM NEW.challenges) OR
       (OLD.contribution IS DISTINCT FROM NEW.contribution) OR
       (OLD.projects IS DISTINCT FROM NEW.projects) OR
       (OLD.share_projects IS DISTINCT FROM NEW.share_projects) OR
       (OLD.ai_tools IS DISTINCT FROM NEW.ai_tools) OR
       (OLD.content IS DISTINCT FROM NEW.content) OR
       (OLD.approval IS DISTINCT FROM NEW.approval) THEN
        NEW.profile_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_profile_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_profile_updated_at();
