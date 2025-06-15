
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PlanYarnAttachment = Database["public"]["Tables"]["plan_yarn_attachments"]["Row"];
type YarnStash = Database["public"]["Tables"]["yarn_stash"]["Row"];

export function usePlanYarnAttachments(planId: string, userId: string) {
  const [yarns, setYarns] = useState<YarnStash[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all attached yarns (with details) for a plan
  const fetchYarns = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("plan_yarn_attachments")
      .select("yarn_id, yarn_stash(*)")
      .eq("plan_id", planId)
      .eq("user_id", userId);

    if (!error && data) {
      setYarns(
        data
          .map((r: any) => r.yarn_stash)
          .filter((yarn: YarnStash | null) => !!yarn)
      );
    }
    setLoading(false);
  }, [planId, userId]);

  // Attach multiple yarns
  const attachYarns = useCallback(async (yarnIds: string[]) => {
    if (yarnIds.length === 0) return;
    const inserts = yarnIds.map((yarn_id) => ({
      plan_id: planId,
      user_id: userId,
      yarn_id,
    }));
    await supabase.from("plan_yarn_attachments").insert(inserts);
    await fetchYarns();
  }, [planId, userId, fetchYarns]);

  // Remove one attachment
  const detachYarn = useCallback(async (yarnId: string) => {
    await supabase
      .from("plan_yarn_attachments")
      .delete()
      .eq("plan_id", planId)
      .eq("yarn_id", yarnId)
      .eq("user_id", userId);
    await fetchYarns();
  }, [planId, userId, fetchYarns]);

  return {
    yarns,
    loading,
    fetchYarns,
    attachYarns,
    detachYarn,
    setYarns,
  };
}
