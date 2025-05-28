
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectCardProps {
  project: Project;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <CardDescription>
              Hook: {project.hook_size} • Yarn Weight: {project.yarn_weight}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
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
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-3">{project.details}</p>
        </CardContent>
      )}
    </Card>
  );
};
