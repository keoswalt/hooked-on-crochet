
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
}

export const ProjectHeader = ({ project, onBack, onEdit }: ProjectHeaderProps) => {
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
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <div className="text-sm text-gray-600">
                Hook: {project.hook_size} • Yarn Weight: {project.yarn_weight}
              </div>
              {project.details && (
                <p className="text-gray-700 mt-2">{project.details}</p>
              )}
            </div>
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </div>
        </CardHeader>
      </Card>
    </>
  );
};
