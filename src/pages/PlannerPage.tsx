
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { YarnForm } from '@/components/stash/YarnForm';
import { SwatchForm } from '@/components/swatches/SwatchForm';
import { PlansSearch } from '@/components/planner/PlansSearch';
import { PlansGrid } from '@/components/planner/PlansGrid';
import { PlansPagination } from '@/components/planner/PlansPagination';
import { YarnOverview } from '@/components/planner/YarnOverview';
import { SwatchesOverview } from '@/components/planner/SwatchesOverview';
import { usePlansPagination } from '@/hooks/usePlansPagination';
import { useDebounce } from '@/hooks/useDebounce';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Plan = Database['public']['Tables']['plans']['Row'];
type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];
type Swatch = Database['public']['Tables']['swatches']['Row'];

interface PlannerPageProps {
  user: User;
}

const PLANS_PER_PAGE = 9;

export const PlannerPage = ({ user }: PlannerPageProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [yarnStash, setYarnStash] = useState<YarnStash[]>([]);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [editingYarn, setEditingYarn] = useState<YarnStash | null>(null);
  const [editingSwatch, setEditingSwatch] = useState<Swatch | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    currentPage,
    totalPages,
    totalItems,
    setTotalItems,
    handlePageChange,
    resetToFirstPage,
  } = usePlansPagination({
    itemsPerPage: PLANS_PER_PAGE,
    onPageChange: (page: number) => fetchPlans(searchQuery, page),
  });

  const debouncedSearch = useDebounce((query: string) => {
    resetToFirstPage();
    fetchPlans(query, 1);
  }, 300);

  useEffect(() => {
    fetchInitialData();
  }, [user.id]);

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      resetToFirstPage();
      fetchPlans('', 1);
    }
  }, [searchQuery, debouncedSearch, resetToFirstPage]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      await fetchPlans('', 1);

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

  const fetchPlans = async (query: string, page: number) => {
    try {
      setPlansLoading(true);
      
      const offset = (page - 1) * PLANS_PER_PAGE;
      
      // Build the query
      let plansQuery = supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id);

      let countQuery = supabase
        .from('plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Add search filter if query exists
      if (query.trim()) {
        const searchFilter = `name.ilike.%${query}%,description.ilike.%${query}%`;
        plansQuery = plansQuery.or(searchFilter);
        countQuery = countQuery.or(searchFilter);
      }

      // Execute count query
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalItems(count || 0);

      // Execute plans query with pagination
      const { data: planData, error: plansError } = await plansQuery
        .order('updated_at', { ascending: false })
        .range(offset, offset + PLANS_PER_PAGE - 1);

      if (plansError) throw plansError;
      setPlans(planData || []);

    } catch (error: any) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load plans",
        variant: "destructive",
      });
    } finally {
      setPlansLoading(false);
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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleEditYarn = (yarn: YarnStash) => {
    setEditingYarn(yarn);
  };

  const handleEditSwatch = (swatch: Swatch) => {
    setEditingSwatch(swatch);
  };

  const handleYarnSaved = () => {
    fetchInitialData();
    setEditingYarn(null);
  };

  const handleSwatchSaved = () => {
    fetchInitialData();
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
        
        <PlansSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={clearSearch}
        />

        <PlansGrid
          plans={plans}
          loading={plansLoading}
          searchQuery={searchQuery}
          onClearSearch={clearSearch}
        />

        <PlansPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={PLANS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Quick Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <YarnOverview
          yarnStash={yarnStash}
          userId={user.id}
          onYarnEdit={handleEditYarn}
          onRefresh={fetchInitialData}
        />

        <SwatchesOverview
          swatches={swatches}
          userId={user.id}
          onSwatchEdit={handleEditSwatch}
          onRefresh={fetchInitialData}
        />
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
