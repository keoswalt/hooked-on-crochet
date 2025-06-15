
import type { Database } from "@/integrations/supabase/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProjectStatusChip } from "@/components/projects/ProjectStatusChip";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectPreviewCardProps {
  project: Project;
  selected: boolean;
  onSelect: () => void;
}

export default function ProjectPreviewCard({ project, selected, onSelect }: ProjectPreviewCardProps) {
  return (
    <Card
      className={`relative border transition-shadow hover:shadow-md cursor-pointer ${selected ? "ring-2 ring-primary border-primary" : "ring-0 border-gray-200 bg-white"}`}
      tabIndex={0}
      onClick={onSelect}
      aria-checked={selected}
      role="checkbox"
    >
      <CardHeader className="pb-2">
        <CardTitle className="truncate text-sm">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-4">
        <div className="w-full h-14 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center mb-2">
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
        {/* Removed hook and yarn details line */}
        <div className="flex justify-between w-full items-center">
          <ProjectStatusChip status={project.status} size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}
