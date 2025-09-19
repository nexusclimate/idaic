-- Portal Assets Database Schema for IDAIC Portal
-- This schema stores images and assets for the portal

-- Create portal_assets table for storing portal images and assets
CREATE TABLE portal_assets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_data TEXT NOT NULL, -- Base64 encoded image data
  image_type VARCHAR(100) NOT NULL, -- MIME type (e.g., 'image/jpeg')
  asset_type VARCHAR(50) DEFAULT 'image', -- 'image', 'document', etc.
  category VARCHAR(100) DEFAULT 'main_event', -- 'main_event', 'hero', 'banner', etc.
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255) -- User who uploaded the asset
);

-- Create indexes for better performance
CREATE INDEX idx_portal_assets_active ON portal_assets(is_active);
CREATE INDEX idx_portal_assets_category ON portal_assets(category);
CREATE INDEX idx_portal_assets_type ON portal_assets(asset_type);
CREATE INDEX idx_portal_assets_display_order ON portal_assets(display_order);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_portal_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_portal_assets_updated_at
    BEFORE UPDATE ON portal_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_portal_assets_updated_at();

-- Create view for active assets by category
CREATE VIEW active_portal_assets AS
SELECT *
FROM portal_assets
WHERE is_active = true
ORDER BY category, display_order, created_at DESC;

-- Insert some default categories
INSERT INTO portal_assets (title, description, image_data, image_type, category, display_order) VALUES
('Default Hero Image', 'Default hero image for the portal', '', 'image/jpeg', 'hero', 1),
('Default Main Event', 'Default main event placeholder', '', 'image/jpeg', 'main_event', 1)
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE portal_assets IS 'Stores images and assets for the IDAIC portal';
COMMENT ON COLUMN portal_assets.asset_type IS 'Type of asset: image, document, video, etc.';
COMMENT ON COLUMN portal_assets.category IS 'Category for organizing assets: hero, main_event, banner, etc.';
COMMENT ON COLUMN portal_assets.display_order IS 'Order for displaying multiple assets in same category';
COMMENT ON VIEW active_portal_assets IS 'View of all active portal assets ordered by category and display order';
