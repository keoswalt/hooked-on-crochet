
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  hook_size: string;
  yarn_weight: string;
  details?: string;
}

interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
}

export const ProjectHeader = ({ project, onBack }: ProjectHeaderProps) => {
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
          <CardTitle className="text-2xl">{project.name}</CardTitle>
          <div className="text-sm text-gray-600">
            Hook: {project.hook_size} • Yarn Weight: {project.yarn_weight}
          </div>
          {project.details && (
            <p className="text-gray-700 mt-2">{project.details}</p>
          )}
        </CardHeader>
      </Card>
    </>
  );
};
