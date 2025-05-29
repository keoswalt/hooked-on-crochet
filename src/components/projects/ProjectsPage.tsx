
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectListView } from './ProjectListView';
import { ProjectDetail } from './ProjectDetail';
import { ProjectForm } from './ProjectForm';
import { useProjectState } from '@/hooks/useProjectState';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectsPageProps {
  user: User;
}

export const ProjectsPage = ({ user }: ProjectsPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { projects, selectedProject, setSelectedProject, loading, fetchProjects, updateProject } = useProjectState(user);
  const {
    loading: operationsLoading,
    handleSaveProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleToggleFavorite,
    handleExportProject,
    handleExportPDF,
    handleImportProject,
  } = useProjectOperations(user, fetchProjects);

  const handleDeleteSelectedProject = async () => {
    if (selectedProject) {
      await handleDeleteProject(selectedProject.id);
      setSelectedProject(null);
    }
  };

  const handleToggleFavoriteWrapper = async (id: string, isFavorite: boolean) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      await handleToggleFavorite(project);
    }
  };

  const handleDuplicateWrapper = async (project: Project) => {
    await handleDuplicateProject(project);
  };

  const onSave = async (projectData: any) => {
    const savedProject = await handleSaveProject(projectData, editingProject);
    if (savedProject) {
      updateProject(savedProject);
      setShowForm(false);
      setEditingProject(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!selectedProject ? (
        <ProjectListView
          projects={projects}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditProject={setEditingProject}
          onDeleteProject={handleDeleteProject}
          onDuplicateProject={handleDuplicateWrapper}
          onToggleFavorite={handleToggleFavoriteWrapper}
          onCardClick={setSelectedProject}
          onCreateProject={() => setShowForm(true)}
          onImportProject={handleImportProject}
          operationsLoading={operationsLoading}
          userId={user.id}
        />
      ) : (
        <ProjectDetail
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onProjectDelete={handleDeleteSelectedProject}
          onProjectExport={() => handleExportProject(selectedProject)}
          onProjectExportPDF={() => handleExportPDF(selectedProject)}
          onEditProject={(project) => {
            setEditingProject(project);
            setShowForm(true);
          }}
          onProjectUpdate={updateProject}
          userId={user.id}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <ProjectForm
              project={editingProject}
              onSave={onSave}
              onCancel={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
              userId={user.id}
            />
          </div>
        </div>
      )}
    </div>
  );
};
