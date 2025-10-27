import { useState, useEffect } from 'react';
import { colors } from '../config/colors';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Organizations({ user }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showSlider, setShowSlider] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    org_id: '',
    name: '',
    bio: '',
    location: '',
    website: ''
  });

  // Load organizations on component mount
  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📝 Loading organizations...');
      
      const response = await fetch('/.netlify/functions/orgs');
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.error || 'Failed to load organizations');
      }
      
      console.log('✅ Organizations loaded:', data);
      setOrganizations(data);
    } catch (err) {
      console.error('❌ Error loading organizations:', err);
      setError(err.message || 'Failed to load organizations. Please check if the database is set up correctly.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const method = editingOrg ? 'PUT' : 'POST';
      const url = editingOrg 
        ? `/.netlify/functions/orgs?id=${editingOrg.id}`
        : '/.netlify/functions/orgs';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          updated_by: user?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save organization');
      }

      setSuccess(editingOrg ? 'Organization updated successfully!' : 'Organization created successfully!');
      setShowForm(false);
      setEditingOrg(null);
      setFormData({ org_id: '', name: '', bio: '', location: '', website: '' });
      loadOrganizations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setFormData({
      org_id: org.org_id,
      name: org.name,
      bio: org.bio || '',
      location: org.location || '',
      website: org.website || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (org) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"?`)) return;

    try {
      const response = await fetch(`/.netlify/functions/orgs?id=${org.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete organization');
      }

      setSuccess('Organization deleted successfully!');
      loadOrganizations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewDetails = (org) => {
    setSelectedOrg(org);
    setShowSlider(true);
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, GIF, etc.)');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setUploadingLogo(true);
    setError('');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        
        const response = await fetch('/.netlify/functions/uploadLogo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            org_id: formData.org_id,
            logo_name: file.name,
            logo_data: base64Data,
            logo_type: file.type,
            is_primary: true,
            updated_by: user?.id
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload logo');
        }

        setSuccess('Logo uploaded successfully!');
        setLogoFile(null);
        loadOrganizations(); // Refresh the list
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      handleLogoUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setLogoFile(file);
        handleLogoUpload(file);
      } else {
        setError('Please select an image file.');
      }
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.org_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.location && org.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading organizations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Organizations</h1>
        <p className="text-gray-600">Manage organization information and logos</p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingOrg(null);
            setFormData({ org_id: '', name: '', bio: '', location: '', website: '' });
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Add Organization
        </button>
      </div>

      {/* Organizations Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrganizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      {org.bio && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{org.bio}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {org.location || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {org.website ? (
                      <a 
                        href={org.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-500"
                      >
                        {org.website}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {org.primary_logo_url ? (
                      <img 
                        src={org.primary_logo_url} 
                        alt={`${org.name} logo`}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <span className="text-gray-400">No logo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewDetails(org)}
                      className="text-blue-600 hover:text-blue-500"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleEdit(org)}
                      className="text-orange-600 hover:text-orange-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(org)}
                      className="text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organization Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingOrg ? 'Edit Organization' : 'Add Organization'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Organization ID field removed from top section (kept small-print footer) */}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Company Name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    placeholder="Organization description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="City, Country"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://company.com"
                  />
                </div>

                {/* Logo Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Logo</label>
                  
                  {/* Current Logo Display */}
                  {editingOrg && editingOrg.primary_logo_url && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                      <img 
                        src={editingOrg.primary_logo_url} 
                        alt={`${editingOrg.name} logo`}
                        className="h-16 w-16 object-contain border border-gray-200 rounded"
                      />
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      isDragOver 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-300 hover:border-orange-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                    <label 
                      htmlFor="logo-upload" 
                      className={`cursor-pointer ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploadingLogo ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <div>
                          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium text-orange-600 hover:text-orange-500">
                              Click to upload
                            </span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  {logoFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {logoFile.name}
                    </p>
                  )}
                </div>
                
                {/* Organization ID Footnote (use UUID id), created/updated info */}
                {editingOrg && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Organization UUID:</span> {editingOrg.id}
                    </p>
                    {editingOrg.created_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Created:</span> {new Date(editingOrg.created_at).toLocaleString()}
                      </p>
                    )}
                    {editingOrg.updated_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Last Updated:</span> {new Date(editingOrg.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingOrg(null);
                      setFormData({ org_id: '', name: '', bio: '', location: '', website: '' });
                      setLogoFile(null);
                      setIsDragOver(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    {editingOrg ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Right-hand Slider for Organization Details */}
      {showSlider && selectedOrg && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setShowSlider(false)}
          ></div>
          
          {/* Slider Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Organization Details</h3>
                <button
                  onClick={() => setShowSlider(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Logo */}
                  <div className="text-center">
                    {selectedOrg.primary_logo_url ? (
                      <img 
                        src={selectedOrg.primary_logo_url} 
                        alt={`${selectedOrg.name} logo`}
                        className="mx-auto h-24 w-24 object-contain"
                      />
                    ) : (
                      <div className="mx-auto h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No logo</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Organization Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrg.name}</p>
                    </div>
                    
                    {/* Organization ID removed from top section */}
                    
                    {selectedOrg.bio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedOrg.bio}</p>
                      </div>
                    )}
                    
                    {selectedOrg.location && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedOrg.location}</p>
                      </div>
                    )}
                    
                    {selectedOrg.website && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Website</label>
                        <a 
                          href={selectedOrg.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-orange-600 hover:text-orange-500"
                        >
                          {selectedOrg.website}
                        </a>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedOrg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {selectedOrg.updated_at && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedOrg.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Organization ID Footnote (use UUID id), created/updated info */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Organization UUID:</span> {selectedOrg.id}
                    </p>
                    {selectedOrg.created_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Created:</span> {new Date(selectedOrg.created_at).toLocaleString()}
                      </p>
                    )}
                    {selectedOrg.updated_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Last Updated:</span> {new Date(selectedOrg.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Footer Actions */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowSlider(false);
                      handleEdit(selectedOrg);
                    }}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Edit Organization
                  </button>
                  <button
                    onClick={() => {
                      setShowSlider(false);
                      // TODO: Add logo management functionality
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Manage Logos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error and Success Messages */}
      {error && <ErrorMessage message={error} className="mt-4" />}
      {success && <SuccessMessage message={success} className="mt-4" />}
    </div>
  );
}
