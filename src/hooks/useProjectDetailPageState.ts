
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProjectOperations } from "@/hooks/useProjectOperations";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";

type Project = Database['public']['Tables']['projects']['Row'];
type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface UseProjectDetailPageStateProps {
  projectId: string | undefined;
  user: User;
}

export const useProjectDetailPageState = ({ projectId, user }: UseProjectDetailPageStateProps) => {
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

  // All project "actions" provided by project operations hook
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
    // eslint-disable-next-line
  }, [projectId, user.id]);

  // Refresh form state when project changes
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

  // Navigation-like handlers
  const handleBack = useCallback(() => {
    window.location.pathname = "/projects";
  }, []);

  const handleProjectDelete = useCallback(async () => {
    if (project) {
      await handleDeleteProject(project.id);
      window.location.pathname = "/projects";
    }
  }, [project, handleDeleteProject]);

  const handleEditProject = useCallback((projectToEdit: Project) => {
    setProject(projectToEdit);
    setShowForm(true);
  }, []);

  const handleProjectUpdate = useCallback((updatedProject: Project) => {
    setProject(updatedProject);
  }, []);

  const handleDuplicate = useCallback(async () => {
    if (project) {
      await handleDuplicateProject(project);
    }
  }, [project, handleDuplicateProject]);

  const handleFormSubmit = useCallback(async () => {
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
  }, [formData, project, handleSaveProject]);

  const handleFormCancel = useCallback(() => setShowForm(false), []);

  return {
    project,
    loading,
    notFound,
    showForm,
    setShowForm,
    formData,
    setFormData,
    operationsLoading,
    handleBack,
    handleProjectDelete,
    handleEditProject,
    handleProjectUpdate,
    handleDuplicate,
    handleFormSubmit,
    handleFormCancel,
    fetchProject,
    handleExportProject,
    handleExportPDF,
    user,
  };
};
