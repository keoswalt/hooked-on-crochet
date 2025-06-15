
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Edit, Trash2, Ruler, Copy } from 'lucide-react';
import { useSwatchImages } from '@/hooks/useSwatchImages';
import type { Database } from '@/integrations/supabase/types';

type Swatch = Database['public']['Tables']['swatches']['Row'];

interface SwatchCardProps {
  swatch: Swatch;
  onEdit: (swatch: Swatch) => void;
  onDelete: (swatchId: string) => void;
  onClone: (swatch: Swatch) => void;
}

export const SwatchCard = ({ swatch, onEdit, onDelete, onClone }: SwatchCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { images } = useSwatchImages(swatch.id);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(swatch.id);
    setShowDeleteConfirm(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(swatch);
  };

  const handleCloneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClone(swatch);
  };

  return (
    <>
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => onEdit(swatch)}
        tabIndex={0}
        role="button"
        aria-label={`Edit swatch "${swatch.title}"`}
      >
        <div className="w-full h-48 overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={swatch.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="text-gray-400 text-sm">No image</div>
          )}
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{swatch.title}</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditClick}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCloneClick}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
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
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Swatch?"
        description="Are you sure you want to delete this swatch? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

