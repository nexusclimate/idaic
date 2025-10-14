-- Drop existing portal_assets table if it exists
DROP TABLE IF EXISTS portal_assets;

-- Create simple portal_assets table for main event images
CREATE TABLE portal_assets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_data TEXT NOT NULL, -- Base64 encoded image data
  image_type VARCHAR(100) NOT NULL, -- MIME type (e.g., 'image/jpeg')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE portal_assets ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage all assets
CREATE POLICY "Allow service role to manage portal assets" ON portal_assets
    FOR ALL USING (auth.role() = 'service_role');
