
import { LinkifiedText } from '@/components/ui/linkified-text';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectInfoProps {
  project: Project;
}

export const ProjectInfo = ({ project }: ProjectInfoProps) => {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-3">{project.name}</h1>
      <div className="text-sm text-gray-600">
        Hook: {project.hook_size} • Yarn Weight: {project.yarn_weight}
      </div>
      {project.details && (
        <LinkifiedText 
          text={project.details} 
          className="text-gray-700 mt-2"
        />
      )}
    </div>
  );
};
