import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ProjectForm({ 
  drawerOpen, 
  selectedProject, 
  isAdding, 
  formError, 
  onClose, 
  onSubmit, 
  onDelete,
  onProjectUpdate 
}) {
  // Track read-only/edit mode
  const [readOnly, setReadOnly] = useState(true);
  // Track local project state for editing
  const [localProject, setLocalProject] = useState(selectedProject);

  // Reset form state when drawer opens or project changes
  useEffect(() => {
    // Only set readOnly to false when adding, otherwise lock by default
    if (isAdding) {
      setReadOnly(false);
    } else {
      setReadOnly(true);
    }
    setLocalProject(selectedProject);
  }, [drawerOpen, selectedProject, isAdding]);

  // Handle field changes
  const handleFieldChange = (field, value) => {
    const updated = { ...localProject, [field]: value };
    setLocalProject(updated);
    onProjectUpdate(updated);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return; // Prevent submit if not in edit mode
    const result = await onSubmit(localProject); // Pass the updated project object
    // Lock fields after any save (add or update), but keep drawer open
    if (!result || result !== false) {
      setReadOnly(true);
    }
  };

  // Handle Edit button
  const handleEdit = () => setReadOnly(false);

  return (
    <Dialog open={drawerOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/20 transition-opacity duration-500" aria-hidden="true" onClick={onClose}></div>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10 lg:pl-16">
            <DialogPanel className="pointer-events-auto w-screen max-w-sm sm:max-w-md transform transition duration-500 ease-in-out bg-white shadow-xl flex flex-col h-full">
              <div className="px-4 py-4 sm:py-6 sm:px-6 flex items-start justify-between border-b border-gray-200">
                <DialogTitle className="text-sm sm:text-base font-semibold text-gray-900">
                  {isAdding ? 'Add Project' : 'Project Details'}
                </DialogTitle>
                <button
                  type="button"
                  className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus-visible:ring-2 focus-visible:ring-orange-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <XMarkIcon className="size-6" aria-hidden="true" />
                </button>
              </div>
              {/* Main content */}
              {localProject && (
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="project-title" className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                      <input
                        id="project-title"
                        type="text"
                        name="title"
                        value={localProject.title}
                        onChange={e => handleFieldChange('title', e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        required
                        readOnly={readOnly}
                      />
                    </div>
                    <div>
                      <label htmlFor="project-company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        id="project-company"
                        type="text"
                        name="company_name"
                        value={localProject.company_name}
                        onChange={e => handleFieldChange('company_name', e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        required
                        readOnly={readOnly}
                      />
                    </div>
                    <div>
                      <label htmlFor="project-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        id="project-date"
                        type="date"
                        name="date"
                        value={localProject.date}
                        onChange={e => handleFieldChange('date', e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        required
                        readOnly={readOnly}
                      />
                    </div>
                    <div>
                      <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        id="project-description"
                        name="description"
                        value={localProject.description}
                        onChange={e => handleFieldChange('description', e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                        rows={3}
                        required
                        readOnly={readOnly}
                      />
                    </div>
                    {localProject.created_at && (
                      <div className="text-xs text-gray-400">
                        Created at: {new Date(localProject.created_at).toLocaleString()}
                      </div>
                    )}
                    {formError && <div className="text-red-500 text-sm">{formError}</div>}
                    <div className="flex justify-end gap-2 pt-2">
                      {!isAdding && (
                        <button
                          type="button"
                          className="px-3 sm:px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                          onClick={() => onDelete(localProject.id)}
                          disabled={readOnly}
                        >
                          Delete
                        </button>
                      )}
                      <button
                        type="button"
                        className="px-3 sm:px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                      {isAdding ? (
                        <button
                          type="submit"
                          className="px-3 sm:px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-sm"
                        >
                          Save
                        </button>
                      ) : readOnly ? (
                        <button
                          type="button"
                          className="px-3 sm:px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-sm"
                          onClick={handleEdit}
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="px-3 sm:px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-sm"
                        >
                          Update
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 