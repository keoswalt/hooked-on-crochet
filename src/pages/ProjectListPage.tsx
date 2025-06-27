import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectListView } from '@/components/projects/ProjectListView';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProjectState } from '@/hooks/useProjectState';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';
import { useNavigationContext } from "@/context/NavigationContext";

// Add breadcrumb imports
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type Project = Database['public']['Tables']['projects']['Row'];
type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface ProjectListPageProps {
  user: User;
}

export const ProjectListPage = ({ user }: ProjectListPageProps) => {
  const navigate = useNavigate();
  const { setPreviousPage } = useNavigationContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
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

  const { projects, loading, fetchProjects } = useProjectState(user);
  const {
    loading: operationsLoading,
    handleSaveProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleToggleFavorite,
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
        setShowForm(false);
        setEditingProject(undefined);
      }
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(undefined);
  };

  const handleCardClick = (project: Project) => {
    setPreviousPage({ label: "Projects", path: "/projects" });
    navigate(`/projects/${project.id}`);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={() => navigate('/planner')}
              className="cursor-pointer hover:text-foreground"
            >
              Planner
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects & Patterns</h1>
        </div>
      </div>
      
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
        onCardClick={handleCardClick}
        onCreateProject={() => setShowForm(true)}
        onImportProject={handleImportProject}
        operationsLoading={operationsLoading}
        userId={user.id}
      />

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
