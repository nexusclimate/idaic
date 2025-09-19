-- User Profile Database Schema for IDAIC Portal
-- This schema stores comprehensive user information for the members portal

-- Create user_profiles table for storing detailed user information
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  photo_url TEXT, -- For storing photo URLs if uploaded

  -- Organization Information
  category VARCHAR(100), -- 'Represent' or 'Other'
  other_category VARCHAR(255), -- If category is 'Other'
  organization_description TEXT,
  ai_decarbonisation TEXT,
  challenges TEXT,
  contribution TEXT,
  projects TEXT,
  share_projects BOOLEAN, -- true/false for sharing projects
  ai_tools TEXT,
  content TEXT,

  -- Approval and timestamps
  approval_given BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Additional metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_category ON user_profiles(category);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);

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

-- Create table for storing user form submission history
CREATE TABLE user_profile_submissions (
  id SERIAL PRIMARY KEY,
  user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
  submission_data JSONB, -- Store the complete form data as JSON
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'

  -- Email processing fields
  email_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_attempted_at TIMESTAMP WITH TIME ZONE,
  email_error TEXT
);

-- Create index for faster lookups
CREATE INDEX idx_user_profile_submissions_user_profile_id ON user_profile_submissions(user_profile_id);
CREATE INDEX idx_user_profile_submissions_status ON user_profile_submissions(status);
CREATE INDEX idx_user_profile_submissions_email_status ON user_profile_submissions(email_status);

-- Insert some sample categories (optional)
-- You can expand this list as needed
CREATE TABLE organization_categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO organization_categories (category_name, description) VALUES
('Represent', 'Organization representative'),
('Academic/Research', 'Academic institution or research organization'),
('Government', 'Government agency or department'),
('Non-Profit', 'Non-profit organization'),
('Consultancy', 'Consulting firm'),
('Technology', 'Technology company'),
('Energy/Utilities', 'Energy or utilities company'),
('Manufacturing', 'Manufacturing company'),
('Other', 'Other type of organization');

-- Create view for approved user profiles (for public display)
CREATE VIEW approved_user_profiles AS
SELECT
  up.*,
  oc.category_name,
  oc.description as category_description
FROM user_profiles up
LEFT JOIN organization_categories oc ON up.category = oc.category_name
WHERE up.is_active = true
  AND up.approval_given = true
  AND oc.is_active = true;

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores comprehensive user profile information including organization details and AI interests';
COMMENT ON TABLE user_profile_submissions IS 'Tracks user form submissions for review and approval workflow';
COMMENT ON TABLE organization_categories IS 'Lookup table for organization categories';
COMMENT ON VIEW approved_user_profiles IS 'View of approved user profiles for public display';

-- Function to notify about new submissions (for webhooks/triggers)
CREATE OR REPLACE FUNCTION notify_new_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the new submission for monitoring
  RAISE LOG 'New user profile submission: ID %, Profile ID %, Email: %',
    NEW.id, NEW.user_profile_id, (SELECT email FROM user_profiles WHERE id = NEW.user_profile_id);

  -- You can add webhook calls here if needed
  -- PERFORM pg_notify('new_submission', row_to_json(NEW)::text);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call notification function on new submissions
CREATE TRIGGER notify_new_submission_trigger
  AFTER INSERT ON user_profile_submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_submission();

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON user_profiles TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON user_profile_submissions TO your_app_user;
-- GRANT SELECT ON organization_categories TO your_app_user;
-- GRANT SELECT ON approved_user_profiles TO your_app_user;
