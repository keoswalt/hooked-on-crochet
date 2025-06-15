
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Edit, Trash2, Copy, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PatternStatusChip } from './PatternStatusChip';
import { TagDisplay } from '@/components/tags/TagDisplay';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import type { Database } from '@/integrations/supabase/types';

type Pattern = Database['public']['Tables']['patterns']['Row'];

interface PatternCardProps {
  pattern: Pattern;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onClick: () => void;
  onTagsUpdate: () => void;
  userId: string;
}

export const PatternCard = ({
  pattern,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onClick,
  onTagsUpdate,
  userId,
}: PatternCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  const handleCardClick = () => {
    onClick();
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="p-4" onClick={handleCardClick}>
          {pattern.featured_image_url && (
            <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 overflow-hidden">
              <img
                src={pattern.featured_image_url}
                alt={pattern.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg truncate flex-1">{pattern.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="ml-2 text-gray-400 hover:text-red-500 p-1"
            >
              <Heart className={`h-4 w-4 ${pattern.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0" onClick={handleCardClick}>
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                Hook: {pattern.hook_size}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Yarn: {pattern.yarn_weight}
              </Badge>
            </div>

            <PatternStatusChip status={pattern.status} />

            <TagDisplay
              entityId={pattern.id}
              entityType="pattern"
              userId={userId}
              onTagsUpdate={onTagsUpdate}
              readonly={true}
            />

            {pattern.details && (
              <p className="text-sm text-gray-600 line-clamp-2">{pattern.details}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex w-full gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Pattern"
        description={`Are you sure you want to delete "${pattern.name}"? This action cannot be undone.`}
      />
    </>
  );
};
