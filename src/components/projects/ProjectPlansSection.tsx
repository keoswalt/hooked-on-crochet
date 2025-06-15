
import { useProjectPlanAttachments } from "@/hooks/useProjectPlanAttachments";
import { ProjectPlanCard } from "@/components/planner/ProjectPlanCard";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectPlansSectionProps {
  project: Project;
  user: User;
  currentPage?: { label: string; path: string };
}

export function ProjectPlansSection({
  project,
  user,
  currentPage,
}: ProjectPlansSectionProps) {
  const { plans, loading } = useProjectPlanAttachments(project.id, user);

  if (loading || !plans.length) return null;

  return (
    <div className="mb-2">
      <h3 className="mb-2 text-base font-semibold text-muted-foreground">
        Attached to Plan{plans.length > 1 ? "s" : ""}
      </h3>
      <div className="flex flex-wrap gap-4">
        {plans.map((attachment) =>
          attachment?.plan ? (
            <ProjectPlanCard
              key={attachment.id}
              planId={attachment.plan.id}
              planName={attachment.plan.name}
              imageUrl={attachment.plan_featured_image}
              currentPage={currentPage}
            />
          ) : null
        )}
      </div>
    </div>
  );
}
