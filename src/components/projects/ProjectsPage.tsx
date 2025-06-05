
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectListView } from './ProjectListView';
import { ProjectDetail } from './ProjectDetail';
import { ProjectForm } from './ProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProjectState } from '@/hooks/useProjectState';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Project = Database['public']['Tables']['projects']['Row'];
type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface ProjectsPageProps {
  user: User;
}

export const ProjectsPage = ({ user }: ProjectsPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    hook_size: HookSize | '';
    yarn_weight: YarnWeight | '';
    details: string;
    featured_image_url: string | null;
  }>({
    name: '',
    hook_size: '',
    yarn_weight: '',
    details: '',
    featured_image_url: null,
  });

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

  // Reset form data when editing project changes
  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name,
        hook_size: editingProject.hook_size,
        yarn_weight: editingProject.yarn_weight,
        details: editingProject.details || '',
        featured_image_url: editingProject.featured_image_url || null,
      });
    } else {
      setFormData({
        name: '',
        hook_size: '',
        yarn_weight: '',
        details: '',
        featured_image_url: null,
      });
    }
  }, [editingProject]);

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

  const handleFormSubmit = async () => {
    if (formData.hook_size && formData.yarn_weight) {
      const projectData = {
        name: formData.name,
        hook_size: formData.hook_size,
        yarn_weight: formData.yarn_weight,
        details: formData.details || null,
        featured_image_url: formData.featured_image_url,
        is_favorite: editingProject?.is_favorite || false,
        last_mode: editingProject?.last_mode || 'edit',
        status: editingProject?.status || null,
      };

      const savedProject = await handleSaveProject(projectData, editingProject);
      if (savedProject) {
        updateProject(savedProject);
        setShowForm(false);
        setEditingProject(null);
      }
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!selectedProject ? (
        <ProjectListView
          projects={projects}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditProject={(project) => {
            setEditingProject(project);
            setShowForm(true);
          }}
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <DialogTitle>{editingProject ? 'Edit Project' : 'New Project'}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ProjectForm
              project={editingProject}
              formData={formData}
              onFormDataChange={setFormData}
              userId={user.id}
              showButtons={false}
              onRefreshProjects={fetchProjects}
            />
          </div>

          <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-reverse space-y-4 sm:space-y-0 sm:space-x-2 w-full">
              <Button type="button" variant="outline" onClick={handleFormCancel}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleFormSubmit}
                disabled={!formData.hook_size || !formData.yarn_weight}
              >
                {editingProject ? 'Update Project' : 'Create Project'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
