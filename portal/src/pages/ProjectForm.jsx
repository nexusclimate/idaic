import React from 'react';
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
              {selectedProject && (
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                  <form
                    onSubmit={(e) => {
                      console.log('Form onSubmit triggered');
                      onSubmit(e);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="project-title" className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                      <input
                        id="project-title"
                        type="text"
                        name="title"
                        value={selectedProject.title}
                        onChange={e => {
                          const updatedProject = { ...selectedProject, title: e.target.value };
                          onProjectUpdate(updatedProject);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="project-company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        id="project-company"
                        type="text"
                        name="company_name"
                        value={selectedProject.company_name}
                        onChange={e => {
                          const updatedProject = { ...selectedProject, company_name: e.target.value };
                          onProjectUpdate(updatedProject);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="project-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        id="project-date"
                        type="date"
                        name="date"
                        value={selectedProject.date}
                        onChange={e => {
                          const updatedProject = { ...selectedProject, date: e.target.value };
                          onProjectUpdate(updatedProject);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        id="project-description"
                        name="description"
                        value={selectedProject.description}
                        onChange={e => {
                          const updatedProject = { ...selectedProject, description: e.target.value };
                          onProjectUpdate(updatedProject);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        rows={3}
                        required
                      />
                    </div>
                    {selectedProject.created_at && (
                      <div className="text-xs text-gray-400">
                        Created at: {new Date(selectedProject.created_at).toLocaleString()}
                      </div>
                    )}
                    {formError && <div className="text-red-500 text-sm">{formError}</div>}
                    <div className="flex justify-end gap-2 pt-2">
                      {!isAdding && (
                        <button
                          type="button"
                          className="px-3 sm:px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                          onClick={() => onDelete(selectedProject.id)}
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
                      <button
                        type="submit"
                        onClick={() => console.log('Save button clicked')}
                        className="px-3 sm:px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-sm"
                      >
                        {isAdding ? 'Save' : 'Update'}
                      </button>
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