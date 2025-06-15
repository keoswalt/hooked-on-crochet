
import { useState } from "react";
import PlannerSection from "./PlannerSection";
import EmptyState from "@/components/ui/EmptyState";
import PlanProjectCard from "./PlanProjectCard";
import ProjectSelectionDialog from "./ProjectSelectionDialog";
import { usePlanProjectAttachments } from "@/hooks/usePlanProjectAttachments";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface PlannerProjectsSectionProps {
  plannerId: string;
  user: User;
}

export default function PlannerProjectsSection({ plannerId, user }: PlannerProjectsSectionProps) {
  const { attachments, loading, attachProjects, detachProject, refresh } = usePlanProjectAttachments(plannerId, user);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const handleAddProjects = async (projectIds: string[]) => {
    const result = await attachProjects(projectIds);
    if (!result) {
      toast({ title: "Success", description: "Projects attached to plan." });
      refresh();
    } else {
      toast({ title: "Error", description: "Could not attach projects.", variant: "destructive" });
    }
  };

  const handleRemove = async (projectId: string) => {
    await detachProject(projectId);
    toast({ title: "Removed", description: "Project removed from plan." });
    refresh();
  };

  return (
    <div className="mb-10">
      <PlannerSection
        title="Projects"
        buttonText="Add Projects"
        buttonDisabled={false}
        onAdd={() => setShowDialog(true)}
      >
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : attachments.length === 0 ? (
          <EmptyState>
            No projects attached to this plan yet. Attach one to get started.
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {attachments.map((att) => (
              <PlanProjectCard
                key={att.id}
                project={att.project!}
                onRemove={() => handleRemove(att.project_id)}
              />
            ))}
          </div>
        )}
      </PlannerSection>
      <ProjectSelectionDialog
        userId={user.id}
        open={showDialog}
        onOpenChange={setShowDialog}
        excludedProjectIds={attachments.map((a) => a.project_id)}
        onSelectProjects={handleAddProjects}
      />
    </div>
  );
}
