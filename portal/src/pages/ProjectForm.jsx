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
  // Remove showUpdatedAt state, always show updated_at if present

  // Reset form state when drawer opens or project changes
  useEffect(() => {
    // Only set readOnly to false when adding, otherwise lock by default
    if (isAdding) {
      setReadOnly(false);
    } else {
      setReadOnly(true);
    }
    setLocalProject(selectedProject);
    // No showUpdatedAt state needed
  }, [drawerOpen, selectedProject, isAdding]);

  // Handle field changes
  const handleFieldChange = (field, value) => {
    console.log('Field changed:', field, value);
    const updated = { ...localProject, [field]: value };
    setLocalProject(updated);
    // Do NOT call onProjectUpdate here
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return; // Prevent submit if not in edit mode
    console.log('Submitting form to database (Save/Update)');
    const result = await onSubmit(localProject); // Pass the updated project object
    if (!result || result !== false) {
      setReadOnly(true);
      onProjectUpdate(localProject); // Only update parent after save
    }
  };

  // Handle Edit button
  const handleEdit = () => {
    console.log('Edit clicked: unlocking fields, no database action');
    setReadOnly(false);
  };

  // Handle Delete button with confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = () => {
    console.log('Delete button clicked. readOnly:', readOnly);
    if (readOnly) return;
    setShowDeleteConfirm(true);
    setDeleteInput('');
    setDeleteError('');
    console.log('Delete confirmation dialog opened.');
  };

  const handleDeleteConfirm = async () => {
    console.log('Confirm delete clicked. Input:', deleteInput, 'Expected:', localProject.id);
    if (deleteInput !== String(localProject.id)) {
      setDeleteError('Record ID does not match.');
      return;
    }
    setDeleteLoading(true);
    try {
      console.log('Calling onDelete with ID:', localProject.id);
      await onDelete(localProject.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      setDeleteError('Failed to delete. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteInput('');
    setDeleteError('');
  };

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
                    {/* Show updated_at above created_at if available, with minimal gap and GMT time */}
                    {localProject.updated_at && (
                      <div className="text-xs text-gray-400 mb-0">
                        Updated at: {new Date(localProject.updated_at).toUTCString()}
                      </div>
                    )}
                    {localProject.created_at && (
                      <div className="text-xs text-gray-400 mt-0 mb-0">
                        Created at: {new Date(localProject.created_at).toUTCString()}
                      </div>
                    )}
                    {localProject.id && localProject.created_at && (
                      <div className="text-xs text-gray-400 mt-0 mb-0">
                        Record ID: {localProject.id}
                      </div>
                    )}
                    {formError && <div className="text-red-500 text-sm">{formError}</div>}
                    <div className="flex justify-end gap-2 pt-2">
                      {isAdding ? (
                        <button
                          type="submit"
                          className="px-3 sm:px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-sm"
                        >
                          Save
                        </button>
                      ) : !readOnly && (
                        <button
                          type="submit"
                          className="px-3 sm:px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-sm"
                        >
                          Update
                        </button>
                      )}
                    </div>
                  </form>
                  {/* Edit button OUTSIDE the form, only shown when readOnly */}
                  {!isAdding && readOnly && (
                    <div className="flex flex-col items-end gap-2 pt-2">
                      <button
                        type="button"
                        className="px-3 sm:px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-sm"
                        onClick={handleEdit}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  {/* Show Delete button only when not readOnly */}
                  {!isAdding && !readOnly && (
                    <div className="flex flex-col items-end gap-2 pt-2 relative">
                      <button
                        type="button"
                        className="px-3 sm:px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-sm"
                        onClick={handleEdit}
                        disabled
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="px-3 sm:px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-sm mt-2"
                        onClick={handleDeleteClick}
                        id="delete-btn"
                      >
                        Delete
                      </button>
                      {/* Delete confirmation popover */}
                      {showDeleteConfirm && (
                        <div className="absolute right-0 mt-2 z-50 bg-white rounded-lg shadow-lg p-4 w-64 flex flex-col items-center border border-gray-200">
                          <div className="text-base font-semibold mb-2 text-gray-900">Confirm Deletion</div>
                          <div className="text-xs text-gray-600 mb-2 text-center">To delete this record, type the ID <span className="font-mono font-bold">{localProject.id}</span> below and click Confirm.</div>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                            value={deleteInput}
                            onChange={e => setDeleteInput(e.target.value)}
                            placeholder="Enter record ID"
                            disabled={deleteLoading}
                          />
                          {deleteError && <div className="text-xs text-red-500 mb-2">{deleteError}</div>}
                          <div className="flex gap-2 w-full justify-end">
                            <button
                              type="button"
                              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={handleDeleteConfirm}
                              disabled={deleteLoading}
                            >
                              {deleteLoading ? 'Deleting...' : 'Confirm'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 