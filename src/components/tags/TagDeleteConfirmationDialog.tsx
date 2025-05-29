
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

interface TagDeleteConfirmationDialogProps {
  tag: (Tag & { usageCount?: number }) | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const TagDeleteConfirmationDialog = ({
  tag,
  onConfirm,
  onCancel,
}: TagDeleteConfirmationDialogProps) => {
  return (
    <AlertDialog open={!!tag} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Tag</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the tag "{tag?.name}"?
            {tag?.usageCount ? (
              <span className="block mt-2 text-orange-600">
                This tag is currently used in {tag.usageCount} project{tag.usageCount !== 1 ? 's' : ''}. 
                Deleting it will remove it from all projects.
              </span>
            ) : (
              <span className="block mt-2">
                This action cannot be undone.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Delete Tag
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
