
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Download } from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export const ProjectHeader = ({ project, onBack, onEdit, onDelete, onExport }: ProjectHeaderProps) => {
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
          <div className="flex flex-col space-y-4">
            <div className="w-full">
              <CardTitle className="text-2xl mb-3">{project.name}</CardTitle>
              <div className="text-sm text-gray-600">
                Hook: {project.hook_size} • Yarn Weight: {project.yarn_weight}
              </div>
              {project.details && (
                <p className="text-gray-700 mt-2">{project.details}</p>
              )}
            </div>
            <div className="flex items-center gap-2 w-full">
              <Button variant="outline" onClick={onEdit} className="flex-1 sm:flex-none">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
              <Button variant="outline" onClick={onExport} className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <QRCodeGenerator project={project} />
              <Button variant="outline" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </>
  );
};
