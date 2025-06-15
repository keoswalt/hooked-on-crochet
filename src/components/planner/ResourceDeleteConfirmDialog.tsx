
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface ResourceDeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function ResourceDeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: ResourceDeleteConfirmDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Delete Resource"
      description="Are you sure you want to delete this resource? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
    />
  );
}
