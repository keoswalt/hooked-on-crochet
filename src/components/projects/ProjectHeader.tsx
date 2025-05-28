
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProjectHeader = ({ project, onBack, onEdit, onDelete }: ProjectHeaderProps) => {
  return (
    <>
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="w-full">
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <div className="text-sm text-gray-600 mt-2">
                Hook: {project.hook_size} • Yarn Weight: {project.yarn_weight}
              </div>
              {project.details && (
                <p className="text-gray-700 mt-2">{project.details}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <Button variant="outline" onClick={onEdit} className="w-full sm:w-auto">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
              <Button variant="outline" onClick={onDelete} className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </>
  );
};
