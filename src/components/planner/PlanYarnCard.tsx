
import { Button } from "@/components/ui/button";
import { YarnCard } from "@/components/stash/YarnCard";
import { Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type YarnStash = Database["public"]["Tables"]["yarn_stash"]["Row"];

interface PlanYarnCardProps {
  yarn: YarnStash;
  onRemove: (yarnId: string) => void;
}

export default function PlanYarnCard({ yarn, onRemove }: PlanYarnCardProps) {
  return (
    <div className="relative">
      <YarnCard yarn={yarn} onEdit={() => {}} onDelete={() => {}} />
      <Button
        size="icon"
        variant="destructive"
        className="absolute top-2 right-2"
        onClick={() => onRemove(yarn.id)}
        title="Remove from plan"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
