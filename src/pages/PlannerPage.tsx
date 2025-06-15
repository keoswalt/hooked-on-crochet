import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Palette, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getYarnWeightLabel } from '@/utils/yarnWeights';
import { YarnForm } from '@/components/stash/YarnForm';
import { SwatchForm } from '@/components/swatches/SwatchForm';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Plan = Database['public']['Tables']['plans']['Row'];
type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];
type Swatch = Database['public']['Tables']['swatches']['Row'];

interface PlannerPageProps {
  user: User;
}

export const PlannerPage = ({ user }: PlannerPageProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [yarnStash, setYarnStash] = useState<YarnStash[]>([]);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [editingYarn, setEditingYarn] = useState<YarnStash | null>(null);
  const [editingSwatch, setEditingSwatch] = useState<Swatch | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch plans
      const { data: planData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (plansError) throw plansError;
      setPlans(planData || []);

      // Fetch yarn stash (limit to recent entries for overview)
      const { data: yarn, error: yarnError } = await supabase
        .from('yarn_stash')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (yarnError) throw yarnError;
      setYarnStash(yarn || []);

      // Fetch swatches (limit to recent entries for overview)
      const { data: swatchData, error: swatchError } = await supabase
        .from('swatches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (swatchError) throw swatchError;
      setSwatches(swatchData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('plans')
        .insert({
          name: newPlanName,
          description: newPlanDescription,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan created successfully",
      });

      setShowNewPlanDialog(false);
      setNewPlanName('');
      setNewPlanDescription('');
      navigate(`/planner/${data.id}`);
    } catch (error: any) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive",
      });
    }
  };

  const handleEditYarn = (yarn: YarnStash) => {
    setEditingYarn(yarn);
  };

  const handleEditSwatch = (swatch: Swatch) => {
    setEditingSwatch(swatch);
  };

  const handleYarnSaved = () => {
    fetchData();
    setEditingYarn(null);
  };

  const handleSwatchSaved = () => {
    fetchData();
    setEditingSwatch(null);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Planner</h1>
          <p className="text-gray-600 mt-2">Plan your crochet projects with an infinite canvas</p>
        </div>
        <Button onClick={() => setShowNewPlanDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      {/* Plans Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Plans</h2>
        {plans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No plans yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/planner/${plan.id}`)}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.description && (
                    <CardDescription>{plan.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Last modified: {new Date(plan.updated_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Yarn Stash Overview */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Yarn</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/stash')}>
              Manage Stash
            </Button>
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
                <Card key={yarn.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEditYarn(yarn)}>
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
        </div>

        {/* Swatches Overview */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Swatches</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/swatches')}>
              Manage Swatches
            </Button>
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
                <Card key={swatch.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEditSwatch(swatch)}>
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
        </div>
      </div>

      {/* New Plan Dialog */}
      <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="plan-name" className="block text-sm font-medium mb-2">
                Plan Name
              </label>
              <Input
                id="plan-name"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="Enter plan name"
              />
            </div>
            <div>
              <label htmlFor="plan-description" className="block text-sm font-medium mb-2">
                Description (optional)
              </label>
              <Textarea
                id="plan-description"
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
                placeholder="Describe your plan"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPlanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan} disabled={!newPlanName.trim()}>
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Yarn Dialog */}
      <Dialog open={!!editingYarn} onOpenChange={() => setEditingYarn(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Yarn</DialogTitle>
          </DialogHeader>
          {editingYarn && (
            <YarnForm
              userId={user.id}
              yarn={editingYarn}
              onSave={handleYarnSaved}
              onCancel={() => setEditingYarn(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Swatch Dialog */}
      <Dialog open={!!editingSwatch} onOpenChange={() => setEditingSwatch(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Swatch</DialogTitle>
          </DialogHeader>
          {editingSwatch && (
            <SwatchForm
              userId={user.id}
              swatch={editingSwatch}
              onSave={handleSwatchSaved}
              onCancel={() => setEditingSwatch(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
