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
import { YarnForm } from '@/components/stash/YarnForm';
import { YarnFilters } from '@/components/stash/YarnFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import YarnDisplayCard from '@/components/shared/YarnDisplayCard';
import { useYarnStash } from "@/hooks/useYarnStash";

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];

interface StashPageProps {
  user: User;
}

export const StashPage = ({ user }: StashPageProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingYarn, setEditingYarn] = useState<YarnStash | null>(null);
  const { data: yarns = [], isLoading: loading, refetch } = useYarnStash(user);
  const [filteredYarns, setFilteredYarns] = useState<YarnStash[]>([]);
  const [deletingYarn, setDeletingYarn] = useState<string | null>(null);

  useEffect(() => {
    setFilteredYarns(yarns);
  }, [yarns]);

  const handleEditYarn = (yarn: YarnStash) => {
    setEditingYarn(yarn);
  };

  const handleDeleteYarn = async (yarnId: string) => {
    setDeletingYarn(yarnId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingYarn) return;

    const { error } = await supabase
      .from('yarn_stash')
      .delete()
      .eq('id', deletingYarn);

    if (error) {
      toast({
        title: 'Error deleting yarn',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    await refetch();
    toast({
      title: 'Yarn deleted',
      description: 'The yarn has been removed from your stash.',
    });
    setDeletingYarn(null);
  };

  const handleDuplicateYarn = async (yarn: YarnStash) => {
    // Create a new yarn object without the id and timestamps
    const { id, created_at, updated_at, ...yarnData } = yarn;
    
    const { data, error } = await supabase
      .from('yarn_stash')
      .insert([{ 
        ...yarnData,
        name: `${yarnData.name} (Copy)`,
        user_id: user.id 
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error duplicating yarn',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    await refetch();
    toast({
      title: 'Yarn duplicated',
      description: 'A copy of the yarn has been added to your stash.',
    });
  };

  const handleYarnSaved = async () => {
    await refetch();
    setShowAddDialog(false);
    setEditingYarn(null);
    toast({
      title: editingYarn ? 'Yarn updated' : 'Yarn added',
      description: editingYarn
        ? 'Your yarn has been updated successfully.'
        : 'New yarn has been added to your stash.',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/')}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Yarn Stash</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Yarn Stash</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Yarn
        </Button>
      </div>

      <div className="mb-6">
        <YarnFilters
          yarns={yarns}
          onFilter={setFilteredYarns}
        />
      </div>

      {filteredYarns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {yarns.length === 0 ? "No yarn in your stash yet" : "No yarn matches your filters"}
          </div>
          {yarns.length === 0 && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Yarn
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredYarns.map((yarn) => (
            <YarnDisplayCard
              key={yarn.id}
              yarn={yarn}
              onEdit={handleEditYarn}
              onDelete={handleDeleteYarn}
              onDuplicate={handleDuplicateYarn}
            />
          ))}
        </div>
      )}

      {/* Add Yarn Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Yarn</DialogTitle>
          </DialogHeader>
          <YarnForm
            userId={user.id}
            onSave={handleYarnSaved}
            onCancel={() => setShowAddDialog(false)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deletingYarn}
        onOpenChange={(open) => !open && setDeletingYarn(null)}
        title="Delete Yarn"
        description="Are you sure you want to delete this yarn? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};
