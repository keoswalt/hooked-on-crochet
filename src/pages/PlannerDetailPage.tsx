
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlanImages } from '@/components/planner/PlanImages';
import { PlanResources } from '@/components/planner/PlanResources';
import { PlanAttachments } from '@/components/planner/PlanAttachments';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Plan = Database['public']['Tables']['plans']['Row'];

interface PlannerDetailPageProps {
  user: User;
}

export const PlannerDetailPage = ({ user }: PlannerDetailPageProps) => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // New: support create mode if planId === "new"
  const createMode = planId === "new";
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(!createMode);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!createMode && planId) {
      fetchPlan();
    } else {
      // Reset fields for create mode
      setPlan(null);
      setEditName('');
      setEditDescription('');
      setLoading(false);
    }
  }, [planId, createMode]);

  const fetchPlan = async () => {
    if (!planId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Plan not found",
            description: "The plan you're looking for doesn't exist or you don't have access to it.",
            variant: "destructive",
          });
          navigate('/planner');
          return;
        }
        throw error;
      }

      setPlan(data);
      setEditName(data.name);
      setEditDescription(data.description || '');
    } catch (error: any) {
      console.error('Error fetching plan:', error);
      toast({
        title: "Error",
        description: "Failed to load plan",
        variant: "destructive",
      });
      navigate('/planner');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!editName.trim()) return;
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('plans')
        .insert({
          name: editName.trim(),
          description: editDescription.trim() || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan created successfully",
      });

      // Redirect to /planner/:planId after creation
      navigate(`/planner/${data.id}`);
    } catch (error: any) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePlan = async (updates: Partial<Plan>) => {
    if (!plan) return;
    try {
      const { data, error } = await supabase
        .from('plans')
        .update(updates)
        .eq('id', plan.id)
        .select()
        .single();

      if (error) throw error;
      setPlan(data);
    } catch (error: any) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Failed to update plan",
        variant: "destructive",
      });
    }
  };

  const handleSaveBasicInfo = async () => {
    if (!plan || !editName.trim()) return;
    try {
      setSaving(true);
      await handleUpdatePlan({
        name: editName.trim(),
        description: editDescription.trim() || null,
      });
      toast({
        title: "Success",
        description: "Plan updated successfully",
      });
    } catch (error) {
      // Error handling is done in handleUpdatePlan
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading plan...</div>
      </div>
    );
  }

  if (!createMode && !plan) {
    // Plan couldn't be loaded for some reason.
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Plan not found</p>
          <Button onClick={() => navigate('/planner')} className="mt-4">
            Back to Planner
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/planner')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="space-y-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Plan name"
              className="text-lg font-semibold"
              disabled={!createMode && !plan}
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Plan description (optional)"
              rows={2}
              disabled={!createMode && !plan}
            />
            <div className="flex items-center gap-2">
              {createMode ? (
                <Button 
                  onClick={handleCreatePlan}
                  disabled={!editName.trim() || saving}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Saving...' : 'Create Plan'}
                </Button>
              ) : (
                <Button 
                  onClick={handleSaveBasicInfo}
                  disabled={!editName.trim() || saving}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="images" disabled={createMode}>Images</TabsTrigger>
          <TabsTrigger value="resources" disabled={createMode}>Resources</TabsTrigger>
          <TabsTrigger value="attachments" disabled={createMode}>Yarn & Swatches</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="images">
          {!createMode && plan ? (
            <PlanImages planId={plan.id} userId={user.id} />
          ) : (
            <div className="text-center text-gray-500 py-8">Save your plan to add images.</div>
          )}
        </TabsContent>
        <TabsContent value="resources">
          {!createMode && plan ? (
            <PlanResources planId={plan.id} />
          ) : (
            <div className="text-center text-gray-500 py-8">Save your plan to add resources.</div>
          )}
        </TabsContent>
        <TabsContent value="attachments">
          {!createMode && plan ? (
            <PlanAttachments planId={plan.id} userId={user.id} />
          ) : (
            <div className="text-center text-gray-500 py-8">Save your plan to attach yarn and swatches.</div>
          )}
        </TabsContent>
        <TabsContent value="overview">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Name</h4>
                  <p className="text-gray-600">{createMode ? editName : plan?.name}</p>
                </div>
                {(createMode ? editDescription : plan?.description) && (
                  <div>
                    <h4 className="font-medium mb-1">Description</h4>
                    <p className="text-gray-600">{createMode ? editDescription : plan?.description}</p>
                  </div>
                )}
                {!createMode && plan && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="font-medium mb-1">Created</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(plan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Last Modified</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(plan.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
