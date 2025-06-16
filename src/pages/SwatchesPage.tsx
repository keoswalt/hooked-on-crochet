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
import { useSwatches } from "@/hooks/useSwatches";

type Swatch = Database['public']['Tables']['swatches']['Row'];

interface SwatchesPageProps {
  user: User;
}

export const SwatchesPage = ({ user }: SwatchesPageProps) => {
  const { data: swatches = [], isLoading: _loading, refetch } = useSwatches(user);
  const [filteredSwatches, setFilteredSwatches] = useState<Swatch[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSwatch, setEditingSwatch] = useState<Swatch | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredSwatches(swatches);
  }, [swatches]);

  const handleSwatchSaved = () => {
    refetch();
    setShowAddDialog(false);
    setEditingSwatch(null);
  };

  const handleEditSwatch = (swatch: Swatch) => {
    setEditingSwatch(swatch);
  };

  const handleCloneSwatch = async (swatch: Swatch) => {
    try {
      const clonedSwatchData = {
        title: `${swatch.title} (Copy)`,
        description: swatch.description,
        hook_size: swatch.hook_size,
        yarn_used: swatch.yarn_used,
        stitches_per_inch: swatch.stitches_per_inch,
        rows_per_inch: swatch.rows_per_inch,
        notes: swatch.notes,
        user_id: user.id,
      };

      const { data: newSwatch, error: swatchError } = await supabase
        .from('swatches')
        .insert(clonedSwatchData)
        .select()
        .single();

      if (swatchError) throw swatchError;

      // Clone associated images
      const { data: originalImages, error: imagesError } = await supabase
        .from('swatch_images')
        .select('image_url, caption, is_primary')
        .eq('swatch_id', swatch.id);

      if (originalImages && originalImages.length > 0) {
        const imageClones = originalImages.map(img => ({
          swatch_id: newSwatch.id,
          image_url: img.image_url,
          caption: img.caption,
          is_primary: img.is_primary,
        }));

        const { error: imageCloneError } = await supabase
          .from('swatch_images')
          .insert(imageClones);

        if (imageCloneError) {
          console.error('Error cloning swatch images:', imageCloneError);
          // Don't throw here - swatch clone succeeded even if images failed
        }
      }

      toast({
        title: "Success",
        description: "Swatch cloned successfully",
      });

      refetch();
    } catch (error: any) {
      console.error('Error cloning swatch:', error);
      toast({
        title: "Error",
        description: "Failed to clone swatch",
        variant: "destructive",
      });
    }
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

      refetch();
    } catch (error: any) {
      console.error('Error deleting swatch:', error);
      toast({
        title: "Error",
        description: "Failed to delete swatch",
        variant: "destructive",
      });
    }
  };

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
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Swatches</h1>
          <p className="text-gray-600 mt-2">Manage your gauge swatches and samples</p>
        </div>
        <div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Swatch
          </Button>
        </div>
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
