import { useState } from 'react';
import { colors } from '../config/colors';

const members = [
  {
    name: 'Nexus Climate',
    logo: 'https://raw.githubusercontent.com/nexusclimate/Clear/main/NEXUS_trans.png',
    alt: 'Nexus Climate Logo',
  },
  {
    name: 'Azraq',
    logo: 'https://raw.githubusercontent.com/nexusclimate/EcoNex/main/Azraq_white.png',
    alt: 'Azraq Logo',
  },
  {
    name: 'Nexus Climate',
    logo: 'https://raw.githubusercontent.com/nexusclimate/Clear/main/NEXUS_trans.png',
    alt: 'Nexus Climate Logo',
  },
];

export default function Members() {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Members</h1>
      <p className="text-lg text-gray-600 mb-4">
        Manage your organization's members and their profiles.
      </p>
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Member Directory</h3>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">+ Add Member</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {members.map((member, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className={`bg-gray-100 p-8 sm:p-10 flex items-center justify-center rounded-lg transition border-2 focus:outline-none ${
                selected === idx
                  ? ''
                  : 'hover:border-orange-200'
              }`}
              style={{
                borderColor: selected === idx ? colors.primary.orange : 'transparent',
                boxShadow: selected === idx ? `0 0 0 2px ${colors.primary.orange}` : undefined,
                background: selected === idx ? colors.primary.orange + '22' : undefined, // subtle orange bg on select
              }}
            >
              <img
                className="max-h-20 w-auto object-contain"
                src={member.logo}
                alt={member.alt}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 