
import { useEffect, useState } from "react";
import PlannerSection from "./PlannerSection";
import EmptyState from "@/components/ui/EmptyState";
import { usePlanYarnAttachments } from "@/hooks/usePlanYarnAttachments";
import PlanYarnCard from "./PlanYarnCard";
import YarnSelectionDialog from "./YarnSelectionDialog";
import { supabase } from "@/integrations/supabase/client";
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
  } = usePlanYarnAttachments(plannerId, userId);

  const [yarnStash, setYarnStash] = useState<YarnStash[]>([]);
  const [showDialog, setShowDialog] = useState(false);

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
      {loading ? (
        <div className="text-sm text-gray-500 pl-4 py-8">Loading...</div>
      ) : yarns.length === 0 ? (
        <EmptyState>
          No yarn added yet. Click "Add Yarn" to attach from your stash.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
          {yarns.map((yarn) => (
            <PlanYarnCard key={yarn.id} yarn={yarn} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </PlannerSection>
  );
};

export default PlannerYarnSection;
