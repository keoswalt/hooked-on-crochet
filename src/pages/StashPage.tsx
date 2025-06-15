
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
import { YarnCard } from '@/components/stash/YarnCard';
import { YarnForm } from '@/components/stash/YarnForm';
import { YarnFilters } from '@/components/stash/YarnFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useYarnOperations } from '@/hooks/useYarnOperations';
import { useYarnDialogs } from '@/hooks/useYarnDialogs';
import { useYarnFiltering } from '@/hooks/useYarnFiltering';
import type { User } from '@supabase/supabase-js';

interface StashPageProps {
  user: User;
}

export const StashPage = ({ user }: StashPageProps) => {
  const navigate = useNavigate();
  
  const { yarns, loading, fetchYarns, handleDeleteYarn } = useYarnOperations(user.id);
  const { 
    showAddDialog, 
    editingYarn, 
    handleYarnSaved, 
    handleEditYarn, 
    openAddDialog, 
    closeAddDialog, 
    closeEditDialog 
  } = useYarnDialogs();
  const { filteredYarns, setFilteredYarns } = useYarnFiltering(yarns);

  useEffect(() => {
    fetchYarns();
  }, [fetchYarns]);

  const handleYarnSavedWithRefresh = () => {
    handleYarnSaved();
    fetchYarns();
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
            <BreadcrumbPage>Stash</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yarn Stash</h1>
          <p className="text-gray-600 mt-2">Manage your yarn collection</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Yarn
        </Button>
      </div>

      {/* Filters */}
      <YarnFilters 
        yarns={yarns} 
        onFilter={setFilteredYarns}
        className="mb-6"
      />

      {/* Yarn Grid */}
      {filteredYarns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {yarns.length === 0 ? "No yarn in your stash yet" : "No yarn matches your filters"}
          </div>
          {yarns.length === 0 && (
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Yarn
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredYarns.map((yarn) => (
            <YarnCard
              key={yarn.id}
              yarn={yarn}
              onEdit={handleEditYarn}
              onDelete={handleDeleteYarn}
            />
          ))}
        </div>
      )}

      {/* Add Yarn Dialog */}
      <Dialog open={showAddDialog} onOpenChange={closeAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Yarn</DialogTitle>
          </DialogHeader>
          <YarnForm
            userId={user.id}
            onSave={handleYarnSavedWithRefresh}
            onCancel={closeAddDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Yarn Dialog */}
      <Dialog open={!!editingYarn} onOpenChange={closeEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Yarn</DialogTitle>
          </DialogHeader>
          {editingYarn && (
            <YarnForm
              userId={user.id}
              yarn={editingYarn}
              onSave={handleYarnSavedWithRefresh}
              onCancel={closeEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
