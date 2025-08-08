import { useState, useEffect } from 'react';
import { Navbar, NavbarItem, NavbarSection } from '../components/navbar';
import { colors } from '../config/colors';
import MemberAdm from './member_adm';
import UserAdm from './user_adm';
import { useLocation } from 'react-router-dom';

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
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const location = useLocation();

  // Fetch all users for search
  useEffect(() => {
    fetch('/.netlify/functions/userfetch')
      .then(res => res.json())
      .then(data => setUserList(data));
  }, []);

  // If query param ?email= is present, load that user's info
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    if (email && userList.length > 0) {
      const user = userList.find(u => u.email === email);
      if (user) setSelectedUser(user);
    }
  }, [location.search, userList]);

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
          <p className="text-base sm:text-lg text-gray-600 mb-4">
            Administrative tools and system management.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white border rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <span>Database:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <span>API Services:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <span>Email Service:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Quick Actions</h3>
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
        <div style={{ height: '95vh', padding: 0, margin: 0, background: 'none', border: 'none', borderRadius: 0 }}>
          <iframe
            src="https://members.nexusclimate.co/ghost/#/posts"
            title="Content Management"
            style={{ width: '100%', height: '100%', border: 'none', padding: 0, margin: 0, background: 'none' }}
            allowFullScreen
            onLoad={() => console.log('Admin iframe loaded successfully')}
            onError={(e) => console.error('Admin iframe failed to load', e)}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          />
        </div>
      )}
      {activeTab === 'users' && (
        <UserAdm />
      )}
      {activeTab === 'members' && (
        <div className="bg-white border rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Members Management</h3>
          <p>Members management features coming soon.</p>
        </div>
      )}
      {activeTab === 'admin' && (
        <div className="bg-white border rounded-lg p-8 max-w-4xl mx-auto">
          {/* Search bar for users */}
          <div className="mb-4 max-w-xs">
            <label htmlFor="admin-user-search" className="block text-sm font-medium text-gray-900">Search users</label>
            <input
              id="admin-user-search"
              name="admin-user-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500"
              placeholder="Search by name or email..."
            />
            {/* Show filtered user list */}
            {search && (
              <ul className="mt-2 bg-white border rounded shadow max-h-40 overflow-y-auto">
                {userList.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).map(u => (
                  <li key={u.email} className="px-3 py-2 hover:bg-orange-50 cursor-pointer" onClick={() => setSelectedUser(u)}>
                    <span className="font-medium">{u.name}</span> <span className="text-xs text-gray-500">{u.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Pass selectedUser to MemberAdm as a prop */}
          <MemberAdm user={selectedUser} />
        </div>
      )}
    </div>
  );
} 