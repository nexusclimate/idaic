import { useState } from 'react';
import { colors } from '../config/colors';
import User from './User';

const tabs = [
  { name: 'Members', key: 'members' },
  { name: 'Users', key: 'users' },
  { name: 'Admin', key: 'admin' },
];

const members = [
  {
    name: 'Nexus Climate',
    logo: 'https://raw.githubusercontent.com/nexusclimate/Clear/main/NEXUS_trans.png',
    alt: 'Nexus Climate Logo',
    email: 'info@nexusclimate.co',
    location: 'London, UK',
    website: 'nexusclimate.co',
    bio: 'Nexus Climate is a leading organization in climate solutions and sustainability.'
  },
  {
    name: 'Azraq',
    logo: 'https://raw.githubusercontent.com/nexusclimate/EcoNex/main/Azraq_white.png',
    alt: 'Azraq Logo',
    email: 'contact@azraq.org',
    location: 'Dubai, UAE',
    website: 'azraq.org',
    bio: 'Azraq is dedicated to marine conservation and environmental education.'
  },
  {
    name: 'Nexus Climate',
    logo: 'https://raw.githubusercontent.com/nexusclimate/Clear/main/NEXUS_trans.png',
    alt: 'Nexus Climate Logo',
    email: 'info@nexusclimate.co',
    location: 'London, UK',
    website: 'nexusclimate.co',
    bio: 'Nexus Climate is a leading organization in climate solutions and sustainability.'
  },
];

export default function Members() {
  const [activeTab, setActiveTab] = useState('members');
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = idx => {
    setSelected(idx);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  // Update drawer content live when clicking a different member
  const handleMemberClick = idx => {
    if (!drawerOpen) {
      setDrawerOpen(true);
    }
    setSelected(idx);
  };

  return (
    <div>
      {/* Section Heading with Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
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
      {activeTab === 'members' && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Member Directory</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {members.map((member, idx) => (
              <button
                key={idx}
                onClick={() => handleMemberClick(idx)}
                className={`bg-gray-100 p-8 sm:p-10 flex items-center justify-center rounded-lg transition border-2 focus:outline-none ${
                  selected === idx && drawerOpen
                    ? ''
                    : 'hover:border-orange-200'
                }`}
                style={{
                  borderColor: selected === idx && drawerOpen ? colors.primary.orange : 'transparent',
                  boxShadow: selected === idx && drawerOpen ? `0 0 0 2px ${colors.primary.orange}` : undefined,
                  // background: selected === idx && drawerOpen ? colors.primary.orange + '22' : undefined,
                }}
              >
                <img
                  className="max-h-32 w-auto object-contain"
                  src={member.logo}
                  alt={member.alt}
                  style={{ imageRendering: 'auto' }}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'users' && (
        <User />
      )}
      {activeTab === 'admin' && (
        <div className="bg-white border rounded-lg p-8 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Add User</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input id="name" name="name" type="text" required className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-orange-500" />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input id="title" name="title" type="text" required className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-orange-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" name="email" type="email" required className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-orange-500" />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input id="role" name="role" type="text" required className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-orange-500" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-orange-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">Add User</button>
            </div>
          </form>
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
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <div
                className={`pointer-events-auto w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700 bg-white shadow-xl flex flex-col h-full ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
              >
                <div className="px-4 py-6 sm:px-6 flex items-start justify-between">
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
                {selected !== null && (
                  <div className="divide-y divide-gray-200 flex-1 overflow-y-auto">
                    <div className="pb-6">
                      <div className="-mt-12 flow-root px-4 sm:-mt-8 sm:flex sm:items-end sm:px-6 lg:-mt-16">
                        <div>
                          <div className="-m-1 flex">
                            <div className="inline-flex overflow-hidden rounded-lg border-4 border-white">
                              <img className="size-32 shrink-0 sm:size-40 lg:size-48 object-contain" src={members[selected].logo} alt="" style={{ imageRendering: 'auto' }} loading="lazy" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 sm:ml-6 sm:flex-1">
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">{members[selected].name}</h3>
                            </div>
                            <p className="text-sm text-gray-500">{members[selected].email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-5 sm:px-0 sm:py-0">
                      <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                        <div className="sm:flex sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48">Bio</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">
                            <p>{members[selected].bio}</p>
                          </dd>
                        </div>
                        <div className="sm:flex sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48">Location</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">{members[selected].location}</dd>
                        </div>
                        <div className="sm:flex sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:shrink-0 lg:w-48">Website</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">{members[selected].website}</dd>
                        </div>
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