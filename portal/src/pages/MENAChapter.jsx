import { useState } from 'react';
import { colors } from '../config/colors';
import RichTextSection from '../components/RichTextSection';

export default function MENAChapter({ isAdminAuthenticated = false }) {
  const [activeTab, setActiveTab] = useState('main');
  const tabs = [
    { name: 'Main', key: 'main' },
    { name: 'MENA Updates', key: 'mena updates' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">MENA Chapter</h1>
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
      {activeTab === 'main' && (
        <>
          <RichTextSection section="mena_chapter" isAdmin={isAdminAuthenticated} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white border rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Chapter Stats</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <span>Total Members:</span>
                  <span className="font-semibold">78</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <span>Active Events:</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <span>This Month:</span>
                  <span className="font-semibold">23 new members</span>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Recent Activity</h3>
              <ul className="space-y-2">
                <li>• Regional conference planning</li>
                <li>• New partnership announcement</li>
                <li>• Member workshop completed</li>
              </ul>
            </div>
          </div>
        </>
      )}
      {activeTab === 'mena updates' && (
        <div className="w-full h-[80vh] bg-white border rounded-lg overflow-hidden">
          <iframe
            src="https://members.nexusclimate.co/tag/mena/"
            title="MENA Updates"
            className="w-full h-full border-0"
            allowFullScreen
            onLoad={() => console.log('MENA iframe loaded successfully')}
            onError={(e) => console.error('MENA iframe failed to load', e)}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          />
        </div>
      )}
    </div>
  );
} 