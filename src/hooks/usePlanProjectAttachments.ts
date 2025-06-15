
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type PlanProjectAttachmentRow = {
  id: string;
  plan_id: string;
  project_id: string;
  user_id: string;
  attached_at: string;
  // The expanded project info (if present in query)
  project?: Project;
};

export function usePlanProjectAttachments(planId: string | null, user: User | null) {
  const [attachments, setAttachments] = useState<PlanProjectAttachmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planId || !user) return;
    setLoading(true);
    const fetch = async () => {
      const { data, error } = await supabase
        .from("plan_project_attachments")
        .select("*, project:project_id(*)")
        .eq("plan_id", planId)
        .eq("user_id", user.id)
        .order("attached_at");
      if (!error && data) {
        setAttachments(data as any);
      }
      setLoading(false);
    };
    fetch();
  }, [planId, user]);

  // Attach projects (by project IDs)
  const attachProjects = async (projectIds: string[]) => {
    if (!planId || !user || projectIds.length === 0) return;
    // Insert rows for each project, using only required fields
    const { error } = await supabase
      .from("plan_project_attachments")
      .insert(
        projectIds.map((project_id) => ({
          plan_id: planId,
          project_id,
          user_id: user.id,
        }))
      );
    return error;
  };

  // Remove
  const detachProject = async (projectId: string) => {
    if (!planId || !user) return;
    await supabase
      .from("plan_project_attachments")
      .delete()
      .eq("plan_id", planId)
      .eq("project_id", projectId)
      .eq("user_id", user.id);
  };

  return {
    attachments,
    loading,
    attachProjects,
    detachProject,
    refresh: () => {
      if (!planId || !user) return;
      setLoading(true);
      supabase
        .from("plan_project_attachments")
        .select("*, project:project_id(*)")
        .eq("plan_id", planId)
        .eq("user_id", user.id)
        .order("attached_at")
        .then(({ data, error }) => {
          if (!error && data) setAttachments(data as any);
          setLoading(false);
        });
    },
  };
}
