import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { useState, useEffect } from 'react';
import { colors, font } from '../config/colors';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MemberAdm() {
  const [activeTab, setActiveTab] = useState('profile');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/.netlify/functions/userfetch');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // Add mock login data for demonstration
        const usersWithLoginData = data.map(user => ({
          ...user,
          loginDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within last 30 days
          lastLoginDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within last 7 days
        }));
        setUsers(usersWithLoginData);
        setError(null);
      } catch (err) {
        setError('Failed to load users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Filter and sort
  const filtered = users
    .filter(u => u.name?.toLowerCase().includes(search.toLowerCase()))
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

  const tabs = [
    { name: 'Profile', key: 'profile' },
    { name: 'User Management', key: 'users' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Section Heading with Tabs */}
      <div className="mb-6 sm:mb-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Member Administration</h1>
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
      {activeTab === 'profile' && (
        <form>
          <div className="space-y-8 sm:space-y-12">
            <div className="border-b border-gray-900/10 pb-8 sm:pb-12">
              <h2 className="text-base font-semibold text-gray-900">Profile</h2>
              <p className="mt-1 text-sm text-gray-600">
                This information will be displayed publicly so be careful what you share.
              </p>

              <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-x-6 gap-y-6 sm:gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-900">
                    Username
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                      <div className="shrink-0 text-sm sm:text-base text-gray-500 select-none">workcation.com/</div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="janesmith"
                        className="block min-w-0 grow py-2 sm:py-1.5 pr-3 pl-1 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <label htmlFor="about" className="block text-sm font-medium text-gray-900">
                    About
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="about"
                      name="about"
                      rows={3}
                      className="block w-full rounded-md bg-white px-3 py-2 sm:py-1.5 text-sm sm:text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                      defaultValue={''}
                    />
                  </div>
                  <p className="mt-3 text-sm text-gray-600">Write a few sentences about yourself.</p>
                </div>

                <div className="col-span-full">
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-900">
                    Photo
                  </label>
                  <div className="mt-2 flex items-center gap-x-3">
                    <UserCircleIcon aria-hidden="true" className="size-10 sm:size-12 text-gray-300" />
                    <button
                      type="button"
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="col-span-full">
                  <label htmlFor="cover-photo" className="block text-sm font-medium text-gray-900">
                    Cover photo
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-4 sm:px-6 py-8 sm:py-10">
                    <div className="text-center">
                      <PhotoIcon aria-hidden="true" className="mx-auto size-10 sm:size-12 text-gray-300" />
                      <div className="mt-4 flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:outline-hidden hover:text-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-600">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-900/10 pb-8 sm:pb-12">
              <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
              <p className="mt-1 text-sm text-gray-600">Use a permanent address where you can receive mail.</p>

              <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-x-6 gap-y-6 sm:gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-900">
                    First name
                  </label>
                  <div className="mt-2">
                    <input
                      id="first-name"
                      name="first-name"
                      type="text"
                      autoComplete="given-name"
                      className="block w-full rounded-md bg-white px-3 py-2 sm:py-1.5 text-sm sm:text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-900">
                    Last name
                  </label>
                  <div className="mt-2">
                    <input
                      id="last-name"
                      name="last-name"
                      type="text"
                      autoComplete="family-name"
                      className="block w-full rounded-md bg-white px-3 py-2 sm:py-1.5 text-sm sm:text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="block w-full rounded-md bg-white px-3 py-2 sm:py-1.5 text-sm sm:text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-900">
                    Country
                  </label>
                  <div className="mt-2 grid grid-cols-1">
                    <select
                      id="country"
                      name="country"
                      autoComplete="country-name"
                      className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 sm:py-1.5 pr-8 pl-3 text-sm sm:text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>Mexico</option>
                    </select>
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label htmlFor="street-address" className="block text-sm font-medium text-gray-900">
                    Street address
                  </label>
                  <div className="mt-2">
                    <input
                      id="street-address"
                      name="street-address"
                      type="text"
                      autoComplete="street-address"
                      className="block w-full rounded-md bg-white px-3 py-2 sm:py-1.5 text-sm sm:text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 sm:col-start-1">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-900">
                    City
                  </label>
                  <div className="mt-2">
                    <input
                      id="city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      className="block w-full rounded-md bg-white px-3 py-2 sm:py-1.5 text-sm sm:text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="region" className="block text-sm font-medium text-gray-900">
                    State / Province
                  </label>
                  <div className="mt-2">
                    <input
                      id="region"
                      name="region"
                      type="text"
                      autoComplete="address-level1"
                      className="block w-full rounded-md bg-white px-3 py-2 sm:py-1.5 text-sm sm:text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="postal-code" className="block text-sm font-medium text-gray-900">
                    ZIP / Postal code
                  </label>
                  <div className="mt-2">
                    <input
                      id="postal-code"
                      name="postal-code"
                      type="text"
                      autoComplete="postal-code"
                      className="block w-full rounded-md bg-white px-3 py-2 sm:py-1.5 text-sm sm:text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-900/10 pb-8 sm:pb-12">
              <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
              <p className="mt-1 text-sm text-gray-600">
                We'll always let you know about important changes, but you pick what else you want to hear about.
              </p>

              <div className="mt-8 sm:mt-10 space-y-8 sm:space-y-10">
                <fieldset>
                  <legend className="text-sm font-semibold text-gray-900">By email</legend>
                  <div className="mt-6 space-y-6">
                    <div className="flex gap-3">
                      <div className="flex h-6 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                          <input
                            defaultChecked
                            id="comments"
                            name="comments"
                            type="checkbox"
                            aria-describedby="comments-description"
                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                          />
                          <svg
                            fill="none"
                            viewBox="0 0 14 14"
                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                          >
                            <path
                              d="M3 8L6 11L11 3.5"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-checked:opacity-100"
                            />
                            <path
                              d="M3 7H11"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-indeterminate:opacity-100"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="text-sm">
                        <label htmlFor="comments" className="font-medium text-gray-900">
                          Comments
                        </label>
                        <p id="comments-description" className="text-gray-500">
                          Get notified when someones posts a comment on a posting.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-6 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                          <input
                            id="candidates"
                            name="candidates"
                            type="checkbox"
                            aria-describedby="candidates-description"
                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                          />
                          <svg
                            fill="none"
                            viewBox="0 0 14 14"
                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                          >
                            <path
                              d="M3 8L6 11L11 3.5"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-checked:opacity-100"
                            />
                            <path
                              d="M3 7H11"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-indeterminate:opacity-100"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="text-sm">
                        <label htmlFor="candidates" className="font-medium text-gray-900">
                          Candidates
                        </label>
                        <p id="candidates-description" className="text-gray-500">
                          Get notified when a candidate applies for a job.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-6 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                          <input
                            id="offers"
                            name="offers"
                            type="checkbox"
                            aria-describedby="offers-description"
                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto forced-colors:before:hidden"
                          />
                          <svg
                            fill="none"
                            viewBox="0 0 14 14"
                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                          >
                            <path
                              d="M3 8L6 11L11 3.5"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-checked:opacity-100"
                            />
                            <path
                              d="M3 7H11"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-indeterminate:opacity-100"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="text-sm">
                        <label htmlFor="offers" className="font-medium text-gray-900">
                          Offers
                        </label>
                        <p id="offers-description" className="text-gray-500">
                          Get notified when a candidate accepts or rejects an offer.
                        </p>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold text-gray-900">Push notifications</legend>
                  <p className="mt-1 text-sm text-gray-600">These are delivered via SMS to your mobile phone.</p>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-x-3">
                      <input
                        defaultChecked
                        id="push-everything"
                        name="push-notifications"
                        type="radio"
                        className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                      />
                      <label htmlFor="push-everything" className="block text-sm font-medium text-gray-900">
                        Everything
                      </label>
                    </div>
                    <div className="flex items-center gap-x-3">
                      <input
                        id="push-email"
                        name="push-notifications"
                        type="radio"
                        className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                      />
                      <label htmlFor="push-email" className="block text-sm font-medium text-gray-900">
                        Same as email
                      </label>
                    </div>
                    <div className="flex items-center gap-x-3">
                      <input
                        id="push-nothing"
                        name="push-notifications"
                        type="radio"
                        className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                      />
                      <label htmlFor="push-nothing" className="block text-sm font-medium text-gray-900">
                        No push notifications
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button type="button" className="text-sm font-semibold text-gray-900">
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {activeTab === 'users' && (
        <div style={{ fontFamily: font.primary, background: colors.background.main, color: colors.text.primary }}>
          {/* Search input */}
          <div className="mb-4 max-w-xs">
            <label htmlFor="search" className="block text-sm font-medium" style={{ color: colors.text.primary }}>Quick search</label>
            <div className="mt-2">
              <div className="flex rounded-md bg-white outline-1 -outline-offset-1" style={{ outlineColor: colors.border.medium }}>
                <input
                  id="search"
                  name="search"
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="block min-w-0 grow px-3 py-2 sm:py-1 text-base placeholder:text-gray-400 focus:outline-none sm:text-sm"
                  style={{ color: colors.text.primary, fontFamily: font.primary }}
                  placeholder="Search by name..."
                />
                <div className="flex py-1 pr-1">
                  <kbd className="inline-flex items-center rounded-sm border px-1 font-sans text-xs" style={{ borderColor: colors.border.light, color: colors.text.secondary }}>
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-gray-500">Loading users...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-red-600">{error}</div>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-4 flow-root">
              <div className="-mx-2 -my-1 sm:-mx-4 lg:-mx-6">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0" style={{ fontFamily: font.primary }}>
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b bg-white/75 py-2 pr-2 pl-2 sm:pl-4 text-left text-xs sm:text-base font-semibold backdrop-blur-sm backdrop-filter lg:pl-6 cursor-pointer select-none"
                            style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                            onClick={() => handleSort('name')}
                          >
                            Name
                            <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                          </th>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-2 text-left text-xs sm:text-base font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                            style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                            onClick={() => handleSort('email')}
                          >
                            Email
                            <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                          </th>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-2 text-left text-xs sm:text-base font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                            style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                            onClick={() => handleSort('company')}
                          >
                            Company
                            <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                          </th>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-2 text-left text-xs sm:text-base font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                            style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                            onClick={() => handleSort('loginDate')}
                          >
                            Login Date
                            <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'loginDate' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                          </th>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b bg-white/75 px-1 sm:px-2 py-2 text-left text-xs sm:text-base font-semibold backdrop-blur-sm backdrop-filter cursor-pointer select-none"
                            style={{ color: colors.text.primary, borderColor: colors.border.medium }}
                            onClick={() => handleSort('lastLoginDate')}
                          >
                            Last Login
                            <span className="ml-1 align-middle" style={{ color: colors.primary.orange }}>{sortBy === 'lastLoginDate' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((user, userIdx) => (
                          <tr
                            key={user.email || userIdx}
                            className="hover:transition cursor-pointer"
                            style={{ backgroundColor: undefined, transition: 'background 0.2s', fontFamily: font.primary }}
                          >
                            <td
                              className={classNames(
                                userIdx !== filtered.length - 1 ? '' : '',
                                'py-2 pr-2 pl-2 sm:pl-4 text-xs sm:text-base whitespace-nowrap lg:pl-6',
                              )}
                              style={{ color: colors.text.primary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                            >
                              {user.name || '—'}
                            </td>
                            <td
                              className={classNames(
                                userIdx !== filtered.length - 1 ? '' : '',
                                'px-1 sm:px-2 py-2 text-xs sm:text-base whitespace-nowrap',
                              )}
                              style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                            >
                              {user.email || '—'}
                            </td>
                            <td
                              className={classNames(
                                userIdx !== filtered.length - 1 ? '' : '',
                                'px-1 sm:px-2 py-2 text-xs sm:text-base whitespace-nowrap',
                              )}
                              style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                            >
                              {user.company || '—'}
                            </td>
                            <td
                              className={classNames(
                                userIdx !== filtered.length - 1 ? '' : '',
                                'px-1 sm:px-2 py-2 text-xs sm:text-base whitespace-nowrap',
                              )}
                              style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                            >
                              {user.loginDate || '—'}
                            </td>
                            <td
                              className={classNames(
                                userIdx !== filtered.length - 1 ? '' : '',
                                'px-1 sm:px-2 py-2 text-xs sm:text-base whitespace-nowrap',
                              )}
                              style={{ color: colors.text.secondary, borderBottom: userIdx !== filtered.length - 1 ? `1px solid ${colors.border.light}` : undefined }}
                            >
                              {user.lastLoginDate || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}