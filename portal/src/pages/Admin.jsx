import { useState } from 'react';
import { Navbar, NavbarItem, NavbarSection } from '../components/navbar';

const tabs = [
  { name: 'Dashboard', key: 'dashboard' },
  { name: 'Content', key: 'content' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Content Management</h3>
          <p>Content management features coming soon.</p>
        </div>
      )}
    </div>
  );
} 