import { useState } from 'react';
import { Navbar, NavbarItem, NavbarSection } from '../components/navbar';
import { colors } from '../config/colors';
import MemberAdm from './member_adm';

const initialPeople = [
  { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
  // More people...
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const tabs = [
  { name: 'Dashboard', key: 'dashboard' },
  { name: 'Content', key: 'content' },
  { name: 'Users', key: 'users' },
  { name: 'Members', key: 'members' },
  { name: 'Admin', key: 'admin' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [people, setPeople] = useState(initialPeople);

  // Filter and sort for Users tab
  const filtered = people
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
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
    <div>
      {/* Section Heading with Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
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
                    style={activeTab === tab.key ? { color: '#FF9900', borderColor: '#FF9900' } : {}}
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
      {activeTab === 'dashboard' && (
        <>
          <p className="text-lg text-gray-600 mb-4">
            Administrative tools and system management.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Database:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>API Services:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Email Service:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded">Backup Database</button>
                <button className="w-full bg-yellow-500 text-white px-4 py-2 rounded">Clear Cache</button>
                <button className="w-full bg-red-500 text-white px-4 py-2 rounded">System Restart</button>
              </div>
            </div>
          </div>
        </>
      )}
      {activeTab === 'content' && (
        <div className="bg-white border rounded-lg p-4" style={{ height: '95vh' }}>
          <iframe
            src="https://members.nexusclimate.co/ghost/#/posts"
            title="Content Management"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
          />
        </div>
      )}
      {activeTab === 'users' && (
        <div className="bg-white border rounded-lg p-8">
          {/* User management table (from User.jsx) */}
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
                  placeholder="Search by name..."
                />
                <div className="flex py-1.5 pr-1.5">
                  <kbd className="inline-flex items-center rounded-sm border border-gray-200 px-1 font-sans text-xs text-gray-400">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 border-b border-gray-300 bg-white/75 py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 backdrop-blur-sm backdrop-filter sm:pl-6 lg:pl-8 cursor-pointer select-none"
                        onClick={() => handleSort('name')}
                      >
                        Name
                        <span className="ml-1 align-middle">{sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white/75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur-sm backdrop-filter sm:table-cell cursor-pointer select-none"
                        onClick={() => handleSort('title')}
                      >
                        Title
                        <span className="ml-1 align-middle">{sortBy === 'title' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white/75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur-sm backdrop-filter lg:table-cell cursor-pointer select-none"
                        onClick={() => handleSort('email')}
                      >
                        Email
                        <span className="ml-1 align-middle">{sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 border-b border-gray-300 bg-white/75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                        onClick={() => handleSort('role')}
                      >
                        Role
                        <span className="ml-1 align-middle">{sortBy === 'role' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((person, personIdx) => (
                      <tr
                        key={person.email}
                        className="hover:bg-orange-50 cursor-pointer transition"
                        onClick={() => {/* handle row click, e.g. open details */}}
                      >
                        <td
                          className={classNames(
                            personIdx !== filtered.length - 1 ? 'border-b border-gray-200' : '',
                            'py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 lg:pl-8',
                          )}
                        >
                          {person.name}
                        </td>
                        <td
                          className={classNames(
                            personIdx !== filtered.length - 1 ? 'border-b border-gray-200' : '',
                            'hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 sm:table-cell',
                          )}
                        >
                          {person.title}
                        </td>
                        <td
                          className={classNames(
                            personIdx !== filtered.length - 1 ? 'border-b border-gray-200' : '',
                            'hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 lg:table-cell',
                          )}
                        >
                          {person.email}
                        </td>
                        <td
                          className={classNames(
                            personIdx !== filtered.length - 1 ? 'border-b border-gray-200' : '',
                            'px-3 py-4 text-sm whitespace-nowrap text-gray-500',
                          )}
                        >
                          {person.role}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
                      let lastLogin = user.last_sign_in || user.lastLogin || user.last_activity || user.lastActivity || null;
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
                      // Format date as dd/mm/yyyy - hh:mm
                      let formattedDate = lastLoginDate ? `${lastLoginDate.getDate().toString().padStart(2, '0')}/${(lastLoginDate.getMonth()+1).toString().padStart(2, '0')}/${lastLoginDate.getFullYear()} - ${lastLoginDate.getHours().toString().padStart(2, '0')}:${lastLoginDate.getMinutes().toString().padStart(2, '0')}` : '—';
                      return (
                        <tr key={user.email || userIdx} className="hover:transition cursor-pointer" style={{ backgroundColor: undefined, transition: 'background 0.2s', fontFamily: font.primary }}>
                          <td className="py-2 pr-2 pl-4 text-sm font-medium whitespace-nowrap sm:pl-4 lg:pl-6" style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}>{user.name || '—'}</td>
                          <td className="px-2 py-2 text-sm whitespace-nowrap" style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}>{user.email || '—'}</td>
                          <td className="px-2 py-2 text-sm whitespace-nowrap" style={{ borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeColor}`}>{user.role || '—'}</span>
                          </td>
                          <td className="px-2 py-2 text-sm whitespace-nowrap" style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}>
                            {formattedDate}
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
      )}
      {activeTab === 'members' && (
        <div className="bg-white border rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Members Management</h3>
          <p>Members management features coming soon.</p>
        </div>
      )}
      {activeTab === 'admin' && (
        <div className="bg-white border rounded-lg p-8 max-w-4xl mx-auto">
          <MemberAdm />
        </div>
      )}
    </div>
  );
} 