
import { useState, useEffect } from 'react';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

const HIDE_COMPLETED_STORAGE_KEY = 'project-rows:hide-completed';

const getInitialHideCompleted = () => {
  try {
    const stored = localStorage.getItem(HIDE_COMPLETED_STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  } catch (e) {
    // In case localStorage is not available
    return true;
  }
};

export const useProjectRowsState = () => {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideCompleted, setHideCompleted] = useState(getInitialHideCompleted);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    onConfirm: () => void;
  }>({ open: false, onConfirm: () => {} });

  // Save hideCompleted preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HIDE_COMPLETED_STORAGE_KEY, hideCompleted.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [hideCompleted]);

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
