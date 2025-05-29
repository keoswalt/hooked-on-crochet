
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Star, Copy } from 'lucide-react';
import { formatLastModified } from '@/utils/dateUtils';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectCardProps {
  project: Project;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onCardClick: () => void;
}

export const ProjectCard = ({ project, onEdit, onDelete, onDuplicate, onToggleFavorite, onCardClick }: ProjectCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(project.id, !project.is_favorite);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(project.id);
    setShowDeleteDialog(false);
  };

  const handleCardClick = () => {
    onCardClick();
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow h-64 flex flex-col cursor-pointer" onClick={handleCardClick}>
        <CardHeader className="p-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={handleFavoriteClick} className="flex-shrink-0">
              <Star 
                className={`h-4 w-4 ${project.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} 
              />
            </button>
            <CardTitle className="text-lg truncate flex-1">{project.name}</CardTitle>
          </div>

          <CardDescription className="text-xs w-full">
            Hook: {project.hook_size} • Yarn Weight: {project.yarn_weight}
          </CardDescription>
          
          <CardDescription className="text-xs text-gray-500 w-full">
            Last modified: {formatLastModified(project.updated_at)}
          </CardDescription>
        </CardHeader>
        
        {project.details && (
          <CardContent className="flex-1 overflow-hidden p-4 pt-0">
            <p className="text-sm text-gray-600 line-clamp-3 overflow-hidden text-ellipsis">{project.details}</p>
          </CardContent>
        )}

        <div className="bg-gray-800 p-3 rounded-b-lg mt-auto">
          <div className="flex justify-end space-x-1">
            <Button variant="outline" size="sm" onClick={onEdit} className="bg-white hover:bg-gray-100">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDuplicate} className="bg-white hover:bg-gray-100">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteClick} className="bg-white hover:bg-gray-100">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};
