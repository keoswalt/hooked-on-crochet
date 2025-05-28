
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Star, Copy } from 'lucide-react';
import { formatLastModified } from '@/utils/dateUtils';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectCardProps {
  project: Project;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

export const ProjectCard = ({ project, onEdit, onDelete, onDuplicate, onToggleFavorite }: ProjectCardProps) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(project.id, !project.is_favorite);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-48 flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={handleFavoriteClick} className="flex-shrink-0">
                <Star 
                  className={`h-4 w-4 ${project.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} 
                />
              </button>
              <CardTitle className="text-lg truncate flex-1">{project.name}</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Hook: {project.hook_size} • Yarn Weight: {project.yarn_weight}
            </CardDescription>
            <CardDescription className="text-xs text-gray-500 mt-1">
              Last modified: {formatLastModified(project.updated_at)}
            </CardDescription>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDuplicate}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(project.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {project.details && (
        <CardContent className="flex-1 overflow-hidden pt-0">
          <p className="text-sm text-gray-600 line-clamp-3 overflow-hidden text-ellipsis">{project.details}</p>
        </CardContent>
      )}
    </Card>
  );
};
