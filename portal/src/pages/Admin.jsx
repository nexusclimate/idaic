import { useState } from 'react';
import { colors } from '../config/colors';

const tabs = [
  { name: 'Content', key: 'content' },
];

export default function Admin() {
  const [activeTab] = useState('content');

  return (
    <div>
      <div className="mb-8 border-b border-gray-200">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        </div>
      </div>
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
    </div>
  );
} 