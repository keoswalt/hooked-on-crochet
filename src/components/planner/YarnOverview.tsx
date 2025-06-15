
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { YarnForm } from '@/components/stash/YarnForm';
import { getYarnWeightLabel } from '@/utils/yarnWeights';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];

interface YarnOverviewProps {
  yarnStash: YarnStash[];
  userId: string;
  onYarnEdit: (yarn: YarnStash) => void;
  onRefresh: () => void;
}

export const YarnOverview = ({ yarnStash, userId, onYarnEdit, onRefresh }: YarnOverviewProps) => {
  const [showNewYarnDialog, setShowNewYarnDialog] = useState(false);
  const navigate = useNavigate();

  const handleNewYarnSaved = () => {
    onRefresh();
    setShowNewYarnDialog(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Yarn</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/stash')}>
            Manage Stash
          </Button>
          <Button size="sm" onClick={() => setShowNewYarnDialog(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {yarnStash.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-gray-600">No yarn in your stash yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {yarnStash.map((yarn) => (
            <Card key={yarn.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onYarnEdit(yarn)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{yarn.name}</p>
                    <p className="text-sm text-gray-600">{yarn.brand} - {yarn.color}</p>
                  </div>
                  <div className="text-right">
                    {yarn.weight ? (
                      <Badge variant="secondary">{getYarnWeightLabel(yarn.weight)}</Badge>
                    ) : (
                      <Badge variant="secondary">No weight</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showNewYarnDialog} onOpenChange={setShowNewYarnDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Yarn</DialogTitle>
          </DialogHeader>
          <YarnForm
            userId={userId}
            onSave={handleNewYarnSaved}
            onCancel={() => setShowNewYarnDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
