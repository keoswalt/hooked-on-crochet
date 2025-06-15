
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SwatchFilters } from "../swatches/SwatchFilters";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import SwatchPreviewCard from "./SwatchPreviewCard";
import type { Database } from "@/integrations/supabase/types";

type Swatch = Database["public"]["Tables"]["swatches"]["Row"];

interface SwatchSelectionDialogProps {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  swatches: Swatch[];
  attachedSwatchIds: string[];
  onSave: (selectedSwatchIds: string[]) => void;
}

export default function SwatchSelectionDialog({
  open,
  onOpenChange,
  swatches,
  attachedSwatchIds,
  onSave,
}: SwatchSelectionDialogProps) {
  const [filteredSwatches, setFilteredSwatches] = useState<Swatch[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  // Exclude already attached
  const displayedSwatches = filteredSwatches.filter(s => !attachedSwatchIds.includes(s.id));

  const handleToggleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(sid => sid !== id) : [...sel, id]);
  };

  const handleSave = () => {
    if (selected.length === 0) {
      toast({ title: "No swatch selected", description: "Select at least one swatch.", variant: "destructive"});
      return;
    }
    onSave(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="bg-gray-50 sticky top-0 left-0 z-10 px-6 py-4 border-b border-gray-200">
          <DialogTitle>Select Swatch from Your Stash</DialogTitle>
        </DialogHeader>
        <div className="sticky top-20 z-10 bg-white px-6 pt-3 pb-2">
          <SwatchFilters
            swatches={swatches}
            onFilter={setFilteredSwatches}
            className=""
          />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {displayedSwatches.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No matching swatch in your stash</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedSwatches.map((swatch) => {
                const checked = selected.includes(swatch.id);
                return (
                  <SwatchPreviewCard
                    key={swatch.id}
                    swatch={swatch}
                    checked={checked}
                    onSelect={() => handleToggleSelect(swatch.id)}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => handleToggleSelect(swatch.id)}
                      aria-checked={checked}
                      aria-label={`Select swatch ${swatch.title}`}
                      className="absolute top-2 left-2 bg-white z-10 pointer-events-auto"
                      tabIndex={0}
                      onClick={e => e.stopPropagation()}
                    />
                  </SwatchPreviewCard>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-row justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={selected.length === 0}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
