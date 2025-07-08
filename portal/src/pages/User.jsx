import { useState, useEffect } from 'react';
import { colors, font } from '../config/colors';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function User() {
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
        const response = await fetch('/.netlify/functions/userfetch');
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

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8" style={{ fontFamily: font.primary, background: colors.background.main, color: colors.text.primary }}>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8" style={{ fontFamily: font.primary, background: colors.background.main, color: colors.text.primary }}>
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8" style={{ fontFamily: font.primary, background: colors.background.main, color: colors.text.primary }}>
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
              className="block min-w-0 grow px-3 py-1 text-base placeholder:text-gray-400 focus:outline-none sm:text-sm"
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
      <div className="mt-4 flow-root">
        <div className="-mx-2 -my-1 sm:-mx-4 lg:-mx-6">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full border-separate border-spacing-0" style={{ fontFamily: font.primary }}>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b bg-white/75 py-2 pr-2 pl-4 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter sm:pl-4 lg:pl-6 cursor-pointer select-none"
                    style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                    onClick={() => handleSort('name')}
                  >
                    Name
                    <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                    style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                    onClick={() => handleSort('email')}
                  >
                    Email
                    <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                    style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                    onClick={() => handleSort('company')}
                  >
                    Company
                    <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
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
                        'py-2 pr-2 pl-4 text-sm font-medium whitespace-nowrap sm:pl-4 lg:pl-6',
                      )}
                      style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                    >
                      {user.name || '—'}
                    </td>
                    <td
                      className={classNames(
                        userIdx !== filtered.length - 1 ? '' : '',
                        'px-2 py-2 text-sm whitespace-nowrap',
                      )}
                      style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                    >
                      {user.email || '—'}
                    </td>
                    <td
                      className={classNames(
                        userIdx !== filtered.length - 1 ? '' : '',
                        'px-2 py-2 text-sm whitespace-nowrap',
                      )}
                      style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                    >
                      {user.company || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* New Table: Name, Email, Status, Last Login */}
      <div className="mt-10 flow-root">
        <div className="-mx-2 -my-1 sm:-mx-4 lg:-mx-6">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full border-separate border-spacing-0" style={{ fontFamily: font.primary }}>
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 border-b bg-white/75 py-2 pr-2 pl-4 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter sm:pl-4 lg:pl-6">Name</th>
                  <th className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter">Email</th>
                  <th className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter">Status</th>
                  <th className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, userIdx) => {
                  // Determine badge color
                  let badgeColor = 'bg-gray-200 text-gray-700 border-gray-300';
                  let lastLogin = user.last_login || user.lastLogin || user.last_activity || user.lastActivity || null;
                  let lastLoginDate = lastLogin ? new Date(lastLogin) : null;
                  let now = new Date();
                  let daysAgo = lastLoginDate ? Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24)) : null;
                  if (!lastLoginDate) {
                    badgeColor = 'bg-red-100 text-red-800 border-red-300';
                  } else if (daysAgo <= 7) {
                    badgeColor = 'bg-green-100 text-green-800 border-green-300';
                  } else if (daysAgo > 7 && daysAgo <= 15) {
                    badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-300';
                  } else if (daysAgo > 15) {
                    badgeColor = 'bg-orange-100 text-orange-800 border-orange-300';
                  }
                  return (
                    <tr key={user.email || userIdx} className="hover:transition cursor-pointer" style={{ backgroundColor: undefined, transition: 'background 0.2s', fontFamily: font.primary }}>
                      <td className="py-2 pr-2 pl-4 text-sm font-medium whitespace-nowrap sm:pl-4 lg:pl-6" style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}>{user.name || '—'}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap" style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}>{user.email || '—'}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap" style={{ borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeColor}`}>{user.role || '—'}</span>
                      </td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap" style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}>
                        {lastLoginDate ? lastLoginDate.toLocaleDateString() : '—'}
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
  );
} 