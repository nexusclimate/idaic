# Main Event Image Feature Setup

## Database Setup

You need to create a new table in your Supabase database to store the main event images. Run this SQL in your Supabase SQL editor:

```sql
-- Create main_event_images table
CREATE TABLE main_event_images (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_data TEXT NOT NULL, -- Base64 encoded image data
  image_type VARCHAR(100) NOT NULL, -- MIME type (e.g., 'image/jpeg')
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active images
CREATE INDEX idx_main_event_images_active ON main_event_images(is_active);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_main_event_images_updated_at 
    BEFORE UPDATE ON main_event_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Features Implemented

### 1. Main Event Image Management
- **Display**: Shows the current main event image prominently on the events page
- **Upload**: Admins can upload new images (JPG, PNG, GIF, max 5MB)
- **Replace**: Easy one-click replacement of existing images
- **Delete**: Remove images when no longer needed

### 2. Admin Controls
- **Admin Authentication**: Only authenticated admins can manage images
- **Upload Dialog**: User-friendly interface for image selection
- **Validation**: File type and size validation
- **Error Handling**: Clear error messages for failed operations

### 3. User Experience
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Smooth loading animations
- **Fallback**: Graceful handling when no image is set
- **Visual Feedback**: Clear success/error states

## Usage

### For Regular Users
- The main event image appears prominently in the middle of the events page
- No special actions required - just view and enjoy

### For Admins
1. Navigate to the Events page
2. Look for the "Main Event This Month" section
3. Click "Add Image" or "Change Image" to upload a new image
4. Select an image file (JPG, PNG, or GIF, max 5MB)
5. The image will be automatically set as the main event image
6. Use "Delete" to remove the current image

## Technical Details

### Backend (Netlify Functions)
- **File**: `netlify/functions/mainEventImage.js`
- **Endpoints**: GET, POST, PUT, DELETE
- **Database**: Supabase integration
- **Storage**: Base64 encoded images in database

### Frontend Components
- **MainEventImage.jsx**: Main component for display and management
- **Integration**: Added to Events.jsx page
- **Admin Controls**: Conditional rendering based on authentication

### Database Schema
```sql
main_event_images:
- id (SERIAL PRIMARY KEY)
- title (VARCHAR) - Image title/name
- description (TEXT) - Optional description
- image_data (TEXT) - Base64 encoded image
- image_type (VARCHAR) - MIME type
- is_active (BOOLEAN) - Only one active image at a time
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Security Considerations
- Only authenticated admins can modify images
- File type validation prevents malicious uploads
- File size limits prevent abuse
- Base64 encoding ensures data integrity

## Future Enhancements
- Image compression for better performance
- Multiple image support
- Image cropping/resizing tools
- CDN integration for faster loading
- Image alt text for accessibility
