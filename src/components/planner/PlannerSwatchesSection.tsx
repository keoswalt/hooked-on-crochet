
import { useEffect, useState } from "react";
import PlannerSection from "./PlannerSection";
import EmptyState from "@/components/ui/EmptyState";
import { usePlanSwatchAttachments } from "@/hooks/usePlanSwatchAttachments";
import PlanSwatchCard from "./PlanSwatchCard";
import SwatchSelectionDialog from "./SwatchSelectionDialog";
import { supabase } from "@/integrations/supabase/client";
import { SwatchForm } from "@/components/swatches/SwatchForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";

type Swatch = Database["public"]["Tables"]["swatches"]["Row"];

interface PlannerSwatchesSectionProps {
  plannerId: string;
  userId: string;
}

const PlannerSwatchesSection = ({ plannerId, userId }: PlannerSwatchesSectionProps) => {
  const {
    swatches,
    loading,
    fetchSwatches,
    attachSwatches,
    detachSwatch,
    setSwatches,
  } = usePlanSwatchAttachments(plannerId, userId);

  const [swatchStash, setSwatchStash] = useState<Swatch[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editSwatch, setEditSwatch] = useState<Swatch | null>(null);
  const [editSwatchOpen, setEditSwatchOpen] = useState(false);

  // Fetch all user's stash
  useEffect(() => {
    async function fetchStash() {
      const { data, error } = await supabase
        .from("swatches")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) setSwatchStash(data);
    }
    if (userId) fetchStash();
  }, [userId]);

  // Fetch attached swatches on load and when dialog closes
  useEffect(() => {
    if (plannerId && userId) fetchSwatches();
  }, [plannerId, userId, showDialog, fetchSwatches]);

  const handleRemove = async (swatchId: string) => {
    await detachSwatch(swatchId);
  };

  const handleAttach = async (swatchIds: string[]) => {
    await attachSwatches(swatchIds);
  };

  const handleEdit = (swatch: Swatch) => {
    setEditSwatch(swatch);
    setEditSwatchOpen(true);
  };

  const handleSwatchEditSave = async () => {
    setEditSwatchOpen(false);
    setEditSwatch(null);
    // Refresh both user's stash and attached swatches (since either might change)
    if (userId) {
      const { data } = await supabase
        .from("swatches")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setSwatchStash(data || []);
    }
    fetchSwatches();
  };

  const handleSwatchEditCancel = () => {
    setEditSwatchOpen(false);
    setEditSwatch(null);
  };

  return (
    <PlannerSection
      title="Swatches"
      buttonText="Add Swatch"
      onAdd={() => setShowDialog(true)}
      buttonDisabled={false}
    >
      <SwatchSelectionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        swatches={swatchStash}
        attachedSwatchIds={swatches.map(s => s.id)}
        onSave={handleAttach}
      />
      {/* Swatch Edit Dialog */}
      {editSwatch && (
        <Dialog open={editSwatchOpen} onOpenChange={setEditSwatchOpen}>
          <DialogContent className="max-w-xl flex flex-col p-0">
            <DialogHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <DialogTitle>Edit Swatch</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <SwatchForm
                userId={userId}
                swatch={editSwatch}
                onSave={handleSwatchEditSave}
                onCancel={handleSwatchEditCancel}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      {loading ? (
        <div className="text-sm text-gray-500 pl-4 py-8">Loading...</div>
      ) : swatches.length === 0 ? (
        <EmptyState>
          No swatches added yet. Click "Add Swatch" to attach from your stash.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
          {swatches.map((swatch) => (
            <PlanSwatchCard key={swatch.id} swatch={swatch} onRemove={handleRemove} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </PlannerSection>
  );
};

export default PlannerSwatchesSection;
