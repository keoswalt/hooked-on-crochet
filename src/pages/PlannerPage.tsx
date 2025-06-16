import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Palette, Package, Search, X, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getYarnWeightLabel } from '@/utils/yarnWeights';
import { YarnForm } from '@/components/stash/YarnForm';
import { SwatchForm } from '@/components/swatches/SwatchForm';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { NewPlanDialog } from '@/components/planner/NewPlanDialog';
import { PlansGrid } from '@/components/planner/PlansGrid';
import { PlannerRelatedOverview } from '@/components/planner/PlannerRelatedOverview';
import { usePlansList } from "@/hooks/usePlansList";
import { useYarnStash } from "@/hooks/useYarnStash";
import { useSwatches } from "@/hooks/useSwatches";

// Export these types so they can be used elsewhere
export type Plan = Database['public']['Tables']['plans']['Row'] & {
  featured_image_url?: string | null;
};

export type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];
export type Swatch = Database['public']['Tables']['swatches']['Row'];

export type PlannerPageProps = {
  user: User;
};

const PLANS_PER_PAGE = 9;

export const PlannerPage = ({ user }: PlannerPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewYarnDialog, setShowNewYarnDialog] = useState(false);
  const [showNewSwatchDialog, setShowNewSwatchDialog] = useState(false);
  const [editingYarn, setEditingYarn] = useState<YarnStash | null>(null);
  const [editingSwatch, setEditingSwatch] = useState<Swatch | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: plansData, isLoading: plansLoading, refetch } = usePlansList(user, searchQuery, currentPage);
  const plans = plansData?.plans || [];
  const totalPlans = plansData?.totalPlans || 0;

  const { data: yarnsData = [], refetch: yarnRefetch } = useYarnStash(user);
  const yarnStash = yarnsData.slice(0,6);
  const { data: swatchData = [], refetch: swatchRefetch } = useSwatches(user);
  const swatches = swatchData.slice(0,6);

  const totalPages = Math.ceil(totalPlans / PLANS_PER_PAGE);

  // Debounced search function
  const debounceSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setCurrentPage(1); // Reset to first page on new search
          refetch();
        }, 300);
      };
    })(),
    [refetch]
  );

  useEffect(() => {
    if (searchQuery) {
      debounceSearch(searchQuery);
    } else {
      setCurrentPage(1);
    }
  }, [searchQuery, debounceSearch]);

  const handleDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      // Delete associated canvas elements first
      await supabase
        .from('canvas_elements')
        .delete()
        .eq('plan_id', planToDelete.id);

      // Delete the plan
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });

      // Refresh plans data
      refetch();
      setPlanToDelete(null);
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete plan",
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
    yarnRefetch();
    setEditingYarn(null);
  };

  const handleSwatchSaved = () => {
    swatchRefetch();
    setEditingSwatch(null);
  };

  const handleNewYarnSaved = () => {
    yarnRefetch();
    setShowNewYarnDialog(false);
  };

  const handleNewSwatchSaved = () => {
    swatchRefetch();
    setShowNewSwatchDialog(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetch();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Planner</h1>
          <p className="text-gray-600 mt-2">Plan your crochet projects with an infinite canvas</p>
        </div>
        <div>
          <Button onClick={() => setShowNewPlanDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      {/* New Plan Dialog */}
      <NewPlanDialog
        open={showNewPlanDialog}
        onOpenChange={setShowNewPlanDialog}
        userId={user.id}
        onCreated={(planId) => {
          setShowNewPlanDialog(false);
          navigate(`/planner/${planId}`);
        }}
      />

      {/* Plans Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Plans</h2>

        <PlansGrid
          plans={plans}
          loading={plansLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={clearSearch}
          onPlanClick={(id) => navigate(`/planner/${id}`)}
          onPlanDelete={setPlanToDelete}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPlans={totalPlans}
          PLANS_PER_PAGE={PLANS_PER_PAGE}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!planToDelete}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
        onConfirm={handleDeletePlan}
        title="Delete Plan"
        description="Are you sure you want to delete this plan? This action cannot be undone and will permanently delete the plan and all associated canvas elements."
      />

      {/* All Yarn and Swatch related dialogs */}
      <PlannerRelatedOverview
        showNewYarnDialog={showNewYarnDialog}
        setShowNewYarnDialog={setShowNewYarnDialog}
        showNewSwatchDialog={showNewSwatchDialog}
        setShowNewSwatchDialog={setShowNewSwatchDialog}
        editingYarn={editingYarn}
        setEditingYarn={setEditingYarn}
        editingSwatch={editingSwatch}
        setEditingSwatch={setEditingSwatch}
        userId={user.id}
        handleNewYarnSaved={handleNewYarnSaved}
        handleNewSwatchSaved={handleNewSwatchSaved}
        handleYarnSaved={handleYarnSaved}
        handleSwatchSaved={handleSwatchSaved}
      />
    </div>
  );
};
