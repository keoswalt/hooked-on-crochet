
import { useMemo } from 'react';
import { ProjectSearch } from './ProjectSearch';
import { ProjectGrid } from './ProjectGrid';
import { ProjectImporter } from './ProjectImporter';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTagOperations } from '@/hooks/useTagOperations';
import { useEffect, useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

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
  const [projectTags, setProjectTags] = useState<Record<string, Tag[]>>({});
  const [tagsRefreshTrigger, setTagsRefreshTrigger] = useState(0);
  const { fetchProjectTags } = useTagOperations(userId);

  // Load tags for all projects
  useEffect(() => {
    const loadAllProjectTags = async () => {
      const tagsMap: Record<string, Tag[]> = {};
      
      for (const project of projects) {
        const tags = await fetchProjectTags(project.id);
        tagsMap[project.id] = tags;
      }
      
      setProjectTags(tagsMap);
    };

    if (projects.length > 0) {
      loadAllProjectTags();
    }
  }, [projects, fetchProjectTags, tagsRefreshTrigger]);

  // Filter projects based on search term (projects are already sorted by database)
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) {
      return projects;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return projects.filter(project => {
      // Search in project name
      const nameMatch = project.name.toLowerCase().includes(lowercaseSearch);
      
      // Search in project tags
      const tags = projectTags[project.id] || [];
      const tagMatch = tags.some(tag => 
        tag.name.toLowerCase().includes(lowercaseSearch)
      );
      
      return nameMatch || tagMatch;
    });
  }, [projects, searchTerm, projectTags]);

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleTagsUpdate = () => {
    console.log('handleTagsUpdate called in ProjectListView');
    setTagsRefreshTrigger(prev => prev + 1);
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
        onTagsUpdate={handleTagsUpdate}
        userId={userId}
      />
    </div>
  );
};
