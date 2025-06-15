
import { Button } from "@/components/ui/button";

interface ProjectNotFoundScreenProps {
  onBack: () => void;
}

export const ProjectNotFoundScreen = ({ onBack }: ProjectNotFoundScreenProps) => (
  <div className="container mx-auto px-4 py-8 text-center">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
    <p className="text-gray-600 mb-6">
      The project you're looking for doesn't exist or you don't have access to it.
    </p>
    <Button onClick={onBack}>Back to Projects</Button>
  </div>
);

export default ProjectNotFoundScreen;
