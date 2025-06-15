
import { useMemo } from 'react';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

export const useProjectRowsFiltering = (
  rows: ProjectRow[],
  hideCompleted: boolean,
  mode: 'edit' | 'make'
) => {
  return useMemo(() => {
    // Only filter rows in make mode when hideCompleted is true
    const visibleRows = (mode === 'make' && hideCompleted) 
      ? rows.filter(row => row.make_mode_status !== 'complete')
      : rows;
    
    const inProgressIndex = visibleRows.findIndex(row => row.make_mode_status === 'in_progress');
    const hiddenCount = rows.length - visibleRows.length;
    const hasCompletedRows = rows.some(row => row.make_mode_status === 'complete');
    
    return {
      rows: visibleRows,
      allRows: rows, // Keep reference to all rows for numbering
      inProgressIndex,
      hiddenCount,
      hasCompletedRows
    };
  }, [rows, hideCompleted, mode]);
};
