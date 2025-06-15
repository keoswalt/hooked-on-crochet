
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { YarnForm } from "@/components/stash/YarnForm";
import { SwatchForm } from "@/components/swatches/SwatchForm";
import type { YarnStash, Swatch } from "@/pages/PlannerPage";

// Handles dialogs for Yarn/Swatch for PlannerPage
interface PlannerRelatedOverviewProps {
  showNewYarnDialog: boolean;
  setShowNewYarnDialog: (val: boolean) => void;
  showNewSwatchDialog: boolean;
  setShowNewSwatchDialog: (val: boolean) => void;
  editingYarn: YarnStash | null;
  setEditingYarn: (yarn: YarnStash | null) => void;
  editingSwatch: Swatch | null;
  setEditingSwatch: (swatch: Swatch | null) => void;
  userId: string;
  handleNewYarnSaved: () => void;
  handleYarnSaved: () => void;
  handleNewSwatchSaved: () => void;
  handleSwatchSaved: () => void;
}

export function PlannerRelatedOverview({
  showNewYarnDialog,
  setShowNewYarnDialog,
  showNewSwatchDialog,
  setShowNewSwatchDialog,
  editingYarn,
  setEditingYarn,
  editingSwatch,
  setEditingSwatch,
  userId,
  handleNewYarnSaved,
  handleYarnSaved,
  handleNewSwatchSaved,
  handleSwatchSaved,
}: PlannerRelatedOverviewProps) {
  return (
    <>
      {/* New Yarn Dialog */}
      <Dialog open={showNewYarnDialog} onOpenChange={setShowNewYarnDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Yarn</DialogTitle>
          </DialogHeader>
          <YarnForm
            userId={userId}
            onSave={handleNewYarnSaved}
            onCancel={() => setShowNewYarnDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* New Swatch Dialog */}
      <Dialog open={showNewSwatchDialog} onOpenChange={setShowNewSwatchDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Swatch</DialogTitle>
          </DialogHeader>
          <SwatchForm
            userId={userId}
            onSave={handleNewSwatchSaved}
            onCancel={() => setShowNewSwatchDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Yarn Dialog */}
      <Dialog open={!!editingYarn} onOpenChange={() => setEditingYarn(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Yarn</DialogTitle>
          </DialogHeader>
          {editingYarn && (
            <YarnForm
              userId={userId}
              yarn={editingYarn}
              onSave={handleYarnSaved}
              onCancel={() => setEditingYarn(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Swatch Dialog */}
      <Dialog open={!!editingSwatch} onOpenChange={() => setEditingSwatch(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Swatch</DialogTitle>
          </DialogHeader>
          {editingSwatch && (
            <SwatchForm
              userId={userId}
              swatch={editingSwatch}
              onSave={handleSwatchSaved}
              onCancel={() => setEditingSwatch(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

