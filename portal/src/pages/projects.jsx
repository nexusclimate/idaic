import React, { useEffect, useState } from 'react';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';

// Custom hook to fetch projects
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch('/.netlify/functions/projects');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!ignore) {
          setProjects(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) setError('Failed to load projects');
      }
      if (!ignore) setLoading(false);
    };
    fetchProjects();
    return () => { ignore = true; };
  }, []);

  return { projects, loading, error };
}

export default function Projects() {
  const { projects, loading, error } = useProjects();
  const [formError, setFormError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (project) => {
    try {
      const response = await fetch('/.netlify/functions/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (!response.ok) throw new Error('Failed to add project');
      const newProject = await response.json();
      // Refresh the projects list
      window.location.reload();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const response = await fetch(`/.netlify/functions/projects?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update project');
      // Refresh the projects list
      window.location.reload();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/.netlify/functions/projects?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete project');
      // Refresh the projects list
      window.location.reload();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const openDrawer = (project) => {
    setSelectedProject(project);
    setIsAdding(false);
    setDrawerOpen(true);
  };

  const openAddDrawer = () => {
    setSelectedProject({ title: '', company_name: '', date: '', description: '' });
    setIsAdding(true);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedProject(null);
    setIsAdding(false);
    setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject.title || !selectedProject.company_name || !selectedProject.date || !selectedProject.description) {
      setFormError('All fields are required.');
      return;
    }
    if (isAdding) {
      await handleAdd(selectedProject);
    } else {
      await handleUpdate(selectedProject.id, selectedProject);
    }
    setFormError('');
  };

  const handleProjectUpdate = (updatedProject) => {
    setSelectedProject(updatedProject);
  };

  return (
    <>
      <ProjectList
        projects={projects}
        loading={loading}
        error={error}
        onProjectClick={openDrawer}
        onAddClick={openAddDrawer}
      />
      <ProjectForm
        drawerOpen={drawerOpen}
        selectedProject={selectedProject}
        isAdding={isAdding}
        formError={formError}
        onClose={closeDrawer}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
        onProjectUpdate={handleProjectUpdate}
      />
    </>
  );
}
