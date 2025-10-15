import { useState, useEffect } from 'react';
import { colors, font } from '../config/colors';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';
import { useNavigate } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Custom hook to fetch users once and share between components
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersRes = await fetch('/.netlify/functions/userfetch');
        if (!usersRes.ok) throw new Error('Network response was not ok');
        const usersData = await usersRes.json();

        // Fetch all user_logins
        const loginsRes = await fetch('/.netlify/functions/userlogins');
        if (!loginsRes.ok) throw new Error('Network response was not ok');
        const loginsData = await loginsRes.json();

        // Build a map of user_id -> latest login_time
        const latestLoginMap = {};
        for (const login of loginsData) {
          if (
            !latestLoginMap[login.user_id] ||
            new Date(login.login_time) > new Date(latestLoginMap[login.user_id])
          ) {
            latestLoginMap[login.user_id] = login.login_time;
          }
        }

        // Attach last_login to each user
        const usersWithLogin = usersData.map(user => ({
          ...user,
          last_login: latestLoginMap[user.id] || null,
        }));

        if (!ignore) {
          setUsers(usersWithLogin);
          setError(null);
        }
      } catch (err) {
        if (!ignore) setError('Failed to load users');
      }
      if (!ignore) setLoading(false);
    };
    fetchUsers();
    return () => { ignore = true; };
  }, []);

  return { users, loading, error };
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} - ${hh}:${min}`;
}

function getBadgeColor(lastLogin) {
  if (!lastLogin) return 'bg-red-100 text-red-800 border-red-300';
  const now = new Date();
  const loginDate = new Date(lastLogin);
  const diffDays = Math.floor((now - loginDate) / (1000 * 60 * 60 * 24));
  if (diffDays < 2) return 'bg-green-100 text-green-800 border-green-300';
  if (diffDays <= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-orange-100 text-orange-800 border-orange-300';
}

export default function UserAdm() {
  const { users, loading, error } = useUsers();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

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
        <div className="py-8 text-center"><ErrorMessage message={error} /></div>
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
                    <th onClick={() => handleSort('company')} className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none">Company {sortBy === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('role')} className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none">Role</th>
                    <th onClick={() => handleSort('lastLogin')} className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none">Last Login</th>
                    <th onClick={() => handleSort('update')} className="sticky top-0 z-10 border-b bg-white/75 px-2 py-2 text-left text-sm font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, idx) => (
                    <tr key={user.email || idx} className="hover:bg-orange-50 cursor-pointer transition group">
                      <td className="py-2 pr-2 pl-4 text-sm font-medium whitespace-nowrap sm:pl-4 lg:pl-6">{user.name}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap">{user.title}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap">{user.email}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap">{user.company}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getBadgeColor(user.last_login)}`}>{user.role || '—'}</span>
                      </td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap">{formatDate(user.last_login)}</td>
                      <td className="px-2 py-2 text-sm whitespace-nowrap text-right">
                        <button
                          type="button"
                          className="text-orange-500 font-semibold hover:underline focus:outline-none"
                          onClick={() => navigate(`/admin?email=${encodeURIComponent(user.email)}`)}
                        >
                          Update
                        </button>
                      </td>
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