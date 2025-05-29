import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Download, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { QRCodeGenerator } from './QRCodeGenerator';
import { ImageViewer } from '@/components/images/ImageViewer';
import { useImageOperations } from '@/hooks/useImageOperations';
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
            .eq('user_id', userId) // Add user_id check for RLS
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

          // Don't show toast here since useImageOperations already shows one
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
            <div className="w-full">
              <CardTitle className="text-2xl mb-3">{project.name}</CardTitle>
              <div className="text-sm text-gray-600">
                Hook: {project.hook_size} • Yarn Weight: {project.yarn_weight}
              </div>
              {project.details && (
                <p className="text-gray-700 mt-2">{project.details}</p>
              )}
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
            
            <div className="flex items-center gap-2 w-full flex-wrap">
              <Button variant="outline" onClick={onEdit} className="flex-1 sm:flex-none">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Pattern File (.crochet)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExportPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
