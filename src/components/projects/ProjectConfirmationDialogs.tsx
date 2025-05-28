
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { CustomConfirmationDialog } from '@/components/ui/custom-confirmation-dialog';

interface ConfirmDialog {
  open: boolean;
  onConfirm: () => void;
}

interface ProjectConfirmationDialogsProps {
  confirmDialog: ConfirmDialog;
  showDeleteDialog: boolean;
  onConfirmDialogChange: (dialog: ConfirmDialog) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export const ProjectConfirmationDialogs = ({
  confirmDialog,
  showDeleteDialog,
  onConfirmDialogChange,
  onDeleteDialogChange,
  onConfirmDelete
}: ProjectConfirmationDialogsProps) => {
  return (
    <>
      <CustomConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => onConfirmDialogChange({ ...confirmDialog, open })}
        onConfirm={confirmDialog.onConfirm}
      />

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={onDeleteDialogChange}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone and will remove all rows and progress data."
        onConfirm={onConfirmDelete}
        confirmText="Delete Project"
        cancelText="Cancel"
      />
    </>
  );
};
