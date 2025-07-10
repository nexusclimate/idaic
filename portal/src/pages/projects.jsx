import React, { useEffect, useState } from 'react';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';

// Custom hook to fetch projects
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/projects');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, refetch: fetchProjects };
}

export default function Projects() {
  const { projects, loading, error, refetch } = useProjects();
  const [formError, setFormError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (project) => {
    try {
      console.log('Adding project:', project);
      const projectData = {
        title: project.title,
        company_name: project.company_name,
        date: project.date,
        description: project.description
      };
      console.log('Sending project data:', projectData);
      const response = await fetch('/.netlify/functions/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add project');
      }

      const newProject = await response.json();
      console.log('Project added successfully:', newProject);
      setDrawerOpen(false);
      setFormError('');
      await refetch(); // Refresh the projects list
    } catch (err) {
      console.error('Error adding project:', err);
      setFormError(err.message);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      console.log('Updating project:', id, updates);
      const updateData = {
        title: updates.title,
        company_name: updates.company_name,
        date: updates.date,
        description: updates.description
      };
      console.log('Sending update data:', updateData);
      const response = await fetch(`/.netlify/functions/projects?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }

      const updatedProject = await response.json();
      console.log('Project updated successfully:', updatedProject);
      setDrawerOpen(false);
      setFormError('');
      await refetch(); // Refresh the projects list
    } catch (err) {
      console.error('Error updating project:', err);
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log('Deleting project:', id);
      const response = await fetch(`/.netlify/functions/projects?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      console.log('Project deleted successfully');
      setDrawerOpen(false);
      setFormError('');
      await refetch(); // Refresh the projects list
    } catch (err) {
      console.error('Error deleting project:', err);
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

  const handleFormSubmit = async (project) => {
    if (!project.title || !project.company_name || !project.date || !project.description) {
      setFormError('All fields are required.');
      return false;
    }
    if (isAdding) {
      await handleAdd(project);
    } else {
      await handleUpdate(project.id, project);
    }
    setFormError('');
    return true;
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
