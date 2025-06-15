
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProjectRowsState } from './useProjectRowsState';
import { useProjectRowsFiltering } from './useProjectRowsFiltering';
import { useProjectRowsOperations } from './useProjectRowsOperations';

export const useProjectRows = (projectId: string, mode: 'edit' | 'make') => {
  const { toast } = useToast();
  const {
    rows,
    setRows,
    loading,
    setLoading,
    hideCompleted,
    setHideCompleted,
    confirmDialog,
    setConfirmDialog,
  } = useProjectRowsState();

  const processedRows = useProjectRowsFiltering(rows, hideCompleted, mode);

  const fetchRows = async () => {
    try {
      const { data, error } = await supabase
        .from('project_rows')
        .select('*')
        .eq('project_id', projectId)
        .order('position');

      if (error) throw error;
      
      // Initialize make mode - ensure first row/note by POSITION is in_progress
      if (data && data.length > 0) {
        const hasInProgress = data.some(row => row.make_mode_status === 'in_progress');
        if (!hasInProgress) {
          // Find first row or note by position (data is already ordered by position)
          const firstRowOrNote = data.find(row => row.type === 'row' || row.type === 'note');
          if (firstRowOrNote) {
            const { error: updateError } = await supabase
              .from('project_rows')
              .update({ make_mode_status: 'in_progress' })
              .eq('id', firstRowOrNote.id);
            
            if (updateError) throw updateError;
            
            // Update local data to reflect the change
            const updatedData = data.map(row => 
              row.id === firstRowOrNote.id 
                ? { ...row, make_mode_status: 'in_progress' as const }
                : row
            );
            setRows(updatedData);
            setLoading(false);
            return;
          }
        }
      }
      
      setRows(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [projectId]);

  const operations = useProjectRowsOperations(
    projectId,
    rows,
    setRows,
    setConfirmDialog,
    fetchRows
  );

  return {
    ...processedRows,
    loading,
    hideCompleted,
    setHideCompleted,
    confirmDialog,
    setConfirmDialog,
    ...operations,
  };
};
