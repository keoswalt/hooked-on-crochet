import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SwatchCard } from '@/components/swatches/SwatchCard';
import { SwatchForm } from '@/components/swatches/SwatchForm';
import { SwatchFilters } from '@/components/swatches/SwatchFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Swatch = Database['public']['Tables']['swatches']['Row'];

interface SwatchesPageProps {
  user: User;
}

export const SwatchesPage = ({ user }: SwatchesPageProps) => {
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [filteredSwatches, setFilteredSwatches] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSwatch, setEditingSwatch] = useState<Swatch | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSwatches();
  }, [user.id]);

  useEffect(() => {
    setFilteredSwatches(swatches);
  }, [swatches]);

  const fetchSwatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('swatches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSwatches(data || []);
    } catch (error: any) {
      console.error('Error fetching swatches:', error);
      toast({
        title: "Error",
        description: "Failed to load swatches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwatchSaved = () => {
    fetchSwatches();
    setShowAddDialog(false);
    setEditingSwatch(null);
  };

  const handleEditSwatch = (swatch: Swatch) => {
    setEditingSwatch(swatch);
  };

  const handleCloneSwatch = (swatch: Swatch) => {
    const clonedSwatch = {
      ...swatch,
      id: undefined as any, // Will be auto-generated
      title: `${swatch.title} (Copy)`,
      created_at: undefined as any,
      updated_at: undefined as any,
    };
    setEditingSwatch(clonedSwatch);
  };

  const handleDeleteSwatch = async (swatchId: string) => {
    try {
      // First delete any associated images
      const { error: imagesError } = await supabase
        .from('swatch_images')
        .delete()
        .eq('swatch_id', swatchId);

      if (imagesError) {
        console.error('Error deleting swatch images:', imagesError);
      }

      // Then delete the swatch
      const { error } = await supabase
        .from('swatches')
        .delete()
        .eq('id', swatchId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Swatch deleted successfully",
      });

      fetchSwatches();
    } catch (error: any) {
      console.error('Error deleting swatch:', error);
      toast({
        title: "Error",
        description: "Failed to delete swatch",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={() => navigate('/planner')}
              className="cursor-pointer hover:text-foreground"
            >
              Planner
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Swatches</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Swatches</h1>
          <p className="text-gray-600 mt-2">Manage your gauge swatches and samples</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Swatch
        </Button>
      </div>

      {/* Filters */}
      <SwatchFilters 
        swatches={swatches} 
        onFilter={setFilteredSwatches}
        className="mb-6"
      />

      {/* Swatch Grid */}
      {filteredSwatches.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {swatches.length === 0 ? "No swatches created yet" : "No swatches match your filters"}
          </div>
          {swatches.length === 0 && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Swatch
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSwatches.map((swatch) => (
            <SwatchCard
              key={swatch.id}
              swatch={swatch}
              onEdit={handleEditSwatch}
              onDelete={handleDeleteSwatch}
              onClone={handleCloneSwatch}
            />
          ))}
        </div>
      )}

      {/* Add Swatch Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Swatch</DialogTitle>
          </DialogHeader>
          <SwatchForm
            userId={user.id}
            onSave={handleSwatchSaved}
            onCancel={() => setShowAddDialog(false)}
          />
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
