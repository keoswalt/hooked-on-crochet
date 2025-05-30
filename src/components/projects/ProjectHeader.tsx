
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProjectInfo } from './ProjectInfo';
import { ProjectActions } from './ProjectActions';
import { ImageViewer } from '@/components/images/ImageViewer';
import { TagDisplay } from '@/components/tags/TagDisplay';
import { LinkifiedText } from '@/components/ui/linkified-text';
import { useImageOperations } from '@/hooks/useImageOperations';
import { useProjectTags } from '@/hooks/useProjectTags';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onExportPDF: () => void;
  onProjectUpdate?: (updatedProject: Project) => void;
  userId: string;
}

export const ProjectHeader = ({ 
  project, 
  onBack, 
  onEdit, 
  onDelete, 
  onExport, 
  onExportPDF, 
  onProjectUpdate,
  userId 
}: ProjectHeaderProps) => {
  const { deleteImage } = useImageOperations();
  const { toast } = useToast();
  const { projectTags, handleRemoveTag } = useProjectTags(project.id, userId);

  const handleDeleteFeaturedImage = async () => {
    if (project.featured_image_url) {
      console.log('Starting image deletion for project:', project.id);
      
      // First delete the image from storage
      const success = await deleteImage(project.featured_image_url);
      
      if (success) {
        console.log('Storage deletion successful, updating database...');
        
        // Then update the project in the database
        try {
          const { data, error } = await supabase
            .from('projects')
            .update({ featured_image_url: null })
            .eq('id', project.id)
            .eq('user_id', userId)
            .select()
            .single();

          if (error) {
            console.error('Database update error:', error);
            throw error;
          }

          console.log('Database update successful:', data);

          // Update the local state
          if (onProjectUpdate && data) {
            onProjectUpdate(data);
          }
        } catch (error: any) {
          console.error('Failed to update project in database:', error);
          toast({
            title: "Database Error",
            description: "Image was deleted from storage but failed to update project record.",
            variant: "destructive",
          });
        }
      } else {
        console.log('Storage deletion failed');
      }
    }
  };

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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <TagDisplay 
                    tags={projectTags} 
                    onRemoveTag={handleRemoveTag}
                    showRemoveButton={false}
                  />
                </div>
                
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
            </div>
            
            {project.featured_image_url && (
              <div className="w-full">
                <ImageViewer
                  imageUrl={project.featured_image_url}
                  alt={`${project.name} featured image`}
                  className="w-full h-64 rounded-lg"
                  onDelete={handleDeleteFeaturedImage}
                />
              </div>
            )}
            
            <ProjectActions
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
              onExport={onExport}
              onExportPDF={onExportPDF}
            />
          </div>
        </CardHeader>
      </Card>
    </>
  );
};
