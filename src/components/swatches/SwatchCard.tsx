
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Ruler } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Swatch = Database['public']['Tables']['swatches']['Row'];

interface SwatchCardProps {
  swatch: Swatch;
  onEdit: (swatch: Swatch) => void;
  onDelete: (swatchId: string) => void;
}

export const SwatchCard = ({ swatch, onEdit, onDelete }: SwatchCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{swatch.title}</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(swatch)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(swatch.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {swatch.description && (
          <p className="text-sm text-gray-600 mb-3">{swatch.description}</p>
        )}
        
        <div className="space-y-2 text-sm">
          {swatch.hook_size && (
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-gray-500" />
              <span>Hook: {swatch.hook_size}</span>
            </div>
          )}
          
          {swatch.yarn_used && (
            <div>
              <span className="font-medium">Yarn: </span>
              <span className="text-gray-600">{swatch.yarn_used}</span>
            </div>
          )}
          
          {(swatch.stitches_per_inch || swatch.rows_per_inch) && (
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-xs font-medium text-gray-700 mb-1">Gauge</div>
              {swatch.stitches_per_inch && (
                <div className="text-xs">
                  {swatch.stitches_per_inch} stitches/inch
                </div>
              )}
              {swatch.rows_per_inch && (
                <div className="text-xs">
                  {swatch.rows_per_inch} rows/inch
                </div>
              )}
            </div>
          )}
          
          {swatch.notes && (
            <div>
              <span className="font-medium">Notes: </span>
              <span className="text-gray-600">{swatch.notes}</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 mt-3">
          Created: {new Date(swatch.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};
