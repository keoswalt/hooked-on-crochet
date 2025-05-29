
import { ProjectCard } from './ProjectCard';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectGridProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
  onToggleFavorite: (projectId: string, isFavorite: boolean) => void;
  onCardClick: (project: Project) => void;
  operationsLoading: boolean;
  userId: string;
}

export const ProjectGrid = ({
  projects,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onToggleFavorite,
  onCardClick,
  operationsLoading,
  userId,
}: ProjectGridProps) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
        <p className="text-gray-500 mb-4">Start by creating your first crochet project!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={(e) => {
            e.stopPropagation();
            onEditProject(project);
          }}
          onDelete={onDeleteProject}
          onDuplicate={(e) => {
            e.stopPropagation();
            onDuplicateProject(project);
          }}
          onToggleFavorite={onToggleFavorite}
          onCardClick={() => onCardClick(project)}
          userId={userId}
        />
      ))}
    </div>
  );
};
