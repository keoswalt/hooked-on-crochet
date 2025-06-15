
import { useState } from "react";
import { Button } from "@/components/ui/button";
import YarnDisplayCard from "@/components/shared/YarnDisplayCard";
import { Trash2, Edit } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { Database } from "@/integrations/supabase/types";

type YarnStash = Database["public"]["Tables"]["yarn_stash"]["Row"];

interface PlanYarnCardProps {
  yarn: YarnStash;
  onRemove: (yarnId: string) => void;
  onEdit: (yarn: YarnStash) => void;
}
export default function PlanYarnCard({
  yarn,
  onRemove,
  onEdit
}: PlanYarnCardProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  return (
    <div className="relative">
      <YarnDisplayCard
        yarn={yarn}
        onEdit={onEdit}
        onDelete={() => setShowRemoveConfirm(true)}
      />
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
