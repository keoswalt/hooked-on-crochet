
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlanCanvas } from '@/components/planner/PlanCanvas';
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
  
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (planId) {
      fetchPlan();
    }
  }, [planId]);

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

      setEditing(false);
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

  const handleCancelEdit = () => {
    setEditName(plan?.name || '');
    setEditDescription(plan?.description || '');
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading plan...</div>
      </div>
    );
  }

  if (!plan) {
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
          {editing ? (
            <div className="space-y-3">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Plan name"
                className="text-lg font-semibold"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Plan description (optional)"
                rows={2}
              />
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleSaveBasicInfo} 
                  disabled={!editName.trim() || saving}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              {plan.description && (
                <p className="text-gray-600">{plan.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Created: {new Date(plan.created_at).toLocaleDateString()} • 
                Last modified: {new Date(plan.updated_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="canvas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="attachments">Yarn & Swatches</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="canvas">
          <PlanCanvas plan={plan} onUpdatePlan={handleUpdatePlan} />
        </TabsContent>

        <TabsContent value="images">
          <PlanImages planId={plan.id} userId={user.id} />
        </TabsContent>

        <TabsContent value="resources">
          <PlanResources planId={plan.id} />
        </TabsContent>

        <TabsContent value="attachments">
          <PlanAttachments planId={plan.id} userId={user.id} />
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
                  <p className="text-gray-600">{plan.name}</p>
                </div>
                {plan.description && (
                  <div>
                    <h4 className="font-medium mb-1">Description</h4>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                )}
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
