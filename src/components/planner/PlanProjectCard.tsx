
import { useState } from "react";
import { ProjectStatusChip } from "@/components/projects/ProjectStatusChip";
import { getYarnWeightLabel } from "@/utils/yarnWeights";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { useNavigationContext } from "@/context/NavigationContext";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
type Project = Database["public"]["Tables"]["projects"]["Row"];
interface PlanProjectCardProps {
  project: Project;
  onRemove: () => void;
  planName?: string;
  plannerId?: string;
}
export default function PlanProjectCard({
  project,
  onRemove,
  planName,
  plannerId
}: PlanProjectCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const { setPreviousPage } = useNavigationContext();

  const handleCardClick = () => {
    if (planName && plannerId) {
      setPreviousPage({
        label: planName,
        path: `/planner/${plannerId}`
      });
    }
    navigate(`/projects/${project.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      tabIndex={0}
      aria-label={project.name}
      className="hover:shadow-lg transition-shadow h-60 flex flex-col relative cursor-pointer pb-2"
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 z-10"
        onClick={e => {
          e.stopPropagation();
          setShowConfirm(true);
        }}
        title="Remove project from plan"
      >
        <Trash className="w-4 h-4" />
      </Button>
      {/* PATCH: Prevent card navigation when Cancel/Close clicked in dialog */}
      <ConfirmationDialog
        open={showConfirm}
        onOpenChange={(open) => setShowConfirm(open)}
        onConfirm={() => {
          setShowConfirm(false);
          onRemove();
        }}
        title="Remove Project?"
        description="Are you sure you want to remove this project from the plan? This will only detach it from this plan, not delete the project itself."
        confirmText="Remove"
        cancelText="Cancel"
        // Forward a synthetic onCancel that stops event propagation
        // NOTE: ConfirmationDialog does not natively accept an onCancel, so handle via onOpenChange on AlertDialogCancel below.
        renderCancelButton={(props) => (
          <button
            {...props}
            onClick={e => {
              e.stopPropagation();
              if (props.onClick) props.onClick(e);
              setShowConfirm(false);
            }}
          >
            Cancel
          </button>
        )}
      />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold line-clamp-2">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center px-4 py-3">
        <div className="w-full h-20 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center mb-2">
          {project.featured_image_url ? (
            <img
              src={project.featured_image_url}
              alt={`${project.name} featured`}
              className="w-full h-full object-cover object-top"
              draggable={false}
            />
          ) : (
            <div className="text-gray-400 text-xs">No image</div>
          )}
        </div>
        <CardDescription className="w-full text-xs text-gray-600 mb-1">
          Hook: {project.hook_size} &nbsp;•&nbsp; Yarn: {getYarnWeightLabel(project.yarn_weight)}
        </CardDescription>
        <div className="flex justify-between w-full items-center">
          <ProjectStatusChip status={project.status} size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}
