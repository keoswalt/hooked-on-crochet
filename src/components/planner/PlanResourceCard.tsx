
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlanResourceCardProps {
  title: string;
  url: string;
  onDelete?: () => void;
}

export default function PlanResourceCard({ title, url, onDelete }: PlanResourceCardProps) {
  return (
    <Card className="flex flex-col">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center gap-2 px-4 py-3 font-medium text-primary hover:underline"
        title={url}
      >
        {title}
        <ExternalLink className="w-4 h-4 ml-1" />
      </a>
      {onDelete && (
        <CardContent className="p-2 pt-0 flex justify-end">
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            aria-label="Delete resource"
          >
            Delete
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
