import { useState } from 'react';
import { colors } from '../config/colors';
import UserAdmin from './UserAdmin';

const tabs = [
  { name: 'Content Management', key: 'content' },
  { name: 'User Admin', key: 'user_admin' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Portal Administration</h1>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.key
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                style={{
                  borderBottomColor: activeTab === tab.key ? colors.primary.orange : undefined,
                  color: activeTab === tab.key ? colors.primary.orange : undefined
                }}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'content' && (
          <div style={{ height: '85vh', padding: 0, margin: 0, background: 'none', border: 'none', borderRadius: 0 }}>
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

        {activeTab === 'user_admin' && (
          <UserAdmin />
        )}
      </div>
    </div>
  );
} 