
import { useMemo } from 'react';
import { ProjectSearch } from './ProjectSearch';
import { ProjectGrid } from './ProjectGrid';
import { ProjectImporter } from './ProjectImporter';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectListViewProps {
  projects: Project[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (project: Project) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onCardClick: (project: Project) => void;
  onCreateProject: () => void;
  onImportProject: (file: File) => void;
  operationsLoading: boolean;
}

export const ProjectListView = ({
  projects,
  searchTerm,
  onSearchChange,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onToggleFavorite,
  onCardClick,
  onCreateProject,
  onImportProject,
  operationsLoading,
}: ProjectListViewProps) => {
  // Filter and sort projects based on search term and favorites
  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    if (searchTerm.trim()) {
      filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by favorite status first, then by updated_at
    return filtered.sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [projects, searchTerm]);

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Crochet Projects</h1>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <ProjectSearch 
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />
          <div className="flex gap-2">
            <ProjectImporter 
              onImport={onImportProject}
              loading={operationsLoading}
            />
            <Button onClick={onCreateProject} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      <ProjectGrid
        projects={filteredProjects}
        searchTerm={searchTerm}
        onEditProject={onEditProject}
        onDeleteProject={onDeleteProject}
        onDuplicateProject={onDuplicateProject}
        onToggleFavorite={onToggleFavorite}
        onCardClick={onCardClick}
        onCreateProject={onCreateProject}
        onClearSearch={handleClearSearch}
      />
    </div>
  );
};
