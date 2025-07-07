import { useState } from 'react';
import { colors } from '../config/colors';

const initialPeople = [
  { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
  // More people...
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function User() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [people, setPeople] = useState(initialPeople);

  // Filter and sort
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
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Search input */}
      <div className="mb-4 max-w-xs">
        <label htmlFor="search" className="block text-sm font-medium text-gray-900">Quick search</label>
        <div className="mt-2">
          <div className="flex rounded-md bg-white outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-orange-500">
            <input
              id="search"
              name="search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block min-w-0 grow px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
              placeholder="Search by name..."
            />
            <div className="flex py-1.5 pr-1.5">
              <kbd className="inline-flex items-center rounded-sm border border-gray-200 px-1 font-sans text-xs text-gray-400">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b border-gray-300 bg-white/75 py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 backdrop-blur-sm backdrop-filter sm:pl-6 lg:pl-8 cursor-pointer select-none"
                    onClick={() => handleSort('name')}
                  >
                    Name
                    <span className="ml-1 align-middle">{sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white/75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur-sm backdrop-filter sm:table-cell cursor-pointer select-none"
                    onClick={() => handleSort('title')}
                  >
                    Title
                    <span className="ml-1 align-middle">{sortBy === 'title' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white/75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur-sm backdrop-filter lg:table-cell cursor-pointer select-none"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    <span className="ml-1 align-middle">{sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 border-b border-gray-300 bg-white/75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                    onClick={() => handleSort('role')}
                  >
                    Role
                    <span className="ml-1 align-middle">{sortBy === 'role' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((person, personIdx) => (
                  <tr
                    key={person.email}
                    className="hover:bg-orange-50 cursor-pointer transition"
                    onClick={() => {/* handle row click, e.g. open details */}}
                  >
                    <td
                      className={classNames(
                        personIdx !== filtered.length - 1 ? 'border-b border-gray-200' : '',
                        'py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 lg:pl-8',
                      )}
                    >
                      {person.name}
                    </td>
                    <td
                      className={classNames(
                        personIdx !== filtered.length - 1 ? 'border-b border-gray-200' : '',
                        'hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 sm:table-cell',
                      )}
                    >
                      {person.title}
                    </td>
                    <td
                      className={classNames(
                        personIdx !== filtered.length - 1 ? 'border-b border-gray-200' : '',
                        'hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 lg:table-cell',
                      )}
                    >
                      {person.email}
                    </td>
                    <td
                      className={classNames(
                        personIdx !== filtered.length - 1 ? 'border-b border-gray-200' : '',
                        'px-3 py-4 text-sm whitespace-nowrap text-gray-500',
                      )}
                    >
                      {person.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 