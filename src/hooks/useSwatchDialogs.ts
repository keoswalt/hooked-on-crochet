
import { useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

type Swatch = Database['public']['Tables']['swatches']['Row'];

export const useSwatchDialogs = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSwatch, setEditingSwatch] = useState<Swatch | null>(null);

  const handleSwatchSaved = () => {
    setShowAddDialog(false);
    setEditingSwatch(null);
  };

  const handleEditSwatch = (swatch: Swatch) => {
    setEditingSwatch(swatch);
  };

  const openAddDialog = () => setShowAddDialog(true);
  const closeAddDialog = () => setShowAddDialog(false);
  const closeEditDialog = () => setEditingSwatch(null);

  return {
    showAddDialog,
    editingSwatch,
    handleSwatchSaved,
    handleEditSwatch,
    openAddDialog,
    closeAddDialog,
    closeEditDialog,
  };
};
