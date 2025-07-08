import { useState } from 'react';
import { colors } from '../config/colors';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
    description: 'Removing plastic waste from the world\'s oceans using innovative technology.'
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
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState(mockProjects);
  const [form, setForm] = useState({ name: '', company: '', date: '', description: '' });
  const [formError, setFormError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const filtered = projects
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

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.company || !form.date || !form.description) {
      setFormError('All fields are required.');
      return;
    }
    setProjects([
      ...projects,
      { ...form }
    ]);
    setForm({ name: '', company: '', date: '', description: '' });
    setShowModal(false);
  };

  const openDrawer = (project) => {
    setSelectedProject(project);
    setIsAdding(false);
    setDrawerOpen(true);
  };

  const openAddDrawer = () => {
    setSelectedProject({ name: '', company: '', date: '', description: '' });
    setIsAdding(true);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedProject(null);
    setIsAdding(false);
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      {/* Section Heading with Add Button on top right */}
      <div className="mb-8 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          onClick={openAddDrawer}
        >
          Add Project
        </button>
      </div>
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
          />
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <label htmlFor="sortBy" className="text-sm text-gray-700">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 flex items-center gap-1"
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
      <div className="bg-white border rounded-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((project, idx) => {
            const isSelected = drawerOpen && selectedProject && !isAdding && selectedProject.name === project.name && selectedProject.company === project.company && selectedProject.date === project.date && selectedProject.description === project.description;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => openDrawer(project)}
                className={`relative bg-gray-100 p-8 sm:p-10 flex flex-col rounded-lg transition border-2 focus:outline-none hover:border-orange-200 ${isSelected ? 'border-orange-500 shadow-lg' : 'border-transparent'}`}
                style={{
                  color: colors.text.primary,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {/* Date in top-right corner */}
                <div className="absolute top-3 right-4 text-xs font-medium" style={{ color: colors.primary.orange }}>
                  {new Date(project.date).toLocaleDateString()}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{project.name}</h2>
                <div className="text-sm text-gray-500 mb-2">{project.company}</div>
                <div className="flex-1 text-gray-700 mb-2">{project.description}</div>
              </button>
            );
          })}
        </div>
      </div>
      {/* Drawer for Project Details and Add Project */}
      <Dialog open={drawerOpen} onClose={closeDrawer} className="relative z-50">
        <div className="fixed inset-0 bg-black/20 transition-opacity duration-500" aria-hidden="true" onClick={closeDrawer}></div>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out bg-white shadow-xl flex flex-col h-full">
                <div className="px-4 py-6 sm:px-6 flex items-start justify-between border-b border-gray-200">
                  <DialogTitle className="text-base font-semibold text-gray-900">{isAdding ? 'Add Project' : 'Project Details'}</DialogTitle>
                  <button
                    type="button"
                    className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus-visible:ring-2 focus-visible:ring-orange-500"
                    onClick={closeDrawer}
                  >
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon className="size-6" aria-hidden="true" />
                  </button>
                </div>
                {/* Main content */}
                {selectedProject && (
                  <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (!selectedProject.name || !selectedProject.company || !selectedProject.date || !selectedProject.description) {
                          setFormError('All fields are required.');
                          return;
                        }
                        if (isAdding) {
                          setProjects([
                            ...projects,
                            { ...selectedProject }
                          ]);
                        }
                        closeDrawer();
                        setFormError('');
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                        <input
                          type="text"
                          name="name"
                          value={selectedProject.name}
                          onChange={e => setSelectedProject({ ...selectedProject, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                          disabled={!isAdding}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          name="company"
                          value={selectedProject.company}
                          onChange={e => setSelectedProject({ ...selectedProject, company: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                          disabled={!isAdding}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          name="date"
                          value={selectedProject.date}
                          onChange={e => setSelectedProject({ ...selectedProject, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                          disabled={!isAdding}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={selectedProject.description}
                          onChange={e => setSelectedProject({ ...selectedProject, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          rows={3}
                          required
                          disabled={!isAdding}
                        />
                      </div>
                      {formError && <div className="text-red-500 text-sm">{formError}</div>}
                      {isAdding && (
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                            onClick={closeDrawer}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
