
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];

interface YarnCardProps {
  yarn: YarnStash;
  onEdit: (yarn: YarnStash) => void;
  onDelete: (yarnId: string) => void;
}

export const YarnCard = ({ yarn, onEdit, onDelete }: YarnCardProps) => {
  const remainingPercentage = yarn.yardage
    ? ((yarn.remaining_yardage || 0) / yarn.yardage) * 100
    : 0;

  const getStockLevel = () => {
    if (remainingPercentage > 75) return { label: "High", color: "bg-green-500" };
    if (remainingPercentage > 25) return { label: "Medium", color: "bg-yellow-500" };
    if (remainingPercentage > 0) return { label: "Low", color: "bg-red-500" };
    return { label: "Empty", color: "bg-gray-500" };
  };

  const stockLevel = getStockLevel();

  return (
    <div
      className="relative rounded-lg border transition-shadow shadow hover:shadow-md hover-scale cursor-pointer ring-0 border-gray-200 bg-white"
      style={{ minHeight: 190 }}
      tabIndex={0}
    >
      {/* Floating Edit and Delete buttons */}
      <div className="absolute top-2 right-2 flex gap-2 z-20 pointer-events-auto">
        <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); onEdit(yarn); }} title="Edit yarn">
          <Edit className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); onDelete(yarn.id); }} title="Delete yarn">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="pt-6 pb-2 px-2">
        {yarn.image_url ? (
          <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100">
            <img
              src={yarn.image_url}
              alt={yarn.name}
              className="w-full h-full object-cover"
            />
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
            <div className="flex flex-col w-full pt-1">
              <span className="text-xs font-medium mb-0.5">Weight:</span>
              <Badge variant="secondary" className="max-w-fit break-words whitespace-normal">{yarn.weight}</Badge>
            </div>
          )}
          {yarn.yardage && (
            <div className="space-y-1 pt-1">
              <p>
                <span className="font-medium">Yardage:</span> {yarn.remaining_yardage || 0} / {yarn.yardage} yds
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${stockLevel.color}`}
                  style={{ width: `${Math.max(remainingPercentage, 0)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Stock: {stockLevel.label} ({Math.round(remainingPercentage)}%)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
