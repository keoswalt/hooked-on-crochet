
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
import { useSwatchOperations } from '@/hooks/useSwatchOperations';
import { useSwatchDialogs } from '@/hooks/useSwatchDialogs';
import { useSwatchFiltering } from '@/hooks/useSwatchFiltering';
import type { User } from '@supabase/supabase-js';

interface SwatchesPageProps {
  user: User;
}

export const SwatchesPage = ({ user }: SwatchesPageProps) => {
  const navigate = useNavigate();
  
  const { swatches, loading, fetchSwatches, handleCloneSwatch, handleDeleteSwatch } = useSwatchOperations(user.id);
  const { 
    showAddDialog, 
    editingSwatch, 
    handleSwatchSaved, 
    handleEditSwatch, 
    openAddDialog, 
    closeAddDialog, 
    closeEditDialog 
  } = useSwatchDialogs();
  const { filteredSwatches, setFilteredSwatches } = useSwatchFiltering(swatches);

  useEffect(() => {
    fetchSwatches();
  }, [fetchSwatches]);

  const handleSwatchSavedWithRefresh = () => {
    handleSwatchSaved();
    fetchSwatches();
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
        <Button onClick={openAddDialog}>
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
            <Button onClick={openAddDialog}>
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
      <Dialog open={showAddDialog} onOpenChange={closeAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Swatch</DialogTitle>
          </DialogHeader>
          <SwatchForm
            userId={user.id}
            onSave={handleSwatchSavedWithRefresh}
            onCancel={closeAddDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Swatch Dialog */}
      <Dialog open={!!editingSwatch} onOpenChange={closeEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Swatch</DialogTitle>
          </DialogHeader>
          {editingSwatch && (
            <SwatchForm
              userId={user.id}
              swatch={editingSwatch}
              onSave={handleSwatchSavedWithRefresh}
              onCancel={closeEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
