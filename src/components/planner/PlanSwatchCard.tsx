
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type Swatch = Database["public"]["Tables"]["swatches"]["Row"];

interface PlanSwatchCardProps {
  swatch: Swatch;
  onRemove: (swatchId: string) => void;
  onEdit: (swatch: Swatch) => void;
}

export default function PlanSwatchCard({
  swatch,
  onRemove,
  onEdit,
}: PlanSwatchCardProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  return (
    <div className="relative">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold line-clamp-2">{swatch.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {swatch.hook_size && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Hook:</span> {swatch.hook_size}
            </p>
          )}
          {swatch.yarn_used && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Yarn:</span> {swatch.yarn_used}
            </p>
          )}
          {(swatch.stitches_per_inch || swatch.rows_per_inch) && (
            <div className="flex flex-col gap-1 text-xs text-gray-700">
              <span className="font-medium">Gauge:</span>
              {swatch.stitches_per_inch && (<span>{swatch.stitches_per_inch} st/in</span>)}
              {swatch.rows_per_inch && (<span>{swatch.rows_per_inch} rows/in</span>)}
            </div>
          )}
        </CardContent>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowRemoveConfirm(true)}
          title="Remove from plan"
          className="absolute top-2 right-2"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-12"
          onClick={() => onEdit(swatch)}
          title="Edit swatch"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </Card>
      <ConfirmationDialog
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
        title="Remove Swatch From Plan?"
        description={`Remove "${swatch.title}" from this plan? This won't delete the swatch from your stash.`}
        onConfirm={() => onRemove(swatch.id)}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
}
