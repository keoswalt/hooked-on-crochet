
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CanvasBoard } from '@/components/planner/CanvasBoard';
import { DebugPanel } from '@/components/planner/DebugPanel';
import { ToolsToolbar, ToolType } from '@/components/planner/ToolsToolbar';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Plan = Database['public']['Tables']['plans']['Row'];

interface PlannerDetailPageProps {
  user: User;
}

export const PlannerDetailPage = ({ user }: PlannerDetailPageProps) => {
  const { plannerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected tool state (default: text tool)
  const [selectedTool, setSelectedTool] = useState<ToolType>("text");

  useEffect(() => {
    if (plannerId) {
      fetchPlan();
    }
  }, [plannerId, user.id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', plannerId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setPlan(data);
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!plan) {
    return <div className="min-h-screen flex items-center justify-center">Plan not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 z-20 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/planner')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Planner
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{plan.name}</h1>
              {plan.description && (
                <p className="text-sm text-gray-600">{plan.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col relative">
        {/* Canvas Area */}
        <div className="flex-1 relative z-10">
          <CanvasBoard selectedTool={selectedTool} />
        </div>
      </div>

      {/* New Tools Toolbar (Sticky to bottom) */}
      <ToolsToolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />

      {/* Debug Panel */}
      <DebugPanel planId={plan.id} userId={user.id} />
    </div>
  );
};
