import { useState } from 'react';
import { colors } from '../config/colors';
import { ComputerDesktopIcon } from '@heroicons/react/24/solid';

const tabs = [
  { name: 'Personal Info', key: 'personal' },
  { name: 'Security', key: 'security' },
  { name: 'Notifications', key: 'notifications' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('personal');
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [photo, setPhoto] = useState(null);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      {/* Section Heading with underline */}
      <div className="mb-8 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 text-left">User Settings</h1>
      </div>
      {/* Section Heading with Tabs */}
      <div className="mb-8 border-b border-gray-200">
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
      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-8">
        {activeTab === 'personal' && (
          <>
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                <div className="flex items-center gap-4">
                  <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                    {photo ? (
                      <img src={photo} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 0v24H0V0h24z" fill="none" />
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </span>
                  <input id="photo" name="photo" type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" onChange={handlePhotoChange} />
                </div>
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input id="name" name="name" type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-orange-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">Save</button>
              </div>
            </form>
          </>
        )}
        {activeTab === 'security' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Security</h2>
            <p className="text-gray-500">Security settings coming soon.</p>
          </div>
        )}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Notifications</h2>
            <p className="text-gray-500">Notification preferences coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
} 