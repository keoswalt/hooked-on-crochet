import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { YarnFilters } from "@/components/stash/YarnFilters";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import YarnPreviewCard from "./YarnPreviewCard";
import type { Database } from "@/integrations/supabase/types";

type YarnStash = Database["public"]["Tables"]["yarn_stash"]["Row"];

interface YarnSelectionDialogProps {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  yarns: YarnStash[];
  attachedYarnIds: string[];
  onSave: (selectedYarnIds: string[]) => void;
}

export default function YarnSelectionDialog({
  open,
  onOpenChange,
  yarns,
  attachedYarnIds,
  onSave,
}: YarnSelectionDialogProps) {
  const [filteredYarns, setFilteredYarns] = useState<YarnStash[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  // Exclude already attached
  const displayedYarns = filteredYarns.filter(y => !attachedYarnIds.includes(y.id));

  const handleToggleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(sid => sid !== id) : [...sel, id]);
  };

  const handleSave = () => {
    if (selected.length === 0) {
      toast({ title: "No yarn selected", description: "Select at least one yarn.", variant: "destructive"});
      return;
    }
    onSave(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="bg-gray-50 sticky top-0 left-0 z-10 px-6 py-4 border-b border-gray-200">
          <DialogTitle>Select Yarn from Your Stash</DialogTitle>
        </DialogHeader>
        <div className="sticky top-20 z-10 bg-white px-6 pt-3 pb-2">
          <YarnFilters
            yarns={yarns}
            onFilter={setFilteredYarns}
            className=""
          />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {displayedYarns.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No matching yarn in your stash</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedYarns.map((yarn) => {
                const checked = selected.includes(yarn.id);
                return (
                  <YarnPreviewCard
                    key={yarn.id}
                    yarn={yarn}
                    checked={checked}
                    onSelect={() => handleToggleSelect(yarn.id)}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => handleToggleSelect(yarn.id)}
                      aria-checked={checked}
                      aria-label={`Select yarn ${yarn.name}`}
                      className="absolute top-2 left-2 bg-white z-10"
                      tabIndex={0}
                    />
                  </YarnPreviewCard>
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
