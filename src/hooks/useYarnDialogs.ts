
import { useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];

export const useYarnDialogs = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingYarn, setEditingYarn] = useState<YarnStash | null>(null);

  const handleYarnSaved = () => {
    setShowAddDialog(false);
    setEditingYarn(null);
  };

  const handleEditYarn = (yarn: YarnStash) => {
    setEditingYarn(yarn);
  };

  const openAddDialog = () => setShowAddDialog(true);
  const closeAddDialog = () => setShowAddDialog(false);
  const closeEditDialog = () => setEditingYarn(null);

  return {
    showAddDialog,
    editingYarn,
    handleYarnSaved,
    handleEditYarn,
    openAddDialog,
    closeAddDialog,
    closeEditDialog,
  };
};
