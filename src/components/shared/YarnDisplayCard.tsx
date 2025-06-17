import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package, Copy } from "lucide-react";
import { getYarnWeightLabel } from "@/utils/yarnWeights";
import type { Database } from "@/integrations/supabase/types";
type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];
interface YarnDisplayCardProps {
  yarn: YarnStash;
  onEdit?: (yarn: YarnStash) => void;
  onDelete?: (yarnId: string) => void;
  onDuplicate?: (yarn: YarnStash) => void;
  className?: string;
  "data-testid"?: string;
}
export const YarnDisplayCard = ({
  yarn,
  onEdit,
  onDelete,
  onDuplicate,
  className = "",
  ...props
}: YarnDisplayCardProps) => {
  // Handler for card click
  const handleCardClick = () => {
    if (onEdit) {
      onEdit(yarn);
    }
  };

  return (
    <div
      className={`relative w-sm rounded-lg border transition-shadow shadow hover:shadow-md hover-scale cursor-pointer ring-0 border-gray-200 bg-white focus:outline-none ${className}`}
      tabIndex={0}
      onClick={handleCardClick}
      {...props}
    >
      {/* Optional Edit/Delete/Duplicate buttons */}
      {(onEdit || onDelete || onDuplicate) && (
        <div className="flex justify-end gap-2 pt-2 px-2 pointer-events-auto">
          {onEdit && (
            <Button
              size="icon"
              variant="ghost"
              onClick={e => {
                e.stopPropagation();
                onEdit(yarn);
              }}
              title="Edit yarn"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDuplicate && (
            <Button
              size="icon"
              variant="ghost"
              onClick={e => {
                e.stopPropagation();
                onDuplicate(yarn);
              }}
              title="Duplicate yarn"
            >
              <Copy className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              onClick={e => {
                e.stopPropagation();
                onDelete(yarn.id);
              }}
              title="Delete yarn"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      <div className="pt-2 pb-4 px-4">
        {yarn.image_url ? (
          <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-gray-100">
            <img src={yarn.image_url} alt={yarn.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center mb-2">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}

        <div className="font-semibold text-base mb-1 line-clamp-2">{yarn.name}</div>
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          {yarn.brand && (
            <span>
              <span className="font-medium">Brand:</span> {yarn.brand}
            </span>
          )}
          {yarn.color && (
            <span>
              <span className="font-medium">Color:</span> {yarn.color}
            </span>
          )}
          {yarn.weight && (
            <div className="flex flex-wrap items-center gap-2 w-full pt-1">
              <span className="text-xs font-medium mb-0.5">Weight:</span>
              <Badge variant="secondary" className="max-w-full break-words whitespace-normal">
                {getYarnWeightLabel(yarn.weight)}
              </Badge>
            </div>
          )}
          {/* No yardage bar, remaining yardage, or stock info */}
        </div>
      </div>
    </div>
  );
};
export default YarnDisplayCard;
