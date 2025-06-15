
import { useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

type PatternRow = Database['public']['Tables']['pattern_rows']['Row'];

interface ConfirmDialog {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}

export const usePatternRowsState = () => {
  const [rows, setRows] = useState<PatternRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  return {
    rows,
    setRows,
    loading,
    setLoading,
    hideCompleted,
    setHideCompleted,
    confirmDialog,
    setConfirmDialog,
  };
};
