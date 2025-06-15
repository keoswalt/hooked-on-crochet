import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Package } from 'lucide-react';
import { getYarnWeightLabel } from '@/utils/yarnWeights';
import type { Database } from '@/integrations/supabase/types';

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
    if (remainingPercentage > 75) return { label: 'High', color: 'bg-green-500' };
    if (remainingPercentage > 25) return { label: 'Medium', color: 'bg-yellow-500' };
    if (remainingPercentage > 0) return { label: 'Low', color: 'bg-red-500' };
    return { label: 'Empty', color: 'bg-gray-500' };
  };

  const stockLevel = getStockLevel();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {yarn.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {yarn.image_url ? (
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={yarn.image_url}
              alt={yarn.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}

        <div className="space-y-2">
          {yarn.brand && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Brand:</span> {yarn.brand}
            </p>
          )}
          
          {yarn.color && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Color:</span> {yarn.color}
            </p>
          )}

          {yarn.weight && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Weight:</span>
              <Badge variant="secondary">{getYarnWeightLabel(yarn.weight)}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
