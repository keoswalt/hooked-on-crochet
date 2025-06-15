
import { ConfirmationDialog } from './confirmation-dialog';

interface CustomConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const CustomConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Mark Row as Incomplete?",
  description = "Marking this row as incomplete will also mark all subsequent rows as incomplete and reset their progress. Are you sure you want to continue?",
}: CustomConfirmationDialogProps) => {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onConfirm={onConfirm}
      confirmText="Yes, mark incomplete"
      cancelText="Cancel"
    />
  );
};
