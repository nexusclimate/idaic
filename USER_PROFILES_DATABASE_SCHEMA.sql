-- User Profiles Database Schema for IDAIC Portal
-- This schema stores user profile information from the Settings form

-- Create user_profiles table for storing user profile data
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255), -- Links to Supabase auth.users.id
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  category VARCHAR(255), -- What Category fits best
  other_category TEXT, -- Custom category when "Other" is selected
  organization_description TEXT, -- What does the organization you represent do?
  ai_decarbonisation TEXT, -- In what ways are you exploring or planning to use AI to accelerate decarbonisation
  challenges TEXT, -- What industrial decarbonisation challenges would you like to address through AI?
  contribution TEXT, -- How might you contribute to addressing those challenges?
  projects TEXT, -- Are you currently working on any projects
  share_projects VARCHAR(10), -- Would you be open to sharing them (yes/no)
  ai_tools TEXT, -- Are there specific AI tools or approaches you're interested in or developing?
  content TEXT, -- Do you have a case study, perspective article or other content
  approval BOOLEAN DEFAULT false, -- I agree that IDAIC have permission to process my data
  is_active BOOLEAN DEFAULT true,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX idx_user_profiles_category ON user_profiles(category);

-- Create unique constraint to prevent duplicate profiles per user
CREATE UNIQUE INDEX idx_user_profiles_unique_user ON user_profiles(user_id) WHERE is_active = true;
CREATE UNIQUE INDEX idx_user_profiles_unique_email ON user_profiles(email) WHERE is_active = true;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Create view for active user profiles
CREATE VIEW active_user_profiles AS
SELECT *
FROM user_profiles
WHERE is_active = true
ORDER BY updated_at DESC;

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores user profile information from the IDAIC portal settings form';
COMMENT ON COLUMN user_profiles.user_id IS 'Links to Supabase auth.users.id for authentication';
COMMENT ON COLUMN user_profiles.category IS 'Category that fits best: Represent industrial company, AI developer, research centre, investor, Other';
COMMENT ON COLUMN user_profiles.other_category IS 'Custom category when "Other" is selected';
COMMENT ON COLUMN user_profiles.organization_description IS 'Description of what the organization the user represents does';
COMMENT ON COLUMN user_profiles.ai_decarbonisation IS 'Ways the user is exploring or planning to use AI to accelerate decarbonisation';
COMMENT ON COLUMN user_profiles.challenges IS 'Industrial decarbonisation challenges the user would like to address through AI';
COMMENT ON COLUMN user_profiles.contribution IS 'How the user might contribute to addressing those challenges';
COMMENT ON COLUMN user_profiles.projects IS 'Current or recently completed projects the user would like to showcase';
COMMENT ON COLUMN user_profiles.share_projects IS 'Whether the user is open to sharing projects for visibility or collaboration (yes/no)';
COMMENT ON COLUMN user_profiles.ai_tools IS 'Specific AI tools or approaches the user is interested in or developing';
COMMENT ON COLUMN user_profiles.content IS 'Case studies, perspective articles or other content the user could provide';
COMMENT ON COLUMN user_profiles.approval IS 'User agreement that IDAIC has permission to process their data and host information on the member section';
COMMENT ON VIEW active_user_profiles IS 'View of all active user profiles ordered by most recently updated';
