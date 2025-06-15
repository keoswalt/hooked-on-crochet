
import { ConfirmationDialog } from './confirmation-dialog';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete Project",
  description = "Are you sure you want to delete this project? This action cannot be undone and will permanently delete all rows and data associated with this project."
}: DeleteConfirmationDialogProps) => {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onConfirm={onConfirm}
      confirmText="Delete Plan"
      cancelText="Cancel"
    />
  );
};
