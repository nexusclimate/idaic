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
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Debug logging
  console.log('PortalAssets rendered - loading:', loading, 'error:', error, 'portalAsset:', portalAsset);

  // Fetch current portal asset
  const fetchPortalAsset = async () => {
    try {
      setLoading(true);
      console.log('Fetching portal asset...');
      const response = await fetch('/.netlify/functions/portalAssets');
      console.log('Response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch portal asset');
      const data = await response.json();
      console.log('Portal asset data:', data);
      setPortalAsset(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching portal asset:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalAsset();
  }, []);

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // Handle file selection from input or drop
  const handleFileSelection = (file) => {
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

    setSelectedFile(file);
    setUploadError('');
  };

  // Handle file input change
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    handleFileSelection(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadError('');

      // Convert file to base64
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target.result;
          const base64String = base64Data.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const imageData = {
        title: selectedFile.name,
        image_data: base64String,
        image_type: selectedFile.type
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
      setSelectedFile(null);
      setUploadError('');
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
        <h2 className="text-xl font-semibold text-gray-900">Main Upcoming Event</h2>
        <div className="flex gap-2">
          <Button
            color="blue"
            outline
            onClick={() => setShowUploadDialog(true)}
          >
            {portalAsset ? 'Change Image' : 'Add Image'}
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
      </div>

      {portalAsset ? (
        <div className="relative inline-block">
          <img
            src={`data:${portalAsset.image_type};base64,${portalAsset.image_data}`}
            alt={portalAsset.title}
            className="max-w-full h-auto rounded-lg shadow-md"
            style={{ maxHeight: '500px' }}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              color="blue"
              outline
              size="sm"
              onClick={() => setShowUploadDialog(true)}
              className="bg-white/90 hover:bg-white"
              title="Edit image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            <Button
              color="red"
              outline
              size="sm"
              onClick={handleDeleteImage}
              className="bg-white/90 hover:bg-white"
              title="Delete image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <Text className="text-gray-500 mb-2">No main event image set</Text>
          <Text className="text-sm text-gray-400 mb-4">
            Click "Add Image" button above to upload a main event image
          </Text>
          <Button
            color="blue"
            onClick={() => setShowUploadDialog(true)}
            className="mt-2"
          >
            Upload Image Now
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => { setShowUploadDialog(false); setSelectedFile(null); setUploadError(''); }} size="lg">
        <DialogTitle>{portalAsset ? 'Update Main Event Image' : 'Upload Main Event Image'}</DialogTitle>

        <DialogBody>
          <div className="space-y-4">
            <Text>
              Upload an image to feature as the main upcoming event.
              The image will be displayed prominently on the events page.
            </Text>

            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver
                  ? 'border-orange-400 bg-orange-50'
                  : selectedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <Text className="font-medium text-gray-900">{selectedFile.name}</Text>
                    <Text className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </div>
                  <Button
                    color="orange"
                    onClick={() => setSelectedFile(null)}
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <Text className="text-lg font-medium text-gray-900">Drop image here or click to browse</Text>
                    <Text className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</Text>
                  </div>
                  <label htmlFor="image-upload">
                    <Button color="blue" outline as="span">
                      Choose File
                    </Button>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {uploadError && (
              <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                {uploadError}
              </div>
            )}

            {uploading && (
              <div className="text-blue-600 text-sm bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading image...
                </div>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogActions>
          <Button
            color="gray"
            outline
            onClick={() => { setShowUploadDialog(false); setSelectedFile(null); setUploadError(''); }}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            color="orange"
            onClick={handleImageUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : portalAsset ? 'Update Image' : 'Upload Image'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
