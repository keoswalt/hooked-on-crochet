
import { useState } from 'react';
import { ProjectListView } from './ProjectListView';
import { ProjectDetail } from './ProjectDetail';
import { ProjectForm } from './ProjectForm';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import { useProjectState } from '@/hooks/useProjectState';
import { useProjectNavigation } from '@/hooks/useProjectNavigation';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectsPageProps {
  user: User;
}

export const ProjectsPage = ({ user }: ProjectsPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    projects,
    selectedProject,
    setSelectedProject,
    loading,
    fetchProjects,
    updateProject,
  } = useProjectState(user);

  const {
    currentView,
    editingProject,
    navigateToList,
    navigateToDetail,
    navigateToForm,
    handleFormCancel,
    handleFormSave,
  } = useProjectNavigation();

  const {
    loading: operationsLoading,
    handleSaveProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleToggleFavorite: toggleFavorite,
    handleExportProject,
    handleExportPDF,
    handleImportProject,
  } = useProjectOperations(user, fetchProjects);

  const handleCreateProject = () => {
    navigateToForm();
  };

  const handleEditProject = (project: Project) => {
    navigateToForm(project);
  };

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
    navigateToDetail(project);
  };

  const handleBackToList = () => {
    navigateToList();
    setSelectedProject(null);
  };

  const onFormCancel = () => {
    handleFormCancel(selectedProject);
  };

  const onFormSave = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const savedProject = await handleSaveProject(projectData, editingProject);
    const updatedProject = handleFormSave(selectedProject, savedProject);
    
    if (updatedProject && savedProject) {
      setSelectedProject(savedProject);
    }
  };

  const handleProjectDelete = async () => {
    if (selectedProject) {
      await handleDeleteProject(selectedProject.id);
      navigateToList();
      setSelectedProject(null);
    }
  };

  const handleProjectExport = async () => {
    if (selectedProject) {
      await handleExportProject(selectedProject);
    }
  };

  const handleProjectExportPDF = async () => {
    if (selectedProject) {
      await handleExportPDF(selectedProject);
    }
  };

  const handleToggleFavorite = async (projectId: string, isFavorite: boolean) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      await toggleFavorite(project);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (currentView === 'form') {
    return (
      <ProjectForm
        project={editingProject}
        onSave={onFormSave}
        onCancel={onFormCancel}
        userId={user.id}
      />
    );
  }

  if (currentView === 'detail' && selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={handleBackToList}
        onProjectDelete={handleProjectDelete}
        onProjectExport={handleProjectExport}
        onProjectExportPDF={handleProjectExportPDF}
        onEditProject={handleEditProject}
        onProjectUpdate={updateProject}
        userId={user.id}
      />
    );
  }

  return (
    <ProjectListView
      projects={projects}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onEditProject={handleEditProject}
      onDeleteProject={handleDeleteProject}
      onDuplicateProject={handleDuplicateProject}
      onToggleFavorite={handleToggleFavorite}
      onCardClick={handleCardClick}
      onCreateProject={handleCreateProject}
      onImportProject={handleImportProject}
      operationsLoading={operationsLoading}
    />
  );
};
