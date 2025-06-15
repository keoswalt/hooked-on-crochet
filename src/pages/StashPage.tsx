
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
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
import { YarnCard } from '@/components/stash/YarnCard';
import { YarnForm } from '@/components/stash/YarnForm';
import { YarnFilters } from '@/components/stash/YarnFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];

interface StashPageProps {
  user: User;
}

export const StashPage = ({ user }: StashPageProps) => {
  const [yarns, setYarns] = useState<YarnStash[]>([]);
  const [filteredYarns, setFilteredYarns] = useState<YarnStash[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingYarn, setEditingYarn] = useState<YarnStash | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchYarns();
  }, [user.id]);

  useEffect(() => {
    setFilteredYarns(yarns);
  }, [yarns]);

  const fetchYarns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('yarn_stash')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setYarns(data || []);
    } catch (error: any) {
      console.error('Error fetching yarns:', error);
      toast({
        title: "Error",
        description: "Failed to load yarn stash",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleYarnSaved = () => {
    fetchYarns();
    setShowAddDialog(false);
    setEditingYarn(null);
  };

  const handleEditYarn = (yarn: YarnStash) => {
    setEditingYarn(yarn);
  };

  const handleDeleteYarn = async (yarnId: string) => {
    try {
      const { error } = await supabase
        .from('yarn_stash')
        .delete()
        .eq('id', yarnId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Yarn deleted successfully",
      });

      fetchYarns();
    } catch (error: any) {
      console.error('Error deleting yarn:', error);
      toast({
        title: "Error",
        description: "Failed to delete yarn",
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
            <BreadcrumbPage>Stash</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yarn Stash</h1>
          <p className="text-gray-600 mt-2">Manage your yarn collection</p>
        </div>
        <div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Yarn
          </Button>
        </div>
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
            <Button onClick={() => setShowAddDialog(true)}>
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
    </div>
  );
};
