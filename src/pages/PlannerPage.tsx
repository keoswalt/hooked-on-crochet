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

type Plan = Database['public']['Tables']['plans']['Row'] & {
  featured_image_url?: string | null;
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlans, setTotalPlans] = useState(0);
  const [showNewYarnDialog, setShowNewYarnDialog] = useState(false);
  const [showNewSwatchDialog, setShowNewSwatchDialog] = useState(false);
  const [editingYarn, setEditingYarn] = useState<YarnStash | null>(null);
  const [editingSwatch, setEditingSwatch] = useState<Swatch | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalPages = Math.ceil(totalPlans / PLANS_PER_PAGE);

  // Debounced search function
  const debounceSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setCurrentPage(1); // Reset to first page on new search
          fetchPlans(query, 1);
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    fetchInitialData();
  }, [user.id]);

  useEffect(() => {
    if (searchQuery) {
      debounceSearch(searchQuery);
    } else {
      setCurrentPage(1);
      fetchPlans('', 1);
    }
  }, [searchQuery, debounceSearch]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch initial plans data
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
      
      // Compose the SQL to join plan_images table for featured images
      let plansQuery = supabase
        .from('plans')
        .select('*, plan_images!left(is_featured, image_url)')
        .eq('user_id', user.id);

      let countQuery = supabase
        .from('plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (query.trim()) {
        const searchFilter = `name.ilike.%${query}%,description.ilike.%${query}%`;
        plansQuery = plansQuery.or(searchFilter);
        countQuery = countQuery.or(searchFilter);
      }

      // Count
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalPlans(count || 0);

      // Get data (with featured image)
      const { data: planData, error: plansError } = await plansQuery
        .order('updated_at', { ascending: false })
        .range(offset, offset + PLANS_PER_PAGE - 1);

      if (plansError) throw plansError;

      // Map image
      const plansWithImage = (planData || []).map((plan: any) => ({
        ...plan,
        featured_image_url: Array.isArray(plan.plan_images)
          ? plan.plan_images.find((img: any) => img.is_featured === true)?.image_url
          : null
      }));

      setPlans(plansWithImage);

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
      fetchPlans(searchQuery, currentPage);
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
    fetchInitialData();
    setEditingYarn(null);
  };

  const handleSwatchSaved = () => {
    fetchInitialData();
    setEditingSwatch(null);
  };

  const handleNewYarnSaved = () => {
    fetchInitialData();
    setShowNewYarnDialog(false);
  };

  const handleNewSwatchSaved = () => {
    fetchInitialData();
    setShowNewSwatchDialog(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPlans(searchQuery, page);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

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
        
        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Plans Grid */}
        {plansLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {searchQuery ? (
                <div>
                  <p className="text-gray-600 mb-2">No plans found matching "{searchQuery}"</p>
                  <Button variant="outline" onClick={clearSearch}>
                    Clear search
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">No plans yet. Create your first one!</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* HORIZONTAL FLEX PLAN CARDS */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="hover:shadow-lg transition-shadow relative group flex flex-row items-stretch"
                >
                  {/* Card Content Section (Left Side) */}
                  <div
                    className="flex-1 flex flex-col justify-center px-4 py-4 cursor-pointer"
                    onClick={() => navigate(`/planner/${plan.id}`)}
                  >
                    <CardHeader className="p-0 mb-2">
                      <CardTitle className="truncate text-lg">{plan.name}</CardTitle>
                      {plan.description && (
                        <CardDescription className="truncate">{plan.description}</CardDescription>
                      )}
                    </CardHeader>
                  </div>
                  {/* Image Section (Right Side) */}
                  <div
                    className="flex items-center justify-center p-2"
                    style={{ minWidth: '96px' }}
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {plan.featured_image_url ? (
                        <img
                          src={plan.featured_image_url}
                          alt={plan.name || 'Plan image'}
                          className="w-full h-full object-cover object-center"
                          draggable={false}
                        />
                      ) : (
                        <div className="text-gray-300 text-xs text-center w-full">No image</div>
                      )}
                    </div>
                  </div>
                  {/* Delete button - overlay on the top-right of card (absolute) */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlanToDelete(plan);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * PLANS_PER_PAGE) + 1}-{Math.min(currentPage * PLANS_PER_PAGE, totalPlans)} of {totalPlans} plans
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!planToDelete}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
        onConfirm={handleDeletePlan}
        title="Delete Plan"
        description="Are you sure you want to delete this plan? This action cannot be undone and will permanently delete the plan and all associated canvas elements."
      />

      {/* New Yarn Dialog */}
      <Dialog open={showNewYarnDialog} onOpenChange={setShowNewYarnDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Yarn</DialogTitle>
          </DialogHeader>
          <YarnForm
            userId={user.id}
            onSave={handleNewYarnSaved}
            onCancel={() => setShowNewYarnDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* New Swatch Dialog */}
      <Dialog open={showNewSwatchDialog} onOpenChange={setShowNewSwatchDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Swatch</DialogTitle>
          </DialogHeader>
          <SwatchForm
            userId={user.id}
            onSave={handleNewSwatchSaved}
            onCancel={() => setShowNewSwatchDialog(false)}
          />
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
