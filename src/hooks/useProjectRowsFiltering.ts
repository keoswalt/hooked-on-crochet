
import { useMemo } from 'react';
import type { Database } from '@/integrations/supabase/types';

type PatternRow = Database['public']['Tables']['pattern_rows']['Row'];

export const useProjectRowsFiltering = (
  rows: PatternRow[],
  hideCompleted: boolean,
  mode: 'edit' | 'make'
) => {
  const editModeRows = useMemo(() => rows, [rows]);

  const makeModeRows = useMemo(() => {
    if (!hideCompleted) return rows;
    return rows.filter(row => row.make_mode_status !== 'completed');
  }, [rows, hideCompleted]);

  const displayedRows = mode === 'edit' ? editModeRows : makeModeRows;

  return {
    editModeRows,
    makeModeRows,
    displayedRows,
  };
};
