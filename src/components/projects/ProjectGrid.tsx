
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectGridProps {
  projects: Project[];
  searchTerm: string;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (project: Project) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onCardClick: (project: Project) => void;
  onCreateProject: () => void;
  onClearSearch: () => void;
  onTagsUpdate: () => void;
  userId: string;
}

export const ProjectGrid = ({
  projects,
  searchTerm,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onToggleFavorite,
  onCardClick,
  onCreateProject,
  onClearSearch,
  onTagsUpdate,
  userId,
}: ProjectGridProps) => {
  if (projects.length === 0 && !searchTerm) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">No projects yet!</p>
        <Button onClick={onCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Project
        </Button>
      </div>
    );
  }

  if (projects.length === 0 && searchTerm) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">No projects found matching "{searchTerm}"</p>
        <Button onClick={onClearSearch} variant="outline">
          Clear Search
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          userId={userId}
          onEdit={onEditProject}
          onDelete={onDeleteProject}
          onDuplicate={(e) => {
            e.stopPropagation();
            onDuplicateProject(project);
          }}
          onToggleFavorite={onToggleFavorite}
          onCardClick={() => onCardClick(project)}
          onTagsUpdate={onTagsUpdate}
        />
      ))}
    </div>
  );
};
