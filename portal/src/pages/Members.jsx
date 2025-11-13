import { useState, useEffect } from 'react';
import { colors } from '../config/colors';
import User from './User';

const tabs = [
  { name: 'Members', key: 'members' },
  { name: 'Users', key: 'users' },
];

export default function Members() {
  const [activeTab, setActiveTab] = useState('members');
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [sortedOrganizations, setSortedOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'founding', or 'alphabetical'
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch organizations with logos from database
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/.netlify/functions/orgs');
        if (!response.ok) throw new Error('Failed to fetch organizations');
        
        const data = await response.json();
        // Filter only organizations that have logos uploaded AND logo_display is enabled
        const orgsWithLogos = data.filter(org => 
          org.logo_url && 
          org.logo_display === true
        );
        setOrganizations(orgsWithLogos);
        setError('');
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Failed to load member organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Filter organizations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrganizations(organizations);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = organizations.filter(org => 
      org.name.toLowerCase().includes(query) ||
      (org.bio && org.bio.toLowerCase().includes(query)) ||
      (org.location && org.location.toLowerCase().includes(query))
    );
    setFilteredOrganizations(filtered);
  }, [organizations, searchQuery]);

  // Sort filtered organizations whenever sortBy or filteredOrganizations change
  useEffect(() => {
    const sorted = [...filteredOrganizations].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        // Alphabetical sorting (case-insensitive)
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      } else if (sortBy === 'latest') {
        // Latest members (most recently uploaded logo first)
        // Sort by updated_at DESC - when logo is uploaded, updated_at is set
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      } else if (sortBy === 'founding') {
        // Founding members (earliest uploaded logo first)
        // Sort by updated_at ASC - earliest uploaded logos appear first
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : Infinity;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : Infinity;
        return dateA - dateB; // Ascending order (oldest first)
      }
      return 0;
    });
    setSortedOrganizations(sorted);
  }, [filteredOrganizations, sortBy]);

  const openDrawer = orgId => {
    setSelectedOrgId(orgId);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrgId(null);
  };

  // Update drawer content live when clicking a different member
  const handleMemberClick = orgId => {
    if (!drawerOpen) {
      setDrawerOpen(true);
    }
    setSelectedOrgId(orgId);
  };

  // Get the selected organization for drawer display
  const selectedOrg = organizations.find(org => org.id === selectedOrgId);

  // Download logo function
  const downloadLogo = async (org, e) => {
    e.stopPropagation(); // Prevent opening the drawer when clicking download
    
    try {
      // Fetch the image
      const response = await fetch(org.logo_url);
      if (!response.ok) throw new Error('Failed to fetch logo');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get file extension from URL or default to png
      const urlExtension = org.logo_url.split('.').pop().split('?')[0].toLowerCase();
      const validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'];
      const extension = validExtensions.includes(urlExtension) ? urlExtension : 'png';
      
      // Create filename from organization name
      const sanitizedName = org.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${sanitizedName}_logo.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading logo:', err);
      alert('Failed to download logo. Please try again.');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Section Heading with Tabs */}
      <div className="mb-6 sm:mb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Members</h1>
          <nav className="mt-4 sm:mt-0">
            <ul className="flex space-x-4" role="tablist">
              {tabs.map(tab => (
                <li key={tab.key}>
                  <button
                    type="button"
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none ${
                      activeTab === tab.key
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    style={activeTab === tab.key ? { color: colors.primary.orange, borderColor: colors.primary.orange } : {}}
                    onClick={() => setActiveTab(tab.key)}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                  >
                    {tab.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      {/* Tab Content */}
      {activeTab === 'users' && (
        <User />
      )}
      {activeTab === 'members' && (
        <div className="bg-white border rounded-lg p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg sm:text-xl font-semibold">Member Directory</h3>
              <div className="flex items-center gap-3">
                <label htmlFor="sort-select" className="text-sm text-gray-700 font-medium whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="latest">Latest Members</option>
                  <option value="founding">Founding Members</option>
                  <option value="alphabetical">Alphabetically</option>
                </select>
              </div>
            </div>
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, location, or bio..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              />
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading member organizations...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-red-500">{error}</div>
            </div>
          ) : organizations.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">No member organizations with logos found.</div>
            </div>
          ) : sortedOrganizations.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">No organizations match your search.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {sortedOrganizations.map((org) => {
                const isSelected = selectedOrgId === org.id && drawerOpen;
                return (
                  <div
                    key={org.id}
                    className="relative group"
                  >
                    <button
                      onClick={() => handleMemberClick(org.id)}
                      className={`bg-gray-100 flex items-center justify-center rounded-lg transition border-2 focus:outline-none ${
                        isSelected
                          ? ''
                          : 'hover:border-orange-200'
                      }`}
                      style={{
                        borderColor: isSelected ? colors.primary.orange : 'transparent',
                        boxShadow: isSelected ? `0 0 0 2px ${colors.primary.orange}` : undefined,
                        height: '250px',
                        width: '375px',
                        padding: '25px',
                        margin: '0 auto',
                      }}
                    >
                      <img
                        className="w-auto object-contain max-w-full"
                        src={org.logo_url}
                        alt={`${org.name} Logo`}
                        style={{ imageRendering: 'auto', height: '200px' }}
                        loading="lazy"
                      />
                    </button>
                    {/* Download button */}
                    <button
                      onClick={(e) => downloadLogo(org, e)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      title={`Download ${org.name} logo`}
                      aria-label={`Download ${org.name} logo`}
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* Drawer */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${drawerOpen ? 'visible' : 'invisible pointer-events-none'}`}
        aria-labelledby="drawer-title"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/20 transition-opacity duration-500 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeDrawer}
        ></div>
        {/* Slide-over panel */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10 lg:pl-16">
              <div
                className={`pointer-events-auto w-screen max-w-sm sm:max-w-md lg:max-w-2xl transform transition ease-in-out duration-500 sm:duration-700 bg-white shadow-xl flex flex-col h-full ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => {
                  // Close drawer when clicking on non-interactive areas of the panel
                  // Don't close if clicking on buttons, links, or other interactive elements
                  if (!e.target.closest('button, a, input, textarea, select')) {
                    closeDrawer();
                  }
                }}
              >
                <div className="px-4 py-4 sm:py-6 sm:px-6 flex items-start justify-between">
                  <h2 className="text-base font-semibold text-gray-900" id="drawer-title">Member Details</h2>
                  <button
                    type="button"
                    className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus-visible:ring-2 focus-visible:ring-orange-500"
                    onClick={closeDrawer}
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Main content */}
                {selectedOrg && (
                  <div className="divide-y divide-gray-200 flex-1 overflow-y-auto">
                    <div className="pb-4 sm:pb-6">
                      <div className="-mt-8 sm:-mt-8 flow-root px-4 sm:flex sm:items-end sm:px-6 lg:-mt-16">
                        <div>
                          <div className="-m-1 flex">
                            <div className="inline-flex overflow-hidden rounded-lg border-4 border-white">
                              <img className="size-24 sm:size-32 lg:size-40 xl:size-48 object-contain" src={selectedOrg.logo_url} alt={`${selectedOrg.name} Logo`} style={{ imageRendering: 'auto' }} loading="lazy" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-6 sm:ml-6 sm:flex-1">
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{selectedOrg.name}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-4 sm:py-5 sm:px-0">
                      <dl className="space-y-6 sm:space-y-8 sm:divide-y sm:divide-gray-200">
                        {selectedOrg.bio && (
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-32 lg:w-48 sm:shrink-0">Bio</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">
                              <p>{selectedOrg.bio}</p>
                            </dd>
                          </div>
                        )}
                        {selectedOrg.location && (
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-32 lg:w-48 sm:shrink-0">Location</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">{selectedOrg.location}</dd>
                          </div>
                        )}
                        {selectedOrg.website && (
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-32 lg:w-48 sm:shrink-0">Website</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">
                              <a 
                                href={selectedOrg.website.startsWith('http') ? selectedOrg.website : `https://${selectedOrg.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-500"
                              >
                                {selectedOrg.website}
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 