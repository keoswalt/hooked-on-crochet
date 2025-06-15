
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Package, Palette, Search, X } from 'lucide-react';
import { usePlanAttachments } from '@/hooks/usePlanAttachments';
import { supabase } from '@/integrations/supabase/client';
import { getYarnWeightLabel } from '@/utils/yarnWeights';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];
type Swatch = Database['public']['Tables']['swatches']['Row'];

interface PlanAttachmentsProps {
  planId: string;
  userId: string;
}

export const PlanAttachments = ({ planId, userId }: PlanAttachmentsProps) => {
  const {
    attachedYarn,
    attachedSwatches,
    loading,
    attachYarn,
    detachYarn,
    attachSwatch,
    detachSwatch,
  } = usePlanAttachments(planId);

  const [showYarnDialog, setShowYarnDialog] = useState(false);
  const [showSwatchDialog, setShowSwatchDialog] = useState(false);
  const [availableYarn, setAvailableYarn] = useState<YarnStash[]>([]);
  const [availableSwatches, setAvailableSwatches] = useState<Swatch[]>([]);
  const [yarnSearchQuery, setYarnSearchQuery] = useState('');
  const [swatchSearchQuery, setSwatchSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  const fetchAvailableYarn = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('yarn_stash')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      setAvailableYarn(data || []);
    } catch (error) {
      console.error('Error fetching yarn:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAvailableSwatches = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('swatches')
        .select('*')
        .eq('user_id', userId)
        .order('title');

      if (error) throw error;
      setAvailableSwatches(data || []);
    } catch (error) {
      console.error('Error fetching swatches:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleOpenYarnDialog = () => {
    setShowYarnDialog(true);
    fetchAvailableYarn();
  };

  const handleOpenSwatchDialog = () => {
    setShowSwatchDialog(true);
    fetchAvailableSwatches();
  };

  const filteredYarn = availableYarn.filter(yarn =>
    !attachedYarn.some(attached => attached.id === yarn.id) &&
    (yarn.name.toLowerCase().includes(yarnSearchQuery.toLowerCase()) ||
     yarn.brand?.toLowerCase().includes(yarnSearchQuery.toLowerCase()) ||
     yarn.color?.toLowerCase().includes(yarnSearchQuery.toLowerCase()))
  );

  const filteredSwatches = availableSwatches.filter(swatch =>
    !attachedSwatches.some(attached => attached.id === swatch.id) &&
    swatch.title.toLowerCase().includes(swatchSearchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading attachments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Attached Yarn */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Attached Yarn ({attachedYarn.length})
            </CardTitle>
            <Button onClick={handleOpenYarnDialog} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Attach Yarn
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {attachedYarn.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No yarn attached</p>
              <p className="text-sm">Attach yarn from your stash to this plan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attachedYarn.map((yarn) => (
                <div
                  key={yarn.id}
                  className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{yarn.name}</h4>
                      <p className="text-sm text-gray-600">
                        {yarn.brand} - {yarn.color}
                      </p>
                      {yarn.weight && (
                        <Badge variant="secondary" className="mt-1">
                          {getYarnWeightLabel(yarn.weight)}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => detachYarn(yarn.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attached Swatches */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Attached Swatches ({attachedSwatches.length})
            </CardTitle>
            <Button onClick={handleOpenSwatchDialog} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Attach Swatch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {attachedSwatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No swatches attached</p>
              <p className="text-sm">Attach swatches to reference gauge and measurements</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attachedSwatches.map((swatch) => (
                <div
                  key={swatch.id}
                  className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{swatch.title}</h4>
                      {swatch.hook_size && (
                        <p className="text-sm text-gray-600">Hook: {swatch.hook_size}</p>
                      )}
                      <div className="flex gap-2 mt-1">
                        {swatch.stitches_per_inch && (
                          <Badge variant="outline" className="text-xs">
                            {swatch.stitches_per_inch} st/in
                          </Badge>
                        )}
                        {swatch.rows_per_inch && (
                          <Badge variant="outline" className="text-xs">
                            {swatch.rows_per_inch} rows/in
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => detachSwatch(swatch.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Yarn Selection Dialog */}
      <Dialog open={showYarnDialog} onOpenChange={setShowYarnDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attach Yarn to Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search yarn..."
                value={yarnSearchQuery}
                onChange={(e) => setYarnSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {loadingData ? (
              <div className="text-center py-8">Loading yarn...</div>
            ) : filteredYarn.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No available yarn found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredYarn.map((yarn) => (
                  <div
                    key={yarn.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      attachYarn(yarn.id);
                      setShowYarnDialog(false);
                      setYarnSearchQuery('');
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{yarn.name}</p>
                        <p className="text-sm text-gray-600">
                          {yarn.brand} - {yarn.color}
                        </p>
                      </div>
                      {yarn.weight && (
                        <Badge variant="secondary">
                          {getYarnWeightLabel(yarn.weight)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Swatch Selection Dialog */}
      <Dialog open={showSwatchDialog} onOpenChange={setShowSwatchDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attach Swatch to Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search swatches..."
                value={swatchSearchQuery}
                onChange={(e) => setSwatchSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {loadingData ? (
              <div className="text-center py-8">Loading swatches...</div>
            ) : filteredSwatches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No available swatches found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredSwatches.map((swatch) => (
                  <div
                    key={swatch.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      attachSwatch(swatch.id);
                      setShowSwatchDialog(false);
                      setSwatchSearchQuery('');
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{swatch.title}</p>
                        {swatch.hook_size && (
                          <p className="text-sm text-gray-600">Hook: {swatch.hook_size}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {swatch.stitches_per_inch && (
                          <Badge variant="outline" className="text-xs">
                            {swatch.stitches_per_inch} st/in
                          </Badge>
                        )}
                        {swatch.rows_per_inch && (
                          <Badge variant="outline" className="text-xs">
                            {swatch.rows_per_inch} rows/in
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
