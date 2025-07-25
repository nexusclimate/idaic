import React, { useState } from 'react';
import { colors } from '../config/colors';

const sortOptions = [
  { label: 'Project Name', value: 'title' },
  { label: 'Company', value: 'company_name' },
  { label: 'Date', value: 'date' },
];

export default function ProjectList({ projects, loading, error, onProjectClick, onAddClick }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = projects
    .filter(p =>
      (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if ((a[sortBy] || '') < (b[sortBy] || '')) return sortDir === 'asc' ? -1 : 1;
      if ((a[sortBy] || '') > (b[sortBy] || '')) return sortDir === 'asc' ? 1 : -1;
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
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Section Heading with Add Button on top right */}
      <div className="mb-6 sm:mb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Projects</h1>
          <nav className="mt-4 sm:mt-0">
            <ul className="flex space-x-4" role="tablist">
              <li>
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none border-transparent text-orange-600 hover:text-orange-700 hover:border-orange-300 bg-transparent"
                  style={{ color: colors.primary.orange, borderColor: colors.primary.orange }}
                  onClick={onAddClick}
                  role="tab"
                  aria-selected="false"
                >
                  Add project
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
          />
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <label htmlFor="sortBy" className="text-xs sm:text-sm text-gray-700">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs sm:text-sm bg-white"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 flex items-center gap-1"
              aria-label="Toggle sort direction"
            >
              {sortDir === 'asc' ? (
                <span className="inline-block">▲</span>
              ) : (
                <span className="inline-block">▼</span>
              )}
              <span className="sr-only">Toggle sort direction</span>
            </button>
          </div>
        </div>
      </div>
      {/* Project Cards in white container like Members page */}
      <div className="bg-white border rounded-lg p-4 sm:p-6">
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading projects...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((project, idx) => (
              <button
                key={project.id || idx}
                type="button"
                onClick={() => onProjectClick(project)}
                className="relative bg-gray-100 p-0 flex flex-col rounded-lg transition border-2 focus:outline-none hover:border-orange-200 border-transparent"
                style={{
                  color: colors.text.primary,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <div className="flex flex-row items-stretch h-full w-full">
                  {/* Left: Project Name & Company */}
                  <div className="flex flex-col items-start px-6 pt-6 pb-2 min-w-[140px] max-w-[180px] flex-shrink-0 w-full">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-0 text-left w-full">{project.title}</h2>
                    <div className="text-xs sm:text-sm text-gray-500 text-left mt-1 w-full">{project.company_name}</div>
                    {/* Wide horizontal orange bar, now directly under company name */}
                    <div className="flex justify-start w-full">
                      <div className="h-1 bg-orange-500 rounded-full my-2" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>
                {/* Description below the bar, aligned top left, fixed spacing */}
                <div className="px-6 pb-6 pt-0 text-left w-full">
                  <div className="text-xs sm:text-sm text-gray-700 w-full mt-0">{project.description}</div>
                </div>
                {/* Date in top-right corner */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-4 text-xs font-medium" style={{ color: colors.primary.orange }}>
                  {project.date ? new Date(project.date).toLocaleDateString() : ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 