import { useState, useEffect } from 'react';
import { colors, font } from '../config/colors';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';
import { useUser } from '../hooks/useUser';

export default function UserFormView({ initialUser }) {
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: '',
    company: '',
    title: '',
    region: '',
    linkedin_url: '',
    data_permission: false,
    category: '',
    other_category: '',
    organization_description: '',
    ai_decarbonisation: '',
    challenges: '',
    contribution: '',
    projects: '',
    ai_tools: ''
  });

  const REGIONS = ['UK', 'UAE', 'EU', 'MENA', 'Global'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (initialUser) {
      loadUserData(initialUser);
    }
  }, [initialUser]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/userAdminFetch');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    }
    setLoading(false);
  };

  const loadUserData = (user) => {
    setSelectedUser(user);
    setFormData({
      role: (user.role || '').toLowerCase(),
      name: user.name || '',
      email: user.email || '',
      company: user.company || '',
      title: user.title || '',
      region: user.region || '',
      linkedin_url: user.linkedin_url || '',
      data_permission: user.data_permission || false,
      category: user.category || '',
      other_category: user.other_category || '',
      organization_description: user.organization_description || '',
      ai_decarbonisation: user.ai_decarbonisation || '',
      challenges: user.challenges || '',
      contribution: user.contribution || '',
      projects: user.projects || '',
      ai_tools: user.ai_tools || ''
    });
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Build payload, allow role change only for admins
      const payload = { ...formData, updated_by: user?.id };
      if ((user?.role || '').toLowerCase() !== 'admin') {
        delete payload.role;
      } else if (payload.role) {
        payload.role = payload.role.toLowerCase();
      }

      const response = await fetch(`/.netlify/functions/userProfile?id=${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccess('User profile updated successfully');
      // Refresh users list
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/.netlify/functions/userProfile?id=${selectedUser.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccess('User deleted successfully');
      setShowDeleteConfirm(false);
      
      // Clear selection and refresh users list
      setSelectedUser(null);
      setSearch('');
      setFormData({
        role: '',
        name: '',
        email: '',
        company: '',
        title: '',
        region: '',
        linkedin_url: '',
        data_permission: false,
        category: '',
        other_category: '',
        organization_description: '',
        ai_decarbonisation: '',
        challenges: '',
        contribution: '',
        projects: '',
        ai_tools: ''
      });
      
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.company?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: font.primary }}>
      {/* Search at top - sticky */}
      <div className="sticky top-0 bg-gray-50 z-10 pb-4 mb-2 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
              Search User
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or company..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ color: colors.text.primary }}
            />
            
            {/* User suggestions dropdown */}
            {search && filteredUsers.length > 0 && !selectedUser && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredUsers.slice(0, 10).map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      loadUserData(user);
                      setSearch('');
                    }}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium text-sm" style={{ color: colors.text.primary }}>
                      {user.name || 'Unnamed'}
                    </div>
                    <div className="text-xs" style={{ color: colors.text.secondary }}>
                      {user.email}
                    </div>
                    {user.company && (
                      <div className="text-xs mt-1" style={{ color: colors.text.secondary }}>
                        {user.company}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedUser && (
            <div className="pt-7">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setSearch('');
                  setFormData({
                    name: '',
                    email: '',
                    company: '',
                    title: '',
                    region: '',
                    linkedin_url: '',
                    data_permission: false,
                    category: '',
                    other_category: '',
                    organization_description: '',
                    ai_decarbonisation: '',
                    challenges: '',
                    contribution: '',
                    projects: '',
                    ai_tools: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User form */}
      <div className="pb-6">
        {selectedUser ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6" style={{ color: colors.text.primary }}>
              User Profile: {formData.name || formData.email}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Admin Controls: Role */}
              {(user?.role || '').toLowerCase() === 'admin' && (
                <div className="border-b pb-6">
                  <h3 className="text-base font-semibold mb-4" style={{ color: colors.text.primary }}>
                    Role
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                        User Role
                      </label>
                      <select
                        value={formData.role || 'guest'}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                      >
                        <option value="guest">Guest</option>
                        <option value="member">Member</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      <p className="text-xs mt-1" style={{ color: colors.text.secondary }}>
                        Only admins can change roles.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Basic Information */}
              <div className="border-b pb-6">
                <h3 className="text-base font-semibold mb-4" style={{ color: colors.text.primary }}>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      Title/Position
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      Region
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value="">Select Region</option>
                      {REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>
              </div>

              {/* Data Permission */}
              <div className="border-b pb-6">
                <h3 className="text-base font-semibold mb-2" style={{ color: colors.text.primary }}>
                  Data Permission
                </h3>
                <p className="text-sm mb-3" style={{ color: colors.text.secondary }}>
                  User consent to display their information on the member section
                </p>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.data_permission}
                    onChange={(e) => setFormData({ ...formData, data_permission: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm" style={{ color: colors.text.primary }}>
                    User has given permission to display their data
                  </span>
                </label>
              </div>

              {/* Additional Information */}
              <div className="border-b pb-6">
                <h3 className="text-base font-semibold mb-4" style={{ color: colors.text.primary }}>
                  Additional Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      Organization Description
                    </label>
                    <textarea
                      value={formData.organization_description}
                      onChange={(e) => setFormData({ ...formData, organization_description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      AI Decarbonisation
                    </label>
                    <textarea
                      value={formData.ai_decarbonisation}
                      onChange={(e) => setFormData({ ...formData, ai_decarbonisation: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      Challenges
                    </label>
                    <textarea
                      value={formData.challenges}
                      onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      Contribution
                    </label>
                    <textarea
                      value={formData.contribution}
                      onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      Projects
                    </label>
                    <textarea
                      value={formData.projects}
                      onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      AI Tools
                    </label>
                    <textarea
                      value={formData.ai_tools}
                      onChange={(e) => setFormData({ ...formData, ai_tools: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Messages */}
              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message={success} />}

              {/* Actions */}
              <div className="flex justify-between">
                {/* Delete button for admins */}
                {(user?.role || '').toLowerCase() === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600"
                  >
                    Delete User
                  </button>
                )}
                
                {/* Save button */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Search for a User
            </h3>
            <p className="text-gray-500">
              Use the search bar above to find and edit a user profile
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-2 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete <strong>{selectedUser?.name || selectedUser?.email}</strong>? 
                    This action cannot be undone and will permanently remove the user from the database.
                  </p>
                </div>
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting...' : 'Delete User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

