import { useState } from 'react';
import { colors } from '../config/colors';

const mockProjects = [
  {
    name: 'Green Energy Initiative',
    company: 'EcoCorp',
    date: '2024-06-01',
    description: 'A project focused on developing sustainable energy solutions for urban areas.'
  },
  {
    name: 'Ocean Cleanup',
    company: 'BlueWave',
    date: '2024-05-15',
    description: 'Removing plastic waste from the world’s oceans using innovative technology.'
  },
  {
    name: 'Urban Forest',
    company: 'TreeCity',
    date: '2024-07-10',
    description: 'Planting trees in metropolitan areas to improve air quality and biodiversity.'
  },
];

const sortOptions = [
  { label: 'Project Name', value: 'name' },
  { label: 'Company', value: 'company' },
  { label: 'Date', value: 'date' },
];

export default function Projects() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = mockProjects
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    )
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
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      {/* Section Heading with Tabs (left-aligned, consistent with other pages) */}
      <div className="mb-8 border-b border-gray-200">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        </div>
      </div>
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Sort by:</span>
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSort(opt.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors duration-150 focus:outline-none ${sortBy === opt.value ? 'bg-orange-100 border-orange-400 text-orange-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              {opt.label}
              {sortBy === opt.value && (
                <span className="ml-1 align-middle">{sortDir === 'asc' ? '▲' : '▼'}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project, idx) => (
          <div
            key={idx}
            className="rounded-lg shadow-sm p-6 flex flex-col"
            style={{
              background: colors.background.white,
              border: `2px solid ${colors.primary.orange}`,
              color: colors.text.primary,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <h2 className="text-xl font-semibold mb-1" style={{ color: colors.primary.orange }}>{project.name}</h2>
            <div className="text-sm mb-2" style={{ color: colors.text.secondary }}>{project.company}</div>
            <div className="text-xs mb-4" style={{ color: colors.primary.orange }}>{new Date(project.date).toLocaleDateString()}</div>
            <div className="flex-1 mb-2" style={{ color: colors.text.primary }}>{project.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
