
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { ProjectInfo } from './ProjectInfo';
import { ProjectActions } from './ProjectActions';
import { ImageViewer } from '@/components/images/ImageViewer';
import { TagDisplay } from '@/components/tags/TagDisplay';
import { TagManager } from '@/components/tags/TagManager';
import { useImageOperations } from '@/hooks/useImageOperations';
import { useProjectTags } from '@/hooks/useProjectTags';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
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
  const [showTagManager, setShowTagManager] = useState(false);
  const { deleteImage } = useImageOperations();
  const { toast } = useToast();
  const { projectTags, handleRemoveTag, refreshTags } = useProjectTags(project.id, userId);

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
                <ProjectInfo project={project} />
                
                {/* Tags Section */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <TagDisplay 
                      tags={projectTags} 
                      onRemoveTag={handleRemoveTag}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTagManager(true)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Tag
                    </Button>
                  </div>
                  
                  {showTagManager && (
                    <TagManager
                      userId={userId}
                      projectId={project.id}
                      projectTags={projectTags}
                      onTagsChange={refreshTags}
                      isOpen={showTagManager}
                      onOpenChange={setShowTagManager}
                    />
                  )}
                </div>
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
