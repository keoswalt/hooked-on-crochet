
import { Card, CardHeader } from '@/components/ui/card';
import { ProjectActions } from './ProjectActions';
import { ProjectStatusChip } from './ProjectStatusChip';
import { ImageViewer } from '@/components/images/ImageViewer';
import { TagDisplay } from '@/components/tags/TagDisplay';
import { LinkifiedText } from '@/components/ui/linkified-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useImageOperations } from '@/hooks/useImageOperations';
import { useProjectTags } from '@/hooks/useProjectTags';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getYarnWeightLabel } from '@/utils/yarnWeights';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectStatus = Database['public']['Enums']['project_status'];

interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onExportPDF: () => void;
  onDuplicate: () => void;
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
  onDuplicate,
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

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', project.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Status update error:', error);
        throw error;
      }

      console.log('Status update successful:', data);

      // Update the local state
      if (onProjectUpdate && data) {
        onProjectUpdate(data);
      }

      toast({
        title: "Status Updated",
        description: `Project status changed to ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Failed to update project status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update project status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        {/* Responsive horizontal layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Featured Image Section */}
          {project.featured_image_url && (
            <div className="w-full md:w-64 flex-shrink-0 flex items-start justify-center">
              <AspectRatio
                ratio={1 / 1}
                className="w-full md:max-w-[256px]">
                <ImageViewer
                  imageUrl={project.featured_image_url}
                  alt={`${project.name} featured image`}
                  className="w-full h-full rounded-lg"
                  onDelete={handleDeleteFeaturedImage}
                />
              </AspectRatio>
            </div>
          )}
          {/* Details Section */}
          <div className="flex-1 flex flex-col space-y-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <TagDisplay 
                  tags={projectTags} 
                  onRemoveTag={handleRemoveTag}
                  showRemoveButton={false}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>Hook: {project.hook_size}</span>
                <span>•</span>
                <span>Yarn Weight: {getYarnWeightLabel(project.yarn_weight)}</span>
              </div>
              {project.details && (
                <LinkifiedText 
                  text={project.details} 
                  className="text-gray-700 mt-2"
                />
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <Select value={project.status || ''} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Making">Making</SelectItem>
                    <SelectItem value="Made">Made</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ProjectActions
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
              onExport={onExport}
              onExportPDF={onExportPDF}
              onDuplicate={onDuplicate}
            />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
