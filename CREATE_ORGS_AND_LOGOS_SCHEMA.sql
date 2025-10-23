-- Create Orgs and Logos database schema
-- Orgs are linked by email domain, logos are linked to orgs

-- Step 1: Create orgs table
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id VARCHAR(255) UNIQUE NOT NULL, -- Email domain (e.g., 'company.com')
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  location VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID
);

-- Step 2: Create logos table
CREATE TABLE IF NOT EXISTS logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id VARCHAR(255) NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
  logo_url TEXT NOT NULL, -- URL to the uploaded logo asset
  logo_name VARCHAR(255) NOT NULL, -- Original filename
  logo_size INTEGER, -- File size in bytes
  logo_type VARCHAR(100), -- MIME type (e.g., 'image/png', 'image/jpeg')
  is_primary BOOLEAN DEFAULT FALSE, -- Primary logo for the organization
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID
);

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orgs_org_id ON orgs(org_id);
CREATE INDEX IF NOT EXISTS idx_orgs_name ON orgs(name);
CREATE INDEX IF NOT EXISTS idx_logos_org_id ON logos(org_id);
CREATE INDEX IF NOT EXISTS idx_logos_primary ON logos(org_id, is_primary) WHERE is_primary = TRUE;

-- Step 4: Create updated_at trigger for orgs
CREATE OR REPLACE FUNCTION update_orgs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orgs_updated_at
  BEFORE UPDATE ON orgs
  FOR EACH ROW
  EXECUTE FUNCTION update_orgs_updated_at();

-- Step 5: Create updated_at trigger for logos
CREATE OR REPLACE FUNCTION update_logos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_logos_updated_at
  BEFORE UPDATE ON logos
  FOR EACH ROW
  EXECUTE FUNCTION update_logos_updated_at();

-- Step 6: Create function to extract domain from email
CREATE OR REPLACE FUNCTION extract_domain_from_email(email_address TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(SPLIT_PART(email_address, '@', 2));
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create function to get or create org by email domain
CREATE OR REPLACE FUNCTION get_or_create_org_by_email(email_address TEXT, org_name TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  domain TEXT;
  org_uuid UUID;
BEGIN
  -- Extract domain from email
  domain := extract_domain_from_email(email_address);
  
  -- Try to find existing org
  SELECT id INTO org_uuid FROM orgs WHERE org_id = domain;
  
  -- If not found, create new org
  IF org_uuid IS NULL THEN
    INSERT INTO orgs (org_id, name, bio, location, website)
    VALUES (domain, COALESCE(org_name, domain), '', '', '')
    RETURNING id INTO org_uuid;
  END IF;
  
  RETURN org_uuid;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create view for orgs with their primary logos
CREATE OR REPLACE VIEW orgs_with_logos AS
SELECT 
  o.id,
  o.org_id,
  o.name,
  o.bio,
  o.location,
  o.website,
  o.created_at,
  o.updated_at,
  o.updated_by,
  l.logo_url as primary_logo_url,
  l.logo_name as primary_logo_name,
  l.logo_type as primary_logo_type
FROM orgs o
LEFT JOIN logos l ON o.org_id = l.org_id AND l.is_primary = TRUE;

-- Step 9: Insert some sample data (optional)
-- INSERT INTO orgs (org_id, name, bio, location, website) VALUES
-- ('idaic.org', 'IDAIC', 'International Decarbonisation AI Coalition', 'Global', 'https://idaic.org'),
-- ('example.com', 'Example Corp', 'Example organization for testing', 'New York, USA', 'https://example.com');

-- Step 10: Verify the schema
SELECT 
  'orgs' as table_name,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orgs'

UNION ALL

SELECT 
  'logos' as table_name,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'logos'
ORDER BY table_name, column_name;

-- Step 11: Show the view structure
SELECT 
  'orgs_with_logos' as view_name,
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'orgs_with_logos'
ORDER BY ordinal_position;
