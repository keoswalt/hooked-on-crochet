
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePatternRowsState } from './usePatternRowsState';
import { usePatternRowsFiltering } from './usePatternRowsFiltering';
import { usePatternRowsOperations } from './usePatternRowsOperations';

export const usePatternRows = (patternId: string, mode: 'edit' | 'make') => {
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
  } = usePatternRowsState();

  const processedRows = usePatternRowsFiltering(rows, hideCompleted, mode);

  const fetchRows = async () => {
    try {
      const { data, error } = await supabase
        .from('pattern_rows')
        .select('*')
        .eq('pattern_id', patternId)
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
              .from('pattern_rows')
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
  }, [patternId]);

  const operations = usePatternRowsOperations(
    patternId,
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
