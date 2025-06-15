
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SwatchForm } from '@/components/swatches/SwatchForm';
import type { Database } from '@/integrations/supabase/types';

type Swatch = Database['public']['Tables']['swatches']['Row'];

interface SwatchesOverviewProps {
  swatches: Swatch[];
  userId: string;
  onSwatchEdit: (swatch: Swatch) => void;
  onRefresh: () => void;
}

export const SwatchesOverview = ({ swatches, userId, onSwatchEdit, onRefresh }: SwatchesOverviewProps) => {
  const [showNewSwatchDialog, setShowNewSwatchDialog] = useState(false);
  const navigate = useNavigate();

  const handleNewSwatchSaved = () => {
    onRefresh();
    setShowNewSwatchDialog(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Swatches</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/swatches')}>
            Manage Swatches
          </Button>
          <Button size="sm" onClick={() => setShowNewSwatchDialog(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {swatches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-gray-600">No swatches created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {swatches.map((swatch) => (
            <Card key={swatch.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSwatchEdit(swatch)}>
              <CardContent className="p-4">
                <p className="font-medium">{swatch.title}</p>
                {swatch.hook_size && (
                  <p className="text-xs text-gray-500 mt-1">Hook: {swatch.hook_size}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showNewSwatchDialog} onOpenChange={setShowNewSwatchDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Swatch</DialogTitle>
          </DialogHeader>
          <SwatchForm
            userId={userId}
            onSave={handleNewSwatchSaved}
            onCancel={() => setShowNewSwatchDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
