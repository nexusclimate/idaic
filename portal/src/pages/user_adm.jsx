import { useState, useEffect } from 'react';
import { colors, font } from '../config/colors';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function UserAdm() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Replace with your real endpoint or mock data
    async function fetchUsers() {
      setLoading(true);
      try {
        // Example: const response = await fetch('/api/users');
        // const data = await response.json();
        // Mock data for demonstration:
        const data = [
          { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member', status: 'Active', lastLogin: '2024-06-01T10:00:00Z' },
          { name: 'Jane Smith', title: 'Designer', email: 'jane.smith@example.com', role: 'Admin', status: 'Inactive', lastLogin: '2024-05-28T14:30:00Z' },
          { name: 'John Doe', title: 'Manager', email: 'john.doe@example.com', role: 'Member', status: 'Active', lastLogin: '2024-06-02T08:15:00Z' },
        ];
        setUsers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load users');
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  // Filter and sort
  const filtered = users
    .filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
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

  return (
    <div className="bg-white border rounded-lg p-8">
      <div className="mb-4 max-w-xs">
        <label htmlFor="search" className="block text-sm font-medium text-gray-900">Quick search</label>
        <div className="mt-2">
          <div className="flex rounded-md bg-white outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-orange-500">
            <input
              id="search"
              name="search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block min-w-0 grow px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
              placeholder="Search by name or email..."
            />
            <div className="flex py-1.5 pr-1.5">
              <kbd className="inline-flex items-center rounded-sm border border-gray-200 px-1 font-sans text-xs text-gray-400">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading users...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full border-separate border-spacing-0" style={{ fontFamily: font.primary }}>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="sticky top-0 z-10 border-b bg-white/75 py-2 pr-2 pl-4 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter sm:pl-4 lg:pl-6 cursor-pointer select-none">Name {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('title')} className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none">Title {sortBy === 'title' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('email')} className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none">Email {sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('role')} className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none">Role {sortBy === 'role' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('status')} className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none">Status {sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('lastLogin')} className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none">Last Login {sortBy === 'lastLogin' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, idx) => (
                    <tr key={user.email || idx} className="hover:bg-orange-50 cursor-pointer transition">
                      <td className="py-2 pr-2 pl-4 text-sm font-medium whitespace-nowrap sm:pl-4 lg:pl-6">{user.name}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap">{user.title}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap">{user.email}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap">{user.role}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap">{user.status}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 