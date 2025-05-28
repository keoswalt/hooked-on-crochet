
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatLastModified } from '@/utils/dateUtils';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectCardProps {
  project: Project;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow h-48 flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{project.name}</CardTitle>
            <CardDescription className="text-xs">
              Hook: {project.hook_size} • Yarn Weight: {project.yarn_weight}
            </CardDescription>
            <CardDescription className="text-xs text-gray-500 mt-1">
              Last modified: {formatLastModified(project.updated_at)}
            </CardDescription>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(project.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {project.details && (
        <CardContent className="flex-1 overflow-hidden">
          <p className="text-sm text-gray-600 line-clamp-3 overflow-hidden">{project.details}</p>
        </CardContent>
      )}
    </Card>
  );
};
