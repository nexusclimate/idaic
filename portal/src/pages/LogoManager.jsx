import { useState, useEffect } from 'react';
import { colors } from '../config/colors';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';

export default function LogoManager({ organization, onClose, user }) {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [uploadData, setUploadData] = useState({
    logo_name: '',
    logo_file: null,
    is_primary: false
  });

  useEffect(() => {
    if (organization) {
      loadLogos();
    }
  }, [organization]);

  const loadLogos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/.netlify/functions/logos?org_id=${organization.org_id}`);
      if (!response.ok) throw new Error('Failed to load logos');
      const data = await response.json();
      setLogos(data);
    } catch (err) {
      setError('Failed to load logos');
      console.error('Error loading logos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setUploadData({
        ...uploadData,
        logo_name: file.name,
        logo_file: file
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result.split(',')[1]; // Remove data:image/...;base64, prefix
        
        const response = await fetch('/.netlify/functions/uploadLogo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            org_id: organization.org_id,
            logo_name: uploadData.logo_name,
            logo_data: base64Data,
            logo_type: uploadData.logo_file.type,
            is_primary: uploadData.is_primary,
            updated_by: user?.id
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload logo');
        }

        setSuccess('Logo uploaded successfully!');
        setShowUploadForm(false);
        setUploadData({ logo_name: '', logo_file: null, is_primary: false });
        loadLogos();
        setUploading(false);
      };

      reader.readAsDataURL(uploadData.logo_file);
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  const handleSetPrimary = async (logoId) => {
    try {
      const response = await fetch(`/.netlify/functions/logos?id=${logoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_primary: true,
          updated_by: user?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set primary logo');
      }

      setSuccess('Primary logo updated!');
      loadLogos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (logoId) => {
    if (!confirm('Are you sure you want to delete this logo?')) return;

    try {
      const response = await fetch(`/.netlify/functions/logos?id=${logoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete logo');
      }

      setSuccess('Logo deleted successfully!');
      loadLogos();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="text-center py-8">
            <div className="text-gray-500">Loading logos...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Logos for {organization.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowUploadForm(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Upload New Logo
          </button>
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <div key={logo.id} className="border rounded-lg p-4">
              <div className="aspect-square mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={logo.logo_url}
                  alt={logo.logo_name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {logo.logo_name}
                </div>
                <div className="text-xs text-gray-500">
                  {logo.logo_type} • {(logo.logo_size / 1024).toFixed(1)} KB
                </div>
                {logo.is_primary && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Primary
                  </span>
                )}
                <div className="flex space-x-2">
                  {!logo.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(logo.id)}
                      className="text-xs text-orange-600 hover:text-orange-500"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(logo.id)}
                    className="text-xs text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {logos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No logos uploaded yet. Click "Upload New Logo" to add one.
          </div>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Upload Logo</h4>
                
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Logo File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={uploadData.is_primary}
                        onChange={(e) => setUploadData({ ...uploadData, is_primary: e.target.checked })}
                        className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Set as primary logo</span>
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                      disabled={uploading || !uploadData.logo_file}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Error and Success Messages */}
        {error && <ErrorMessage message={error} className="mt-4" />}
        {success && <SuccessMessage message={success} className="mt-4" />}
      </div>
    </div>
  );
}
