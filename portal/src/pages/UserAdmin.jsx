import { useState, useEffect } from 'react';
import { colors, font } from '../config/colors';
import { ErrorMessage } from '../components/ErrorMessage';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function UserAdmin() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/.netlify/functions/userAdminFetch');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Format date to dd/mm/yy
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Get activity status color and label
  const getActivityStatus = (lastLogin) => {
    if (!lastLogin) {
      return { color: 'bg-red-500', label: 'Never logged in' };
    }

    const now = new Date();
    const loginDate = new Date(lastLogin);
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
    const daysDiff = hoursDiff / 24;

    if (hoursDiff <= 4) {
      return { color: 'bg-green-500', label: 'Active now' };
    } else if (hoursDiff <= 48) {
      return { color: 'bg-orange-500', label: 'Last 48 hours' };
    } else if (daysDiff <= 10) {
      return { color: 'bg-yellow-500', label: 'Last 10 days' };
    } else if (daysDiff <= 30) {
      return { color: 'bg-purple-500', label: 'Last 30 days' };
    } else {
      return { color: 'bg-red-500', label: 'Over 30 days' };
    }
  };

  // Filter and sort
  const filtered = users
    .filter(u => 
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.company?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
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

  if (loading) {
    return (
      <div className="px-3 sm:px-4 lg:px-6" style={{ fontFamily: font.primary, background: colors.background.main }}>
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="text-gray-500">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 sm:px-4 lg:px-6" style={{ fontFamily: font.primary, background: colors.background.main }}>
        <div className="flex items-center justify-center py-6 sm:py-8">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6" style={{ fontFamily: font.primary, background: colors.background.main }}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>User Administration</h1>
        <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
          Total Users: {users.length}
        </p>
      </div>

      {/* Search input */}
      <div className="mb-3 max-w-xs">
        <label htmlFor="search" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
          Quick search
        </label>
        <div className="mt-1">
          <div className="flex rounded-md bg-white outline-1 -outline-offset-1" style={{ outlineColor: colors.border.medium }}>
            <input
              id="search"
              name="search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block min-w-0 grow px-3 py-2 sm:py-1 text-base placeholder:text-gray-400 focus:outline-none sm:text-sm"
              style={{ color: colors.text.primary, fontFamily: font.primary }}
              placeholder="Search by name, email, or company..."
            />
          </div>
        </div>
      </div>

      {/* Activity Legend */}
      <div className="mb-4 p-3 bg-white rounded-lg border" style={{ borderColor: colors.border.light }}>
        <p className="text-xs font-semibold mb-2" style={{ color: colors.text.primary }}>Activity Status:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span style={{ color: colors.text.secondary }}>Active (4 hours)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span style={{ color: colors.text.secondary }}>Recent (48 hours)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span style={{ color: colors.text.secondary }}>Last 10 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span style={{ color: colors.text.secondary }}>Last 30 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span style={{ color: colors.text.secondary }}>Inactive/Never</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flow-root">
        <div className="-mx-1 -my-1 sm:-mx-2 lg:-mx-4">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0" style={{ fontFamily: font.primary }}>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b bg-white/75 py-1 pr-1 pl-1 sm:pl-2 text-left text-xs sm:text-sm font-semibold backdrop-blur-sm backdrop-filter lg:pl-3"
                      style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b bg-white/75 py-1 px-1 sm:px-2 text-left text-xs sm:text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                      style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                      onClick={() => handleSort('name')}
                    >
                      Name
                      <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>
                        {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-1 text-left text-xs sm:text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                      style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                      onClick={() => handleSort('email')}
                    >
                      Email
                      <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>
                        {sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-1 text-left text-xs sm:text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                      style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                      onClick={() => handleSort('company')}
                    >
                      Company
                      <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>
                        {sortBy === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-1 text-left text-xs sm:text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                      style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                      onClick={() => handleSort('title')}
                    >
                      Title
                      <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>
                        {sortBy === 'title' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-1 text-left text-xs sm:text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                      style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                      onClick={() => handleSort('region')}
                    >
                      Region
                      <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>
                        {sortBy === 'region' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-1 text-left text-xs sm:text-sm font-semibold backdrop-blur-sm backdrop-filter"
                      style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                    >
                      Data Permission
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-1 text-left text-xs sm:text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                      style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                      onClick={() => handleSort('last_login')}
                    >
                      Last Login
                      <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>
                        {sortBy === 'last_login' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, userIdx) => {
                    const status = getActivityStatus(user.last_login);
                    return (
                      <tr
                        key={user.id || user.email || userIdx}
                        className="hover:bg-gray-50 transition cursor-pointer"
                        style={{ fontFamily: font.primary }}
                      >
                        <td
                          className={classNames(
                            'py-1 pr-1 pl-1 sm:pl-2 text-xs sm:text-sm lg:pl-3',
                          )}
                          style={{ borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                        >
                          <div className="flex items-center gap-2">
                            <span 
                              className={`w-2.5 h-2.5 rounded-full ${status.color}`}
                              title={status.label}
                            ></span>
                          </div>
                        </td>
                        <td
                          className={classNames(
                            'px-1 sm:px-2 py-1 text-xs sm:text-sm font-medium whitespace-nowrap',
                          )}
                          style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                        >
                          {user.name || '—'}
                        </td>
                        <td
                          className={classNames(
                            'px-1 sm:px-2 py-1 text-xs sm:text-sm whitespace-nowrap',
                          )}
                          style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                        >
                          {user.email ? (
                            <a 
                              href={`mailto:${user.email}`}
                              className="text-orange-500 hover:text-orange-600 hover:underline"
                            >
                              {user.email}
                            </a>
                          ) : '—'}
                        </td>
                        <td
                          className={classNames(
                            'px-1 sm:px-2 py-1 text-xs sm:text-sm whitespace-nowrap',
                          )}
                          style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                        >
                          {user.company || '—'}
                        </td>
                        <td
                          className={classNames(
                            'px-1 sm:px-2 py-1 text-xs sm:text-sm whitespace-nowrap',
                          )}
                          style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                        >
                          {user.title || '—'}
                        </td>
                        <td
                          className={classNames(
                            'px-1 sm:px-2 py-1 text-xs sm:text-sm whitespace-nowrap',
                          )}
                          style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                        >
                          {user.region || '—'}
                        </td>
                        <td
                          className={classNames(
                            'px-1 sm:px-2 py-1 text-xs sm:text-sm whitespace-nowrap',
                          )}
                          style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                        >
                          {user.data_permission ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                        <td
                          className={classNames(
                            'px-1 sm:px-2 py-1 text-xs sm:text-sm whitespace-nowrap',
                          )}
                          style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                        >
                          {formatDate(user.last_login)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

