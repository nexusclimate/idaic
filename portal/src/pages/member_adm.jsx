import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { useState, useEffect } from 'react';
import { colors, font } from '../config/colors';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';

// Blocked email domains
const BLOCKED_DOMAINS = ['gmail.com', 'yahoo.com', 'googlemail.com'];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MemberAdm() {
  const [activeTab, setActiveTab] = useState('profile');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/.netlify/functions/userfetch');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // Add mock login data for demonstration
        const usersWithLoginData = data.map(user => ({
          ...user,
          loginDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within last 30 days
          lastLoginDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within last 7 days
        }));
        setUsers(usersWithLoginData);
        setError(null);
      } catch (err) {
        setError('Failed to load users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Filter and sort
  const filtered = users
    .filter(u => u.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortDir === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const tabs = [
    { name: 'Profile', key: 'profile' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Section Heading with Tabs */}
      <div className="mb-6 sm:mb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Member Administration</h1>
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
      {activeTab === 'profile' && (
        <form className="w-full max-w-none">
          <div className="flex flex-col lg:flex-row gap-8 w-full">
            {/* Left: Photo, Name, Email, Title, Profile, Expertise, Member dropdown */}
            <div className="flex-1 bg-white border rounded-lg p-6">
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <UserCircleIcon aria-hidden="true" className="size-24 text-gray-300" />
                  <button
                    type="button"
                    className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                  >
                    Change Photo
                  </button>
                </div>
                <div className="w-full">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      const domain = e.target.value.split('@')[1]?.toLowerCase();
                      if (domain && BLOCKED_DOMAINS.includes(domain)) {
                        setEmailError('Personal email domains (gmail, yahoo, googlemail) are not allowed.');
                      } else {
                        setEmailError('');
                      }
                    }}
                    placeholder="jane@corporate.com"
                    className={`mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500 ${emailError ? 'border-red-500' : ''}`}
                  />
                  <ErrorMessage message={emailError} className="mt-1" />
                </div>
                <div className="w-full">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-900">Title</label>
                <input
                    id="title"
                    name="title"
                  type="text"
                    className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500"
                />
              </div>
                <div className="w-full">
                  <label htmlFor="profile" className="block text-sm font-medium text-gray-900">Profile</label>
                <input
                    id="profile"
                    name="profile"
                  type="text"
                    className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500"
                />
              </div>
                <div className="w-full">
                  <label htmlFor="expertise" className="block text-sm font-medium text-gray-900">Expertise</label>
                <input
                    id="expertise"
                    name="expertise"
                    type="text"
                    className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500"
                />
              </div>
                <div className="w-full">
                  <label htmlFor="memberType" className="block text-sm font-medium text-gray-900">Member</label>
                <select
                    id="memberType"
                    name="memberType"
                    className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500"
                  >
                    <option value="global">Global</option>
                    <option value="uk">UK</option>
                    <option value="mena">MENA</option>
                </select>
                </div>
                <div className="w-full">
                  <label htmlFor="approval" className="block text-sm font-medium text-gray-900">Approval</label>
                  <select
                    id="approval"
                    name="approval"
                    className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500"
                  >
                    <option value="">Select Approval Status</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Right: Company Info */}
            <div className="flex-1 bg-white border rounded-lg p-6 flex flex-col justify-between">
              <div className="flex flex-col gap-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Company Information</h2>
                {/* Placeholder for company-specific fields */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-900">Company Name</label>
                <input
                    id="company"
                    name="company"
                  type="text"
                    className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500"
                />
              </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-900">Position</label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500"
                  />
            </div>
                <div>
                  <label htmlFor="companyDomain" className="block text-sm font-medium text-gray-900">Company Domain</label>
                <input
                    id="companyDomain"
                    name="companyDomain"
                  type="text"
                    className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500"
                />
              </div>
            </div>
              {/* Logo upload at the bottom */}
              <div className="mt-8">
                <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-900">Company Logo</label>
                <input
                  id="companyLogo"
                  name="companyLogo"
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
            </div>
          </div>
          {/* Save button at top right */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="rounded-md bg-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-xs hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              style={{ marginRight: 0 }}
            >
              Save
            </button>
          </div>
        </form>
      )}

      {activeTab === 'users' && (
        <div style={{ fontFamily: font.primary, background: colors.background.main, color: colors.text.primary }}>
          {/* Search input */}
          <div className="mb-4 max-w-xs">
            <label htmlFor="search" className="block text-sm font-medium" style={{ color: colors.text.primary }}>Quick search</label>
              <div className="mt-2">
              <div className="flex rounded-md bg-white outline-1 -outline-offset-1" style={{ outlineColor: colors.border.medium }}>
                <input
                  id="search"
                  name="search"
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="block min-w-0 grow px-3 py-2 sm:py-1 text-base placeholder:text-gray-400 focus:outline-none sm:text-sm"
                  style={{ color: colors.text.primary, fontFamily: font.primary }}
                  placeholder="Search by name..."
                />
                <div className="flex py-1 pr-1">
                  <kbd className="inline-flex items-center rounded-sm border px-1 font-sans text-xs" style={{ borderColor: colors.border.light, color: colors.text.secondary }}>
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-gray-500">Loading users...</div>
        </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-red-600">{error}</div>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-4 flow-root">
              <div className="-mx-2 -my-1 sm:-mx-4 lg:-mx-6">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0" style={{ fontFamily: font.primary }}>
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b bg-white/75 py-2 pr-2 pl-2 sm:pl-4 text-left text-xs sm:text-base font-semibold backdrop-blur-sm backdrop-filter lg:pl-6 cursor-pointer select-none"
                            style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                            onClick={() => handleSort('name')}
                          >
                            Name
                            <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                          </th>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-2 text-left text-xs sm:text-base font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                            style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                            onClick={() => handleSort('email')}
                          >
                            Email
                            <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                          </th>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-2 text-left text-xs sm:text-base font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                            style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                            onClick={() => handleSort('company')}
                          >
                            Company
                            <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                          </th>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-2 text-left text-xs sm:text-base font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                            style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                            onClick={() => handleSort('loginDate')}
                          >
                            Login Date
                            <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'loginDate' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                          </th>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-2 text-left text-xs sm:text-base font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                            style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                            onClick={() => handleSort('lastLoginDate')}
                          >
                            Last Login
                            <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'lastLoginDate' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((user, userIdx) => (
                          <tr
                            key={user.email || userIdx}
                            className="hover:transition cursor-pointer"
                            style={{ backgroundColor: undefined, transition: 'background 0.2s', fontFamily: font.primary }}
                          >
                            <td
                              className={classNames(
                                userIdx !== filtered.length - 1 ? '' : '',
                                'py-2 pr-2 pl-2 sm:pl-4 text-xs sm:text-base whitespace-nowrap lg:pl-6',
                              )}
                              style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                            >
                              {user.name || '—'}
                            </td>
                            <td
                              className={classNames(
                                userIdx !== filtered.length - 1 ? '' : '',
                                'px-1 sm:px-2 py-2 text-xs sm:text-base whitespace-nowrap',
                              )}
                              style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                            >
                              {user.email || '—'}
                            </td>
                            <td
                              className={classNames(
                                userIdx !== filtered.length - 1 ? '' : '',
                                'px-1 sm:px-2 py-2 text-xs sm:text-base whitespace-nowrap',
                              )}
                              style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                            >
                              {user.company || '—'}
                            </td>
                            <td
                              className={classNames(
                                userIdx !== filtered.length - 1 ? '' : '',
                                'px-1 sm:px-2 py-2 text-xs sm:text-base whitespace-nowrap',
                              )}
                              style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                            >
                              {user.loginDate || '—'}
                            </td>
                            <td
                              className={classNames(
                                userIdx !== filtered.length - 1 ? '' : '',
                                'px-1 sm:px-2 py-2 text-xs sm:text-base whitespace-nowrap',
                              )}
                              style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                            >
                              {user.lastLoginDate || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
                </div>
          )}
        </div>
      )}
      </div>
  );
} 