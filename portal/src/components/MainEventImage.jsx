import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogBody, DialogActions } from './dialog';
import { Button } from './button';
import { Text } from './text';

export default function PortalAssets({ isAdmin = false }) {
  const [portalAsset, setPortalAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Fetch current portal asset
  const fetchPortalAsset = async () => {
    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/portalAssets');
      if (!response.ok) throw new Error('Failed to fetch portal asset');
      const data = await response.json();
      setPortalAsset(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalAsset();
  }, []);

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        
        // Extract base64 string (remove data:image/...;base64, prefix)
        const base64String = base64Data.split(',')[1];
        
        const imageData = {
          title: file.name,
          image_data: base64String,
          image_type: file.type,
          description: `Main event image uploaded on ${new Date().toLocaleDateString()}`
        };

        const response = await fetch('/.netlify/functions/portalAssets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imageData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        await fetchPortalAsset();
        setShowUploadDialog(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async () => {
    if (!portalAsset || !window.confirm('Are you sure you want to delete this portal asset?')) {
      return;
    }

    try {
      const response = await fetch(`/.netlify/functions/portalAssets?id=${portalAsset.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete asset');
      }

      await fetchPortalAsset();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="text-red-500 text-center">
          <Text>Error loading portal asset: {error}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Portal Assets</h2>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              color="blue"
              outline
              onClick={() => setShowUploadDialog(true)}
            >
              {portalAsset ? 'Change Asset' : 'Add Asset'}
            </Button>
            {portalAsset && (
              <Button
                color="red"
                outline
                onClick={handleDeleteImage}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {portalAsset ? (
        <div className="relative">
          <img
            src={`data:${portalAsset.image_type};base64,${portalAsset.image_data}`}
            alt={portalAsset.title}
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
          <div className="mt-3">
            <Text className="text-sm text-gray-600">
              {portalAsset.description}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              Uploaded: {new Date(portalAsset.created_at).toLocaleDateString()}
            </Text>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <Text className="text-gray-500 mb-2">No portal asset set</Text>
          {isAdmin && (
            <Text className="text-sm text-gray-400">
              Click "Add Asset" to upload a portal asset
            </Text>
          )}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} size="md">
        <DialogTitle>Upload Portal Asset</DialogTitle>
        
        <DialogBody>
          <div className="space-y-4">
            <Text>
              Upload an image to feature as a portal asset. 
              The image will be displayed prominently on the events page.
            </Text>
            
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <Text className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </Text>
            </div>

            {uploadError && (
              <div className="text-red-500 text-sm">{uploadError}</div>
            )}

            {uploading && (
              <div className="text-blue-500 text-sm">Uploading image...</div>
            )}
          </div>
        </DialogBody>

        <DialogActions>
          <Button 
            color="gray" 
            outline 
            onClick={() => setShowUploadDialog(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
