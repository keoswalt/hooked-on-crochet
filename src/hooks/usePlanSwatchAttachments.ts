
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PlanSwatchAttachment = Database["public"]["Tables"]["plan_swatch_attachments"]["Row"];
type Swatch = Database["public"]["Tables"]["swatches"]["Row"];

export function usePlanSwatchAttachments(planId: string, userId: string) {
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all attached swatches (with details) for a plan
  const fetchSwatches = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("plan_swatch_attachments")
      .select("swatch_id, swatches(*)")
      .eq("plan_id", planId)
      .eq("user_id", userId);

    if (!error && data) {
      setSwatches(
        data
          .map((r: any) => r.swatches)
          .filter((swatch: Swatch | null) => !!swatch)
      );
    }
    setLoading(false);
  }, [planId, userId]);

  // Attach multiple swatches
  const attachSwatches = useCallback(async (swatchIds: string[]) => {
    if (swatchIds.length === 0) return;
    const inserts = swatchIds.map((swatch_id) => ({
      plan_id: planId,
      user_id: userId,
      swatch_id,
    }));
    await supabase.from("plan_swatch_attachments").insert(inserts);
    await fetchSwatches();
  }, [planId, userId, fetchSwatches]);

  // Remove one attachment
  const detachSwatch = useCallback(async (swatchId: string) => {
    await supabase
      .from("plan_swatch_attachments")
      .delete()
      .eq("plan_id", planId)
      .eq("swatch_id", swatchId)
      .eq("user_id", userId);
    await fetchSwatches();
  }, [planId, userId, fetchSwatches]);

  return {
    swatches,
    loading,
    fetchSwatches,
    attachSwatches,
    detachSwatch,
    setSwatches,
  };
}
