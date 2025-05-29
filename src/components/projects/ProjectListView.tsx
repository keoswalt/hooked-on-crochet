
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { ProjectGrid } from './ProjectGrid';
import { ProjectSearch } from './ProjectSearch';
import { ProjectImporter } from './ProjectImporter';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectListViewProps {
  projects: Project[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
  onToggleFavorite: (projectId: string, isFavorite: boolean) => void;
  onCardClick: (project: Project) => void;
  onCreateProject: () => void;
  onImportProject: (file: File) => void;
  operationsLoading: boolean;
  userId: string;
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
  userId,
}: ProjectListViewProps) => {
  const [showImporter, setShowImporter] = useState(false);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.details && project.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowImporter(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={onCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <ProjectSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />

      <ProjectGrid
        projects={filteredProjects}
        onEditProject={onEditProject}
        onDeleteProject={onDeleteProject}
        onDuplicateProject={onDuplicateProject}
        onToggleFavorite={onToggleFavorite}
        onCardClick={onCardClick}
        operationsLoading={operationsLoading}
        userId={userId}
      />

      {showImporter && (
        <ProjectImporter
          onImport={(file) => {
            onImportProject(file);
            setShowImporter(false);
          }}
        />
      )}
    </div>
  );
};
