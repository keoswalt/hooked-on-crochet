import { useEffect, useState } from "react";
import PlannerSection from "./PlannerSection";
import EmptyState from "@/components/ui/EmptyState";
import { usePlanYarnAttachments } from "@/hooks/usePlanYarnAttachments";
import PlanYarnCard from "./PlanYarnCard";
import YarnSelectionDialog from "./YarnSelectionDialog";
import { supabase } from "@/integrations/supabase/client";
import { YarnForm } from "@/components/stash/YarnForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";

type YarnStash = Database["public"]["Tables"]["yarn_stash"]["Row"];

interface PlannerYarnSectionProps {
  plannerId: string;
  userId: string;
}

const PlannerYarnSection = ({ plannerId, userId }: PlannerYarnSectionProps) => {
  const {
    yarns,
    loading,
    fetchYarns,
    attachYarns,
    detachYarn,
    setYarns,
  } = usePlanYarnAttachments(plannerId, userId);

  const [yarnStash, setYarnStash] = useState<YarnStash[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editYarn, setEditYarn] = useState<YarnStash | null>(null);
  const [editYarnOpen, setEditYarnOpen] = useState(false);

  // Fetch all user's stash
  useEffect(() => {
    async function fetchStash() {
      const { data, error } = await supabase
        .from("yarn_stash")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) setYarnStash(data);
    }
    if (userId) fetchStash();
  }, [userId]);

  // Fetch attached yarns on load and when dialog closes
  useEffect(() => {
    if (plannerId && userId) fetchYarns();
  }, [plannerId, userId, showDialog, fetchYarns]);

  const handleRemove = async (yarnId: string) => {
    await detachYarn(yarnId);
  };

  const handleAttach = async (yarnIds: string[]) => {
    await attachYarns(yarnIds);
  };

  const handleEdit = (yarn: YarnStash) => {
    setEditYarn(yarn);
    setEditYarnOpen(true);
  };

  const handleYarnEditSave = async () => {
    setEditYarnOpen(false);
    setEditYarn(null);
    // Refresh both user's stash and attached yarns (since either might change)
    if (userId) {
      const { data } = await supabase
        .from("yarn_stash")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setYarnStash(data || []);
    }
    fetchYarns();
  };

  const handleYarnEditCancel = () => {
    setEditYarnOpen(false);
    setEditYarn(null);
  };

  return (
    <PlannerSection
      title="Yarn"
      buttonText="Add Yarn"
      onAdd={() => setShowDialog(true)}
      buttonDisabled={false}
    >
      <YarnSelectionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        yarns={yarnStash}
        attachedYarnIds={yarns.map(y => y.id)}
        onSave={handleAttach}
      />
      {/* Yarn Edit Dialog */}
      {editYarn && (
        <Dialog open={editYarnOpen} onOpenChange={setEditYarnOpen}>
          <DialogContent className="max-w-xl flex flex-col p-0">
            <DialogHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <DialogTitle>Edit Yarn</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <YarnForm
                userId={userId}
                yarn={editYarn}
                onSave={handleYarnEditSave}
                onCancel={handleYarnEditCancel}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      {loading ? (
        <div className="text-sm text-gray-500 pl-4 py-8">Loading...</div>
      ) : yarns.length === 0 ? (
        <EmptyState>
          No yarn added yet. Click "Add Yarn" to attach from your stash.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
          {yarns.map((yarn) => (
            <PlanYarnCard key={yarn.id} yarn={yarn} onRemove={handleRemove} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </PlannerSection>
  );
};

export default PlannerYarnSection;
