import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectListView } from './ProjectListView';
import { ProjectDetail } from './ProjectDetail';
import { ProjectForm } from './ProjectForm';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectsPageProps {
  user: User;
}

export const ProjectsPage = ({ user }: ProjectsPageProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [returnToDetail, setReturnToDetail] = useState(false);

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

  async function fetchProjects() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, [user.id]);

  const handleCreateProject = () => {
    setEditingProject(null);
    setReturnToDetail(false);
    setCurrentView('form');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setReturnToDetail(currentView === 'detail');
    setCurrentView('form');
  };

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProject(null);
    setEditingProject(null);
    setReturnToDetail(false);
  };

  const handleFormCancel = () => {
    if (returnToDetail && selectedProject) {
      setCurrentView('detail');
    } else {
      setCurrentView('list');
    }
    setEditingProject(null);
    setReturnToDetail(false);
  };

  const handleFormSave = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const savedProject = await handleSaveProject(projectData, editingProject);
    
    if (returnToDetail && savedProject) {
      // Update the selected project with the saved data
      setSelectedProject(savedProject);
      setCurrentView('detail');
    } else {
      setCurrentView('list');
    }
    
    setEditingProject(null);
    setReturnToDetail(false);
  };

  const handleProjectDelete = async () => {
    if (selectedProject) {
      await handleDeleteProject(selectedProject.id);
      setCurrentView('list');
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
        onSave={handleFormSave}
        onCancel={handleFormCancel}
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
