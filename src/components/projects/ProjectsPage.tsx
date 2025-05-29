import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { ProjectForm } from './ProjectForm';
import { ProjectDetail } from './ProjectDetail';
import { ProjectListView } from './ProjectListView';
import { useToast } from '@/hooks/use-toast';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectsPageProps {
  user: User;
}

export const ProjectsPage = ({ user }: ProjectsPageProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  // Check for project URL parameter when projects are loaded
  useEffect(() => {
    if (projects.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('project');
      
      if (projectId && !selectedProject) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
          // Clear URL parameter after selecting project
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [projects, selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
    // Don't clear selectedProject when editing - keep the user in detail view
  };

  const handleDeleteProjectFromDetail = () => {
    if (selectedProject) {
      handleDeleteProject(selectedProject.id);
      setSelectedProject(null);
    }
  };

  const handleSave = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    await handleSaveProject(projectData, editingProject);
    setShowForm(false);
    setEditingProject(null);
    
    // If we were editing a selected project, update it with the latest data
    if (editingProject && selectedProject && editingProject.id === selectedProject.id) {
      try {
        const { data: updatedProject, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', editingProject.id)
          .single();
        
        if (error) throw error;
        if (updatedProject) {
          setSelectedProject(updatedProject);
        }
      } catch (error) {
        console.error('Error fetching updated project:', error);
      }
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(null);
    // Don't clear selectedProject - this will keep us in the detail view if we were editing from there
  };

  // Prioritize form over project detail
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userEmail={user.email} />
        <main className="container mx-auto px-4 py-8">
          <ProjectForm
            project={editingProject || undefined}
            onSave={handleSave}
            onCancel={handleFormCancel}
          />
        </main>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userEmail={user.email} />
        <main className="container mx-auto px-4 py-8">
          <ProjectDetail 
            project={selectedProject} 
            onBack={() => setSelectedProject(null)}
            onProjectDelete={handleDeleteProjectFromDetail}
            onProjectExport={() => handleExportProject(selectedProject)}
            onProjectExportPDF={() => handleExportPDF(selectedProject)}
            onEditProject={handleEditProject}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={user.email} />
      <main className="container mx-auto px-4 py-8">
        <ProjectListView
          projects={projects}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onDuplicateProject={handleDuplicateProject}
          onToggleFavorite={handleToggleFavorite}
          onCardClick={setSelectedProject}
          onCreateProject={() => setShowForm(true)}
          onImportProject={handleImportProject}
          operationsLoading={operationsLoading}
        />
      </main>
    </div>
  );
};
