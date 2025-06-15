
import YarnDisplayCard from "@/components/shared/YarnDisplayCard";
import type { Database } from "@/integrations/supabase/types";

type YarnStash = Database["public"]["Tables"]["yarn_stash"]["Row"];

interface YarnPreviewCardProps {
  yarn: YarnStash;
  checked: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

export default function YarnPreviewCard({ yarn, checked, onSelect, children }: YarnPreviewCardProps) {
  // Wrap in visually selected state and clickable
  return (
    <div
      className={`relative ${checked ? "ring-2 ring-primary border-primary" : ""}`}
      tabIndex={0}
      onClick={onSelect}
      aria-checked={checked}
      role="checkbox"
    >
      {/* Slot (e.g., checkbox) */}
      {children && (
        <div className="pointer-events-auto absolute top-2 left-2 z-10">{children}</div>
      )}

      <YarnDisplayCard yarn={yarn} />
    </div>
  );
}
