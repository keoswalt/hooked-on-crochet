
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";

// Plan and plan_project_attachments types
type Plan = Database["public"]["Tables"]["plans"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type PlanAttachmentRow = {
  id: string;
  plan_id: string;
  user_id: string;
  project_id: string;
  attached_at: string;
  plan?: Plan;
  // Add featured image if possible
  plan_featured_image?: string | null;
};

function isImageObject(obj: any): obj is { image_url: string } {
  return obj && typeof obj === "object" && "image_url" in obj && typeof obj.image_url === "string";
}

export function useProjectPlanAttachments(projectId: string | null, user: User | null) {
  const [plans, setPlans] = useState<PlanAttachmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId || !user) {
      setPlans([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const fetch = async () => {
      const { data, error } = await supabase
        .from("plan_project_attachments" as any)
        .select("*, plan:plan_id(*)")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .order("attached_at");
      if (!error && Array.isArray(data)) {
        const planRows: PlanAttachmentRow[] = await Promise.all(
          data.map(async (row: any) => {
            let plan_featured_image: string | null = null;
            if (row.plan?.id) {
              // Get featured image from plan_images
              const { data: imgData, error: imgError } = await supabase
                .from("plan_images" as any)
                .select("image_url")
                .eq("plan_id", row.plan.id)
                .eq("is_featured", true)
                .limit(1)
                .maybeSingle();
              if (!imgError && isImageObject(imgData)) {
                plan_featured_image = imgData.image_url;
              } else {
                // fallback: just get first image
                const { data: firstImgData, error: firstImgError } = await supabase
                  .from("plan_images" as any)
                  .select("image_url")
                  .eq("plan_id", row.plan.id)
                  .order("uploaded_at")
                  .limit(1)
                  .maybeSingle();
                if (!firstImgError && isImageObject(firstImgData)) {
                  plan_featured_image = firstImgData.image_url;
                }
              }
            }
            return {
              ...row,
              plan_featured_image,
            };
          })
        );
        setPlans(planRows);
      } else {
        setPlans([]);
      }
      setLoading(false);
    };
    fetch();
  }, [projectId, user]);

  return { plans, loading };
}
