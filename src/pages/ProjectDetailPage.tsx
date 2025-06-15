
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Project = Database['public']['Tables']['projects']['Row'];
type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface ProjectDetailPageProps {
  user: User;
}

export const ProjectDetailPage = ({ user }: ProjectDetailPageProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showForm, setShowForm] = useState(false);
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

  const {
    loading: operationsLoading,
    handleSaveProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleExportProject,
    handleExportPDF,
  } = useProjectOperations(user, fetchProject);

  async function fetchProject() {
    if (!projectId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setNotFound(true);
      } else {
        setProject(data);
        setNotFound(false);
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProject();
  }, [projectId, user.id]);

  // Reset form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        hook_size: project.hook_size,
        yarn_weight: project.yarn_weight,
        details: project.details || '',
        featured_image_url: project.featured_image_url || null,
      });
    }
  }, [project]);

  const handleBack = () => {
    navigate('/projects');
  };

  const handleProjectDelete = async () => {
    if (project) {
      await handleDeleteProject(project.id);
      navigate('/projects');
    }
  };

  const handleEditProject = (projectToEdit: Project) => {
    setProject(projectToEdit);
    setShowForm(true);
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const handleDuplicate = async () => {
    if (project) {
      await handleDuplicateProject(project);
    }
  };

  const handleFormSubmit = async () => {
    if (formData.hook_size && formData.yarn_weight && project) {
      const projectData = {
        name: formData.name,
        hook_size: formData.hook_size,
        yarn_weight: formData.yarn_weight,
        details: formData.details || null,
        featured_image_url: formData.featured_image_url,
        is_favorite: project.is_favorite,
        last_mode: project.last_mode,
        status: project.status,
      };

      const savedProject = await handleSaveProject(projectData, project);
      if (savedProject) {
        setProject(savedProject);
        setShowForm(false);
      }
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={handleBack}>Back to Projects</Button>
      </div>
    );
  }

  if (!project) {
    return <div className="container mx-auto px-4 py-8 text-center">Project not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectDetail
        project={project}
        onBack={handleBack}
        onProjectDelete={handleProjectDelete}
        onProjectExport={() => handleExportProject(project)}
        onProjectExportPDF={() => handleExportPDF(project)}
        onEditProject={handleEditProject}
        onProjectUpdate={handleProjectUpdate}
        onDuplicate={handleDuplicate}
        userId={user.id}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ProjectForm
              project={project}
              formData={formData}
              onFormDataChange={setFormData}
              userId={user.id}
              showButtons={false}
              onRefreshProjects={fetchProject}
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
                Update Project
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
