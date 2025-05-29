
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectDetailActionsProps {
  project: Project;
  onProjectDelete: () => void;
  onEditProject: (project: Project) => void;
  setShowDeleteConfirm: (show: boolean) => void;
}

export const useProjectDetailActions = ({
  project,
  onProjectDelete,
  onEditProject,
  setShowDeleteConfirm,
}: ProjectDetailActionsProps) => {
  const handleDeleteProject = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProject = () => {
    onProjectDelete();
    setShowDeleteConfirm(false);
  };

  const handleEditProject = () => {
    onEditProject(project);
  };

  return {
    handleDeleteProject,
    confirmDeleteProject,
    handleEditProject,
  };
};
