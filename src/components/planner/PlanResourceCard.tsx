
import { ExternalLink, Trash2, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlanResourceCardProps {
  title: string;
  url: string;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function PlanResourceCard({
  title,
  url,
  onDelete,
  onEdit,
}: PlanResourceCardProps) {
  return (
    <Card className="flex flex-row items-center justify-between px-4 py-3 gap-4">
      <div className="truncate font-medium flex-1 min-w-0">
        {title}
      </div>
      <div className="flex flex-row gap-1 items-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center text-primary hover:bg-accent rounded-md p-1 transition"
          title={url}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        {onEdit && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            aria-label="Edit resource"
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            aria-label="Delete resource"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
