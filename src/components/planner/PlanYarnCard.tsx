
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { YarnCard } from "@/components/stash/YarnCard";
import { Trash2, Edit } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type YarnStash = Database["public"]["Tables"]["yarn_stash"]["Row"];

interface PlanYarnCardProps {
  yarn: YarnStash;
  onRemove: (yarnId: string) => void;
  onEdit: (yarn: YarnStash) => void;
}

export default function PlanYarnCard({ yarn, onRemove, onEdit }: PlanYarnCardProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  return (
    <div className="relative">
      {/* YarnCard now receives no edit/delete props, so no duplicate buttons */}
      <YarnCard yarn={yarn} />
      <Button
        size="icon"
        variant="destructive"
        className="absolute top-2 right-2"
        onClick={() => setShowRemoveConfirm(true)}
        title="Remove from plan"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-12"
        onClick={() => onEdit(yarn)}
        title="Edit yarn"
      >
        <Edit className="w-4 h-4" />
      </Button>
      <ConfirmationDialog
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
        title="Remove Yarn From Plan?"
        description={`Remove "${yarn.name}" from this plan? This won't delete the yarn from your stash.`}
        onConfirm={() => onRemove(yarn.id)}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
}

