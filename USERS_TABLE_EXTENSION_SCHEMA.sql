-- Extension to existing users table for IDAIC Portal
-- This adds the new profile fields to your existing users table

-- Add new columns to the existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS category VARCHAR(255); -- What Category fits best
ALTER TABLE users ADD COLUMN IF NOT EXISTS other_category TEXT; -- Custom category when "Other" is selected
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_description TEXT; -- What does the organization you represent do?
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_decarbonisation TEXT; -- In what ways are you exploring or planning to use AI to accelerate decarbonisation
ALTER TABLE users ADD COLUMN IF NOT EXISTS challenges TEXT; -- What industrial decarbonisation challenges would you like to address through AI?
ALTER TABLE users ADD COLUMN IF NOT EXISTS contribution TEXT; -- How might you contribute to addressing those challenges?
ALTER TABLE users ADD COLUMN IF NOT EXISTS projects TEXT; -- Are you currently working on any projects
ALTER TABLE users ADD COLUMN IF NOT EXISTS share_projects VARCHAR(10); -- Would you be open to sharing them (yes/no)
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_tools TEXT; -- Are there specific AI tools or approaches you're interested in or developing?
ALTER TABLE users ADD COLUMN IF NOT EXISTS content TEXT; -- Do you have a case study, perspective article or other content
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval BOOLEAN DEFAULT false; -- I agree that IDAIC have permission to process my data
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); -- When profile was last updated

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

-- Comments for documentation
COMMENT ON COLUMN users.category IS 'Category that fits best: Represent industrial company, AI developer, research centre, investor, Other';
COMMENT ON COLUMN users.other_category IS 'Custom category when "Other" is selected';
COMMENT ON COLUMN users.organization_description IS 'Description of what the organization the user represents does';
COMMENT ON COLUMN users.ai_decarbonisation IS 'Ways the user is exploring or planning to use AI to accelerate decarbonisation';
COMMENT ON COLUMN users.challenges IS 'Industrial decarbonisation challenges the user would like to address through AI';
COMMENT ON COLUMN users.contribution IS 'How the user might contribute to addressing those challenges';
COMMENT ON COLUMN users.projects IS 'Current or recently completed projects the user would like to showcase';
COMMENT ON COLUMN users.share_projects IS 'Whether the user is open to sharing projects for visibility or collaboration (yes/no)';
COMMENT ON COLUMN users.ai_tools IS 'Specific AI tools or approaches the user is interested in or developing';
COMMENT ON COLUMN users.content IS 'Case studies, perspective articles or other content the user could provide';
COMMENT ON COLUMN users.approval IS 'User agreement that IDAIC has permission to process their data and host information on the member section';
COMMENT ON COLUMN users.profile_updated_at IS 'Timestamp when the user profile was last updated';
