
import { useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePatternRowsState } from './usePatternRowsState';
import { usePatternRowsOperations } from './usePatternRowsOperations';
import type { Database } from '@/integrations/supabase/types';

type PatternRow = Database['public']['Tables']['pattern_rows']['Row'];

export const useProjectRows = (patternId: string, mode: 'edit' | 'make') => {
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

  const fetchRows = async () => {
    try {
      setLoading(true);
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

  // Filter rows for display based on mode and hide settings
  const allRows = rows;
  const filteredRows = useMemo(() => {
    if (mode === 'edit') {
      return rows;
    }
    
    if (hideCompleted) {
      return rows.filter(row => row.make_mode_status !== 'complete');
    }
    
    return rows;
  }, [rows, mode, hideCompleted]);

  // Calculate statistics for make mode
  const completedRows = rows.filter(row => row.make_mode_status === 'complete');
  const hiddenCount = completedRows.length;
  const hasCompletedRows = completedRows.length > 0;
  
  // Find the index of the in-progress row in the filtered list
  const inProgressIndex = filteredRows.findIndex(row => row.make_mode_status === 'in_progress');

  // Row operations
  const addRow = async (insertAfterPosition?: number) => {
    await operations.handleAddRow(insertAfterPosition);
  };

  const addNote = async (insertAfterPosition?: number) => {
    await operations.handleAddNote(insertAfterPosition);
  };

  const addDivider = async (insertAfterPosition?: number) => {
    await operations.handleAddDivider(insertAfterPosition);
  };

  const updateCounter = async (id: string, newCounter: number) => {
    await operations.handleUpdateRow(id, { counter: newCounter });
  };

  const updateInstructions = async (id: string, instructions: string) => {
    await operations.handleUpdateRow(id, { instructions });
  };

  const updateLabel = async (id: string, label: string) => {
    await operations.handleUpdateRow(id, { label });
  };

  const updateTotalStitches = async (id: string, total_stitches: string) => {
    await operations.handleUpdateRow(id, { total_stitches });
  };

  const updateMakeModeCounter = async (id: string, make_mode_counter: number) => {
    await operations.handleUpdateRow(id, { make_mode_counter });
  };

  const updateMakeModeStatus = async (id: string, make_mode_status: string) => {
    // If marking as incomplete, show confirmation dialog
    if (make_mode_status === 'not_started') {
      const row = rows.find(r => r.id === id);
      if (row && row.make_mode_status === 'complete') {
        setConfirmDialog({
          open: true,
          title: "Mark Row as Incomplete?",
          description: "Marking this row as incomplete will also mark all subsequent rows as incomplete and reset their progress. Are you sure you want to continue?",
          onConfirm: async () => {
            await operations.handleUpdateRow(id, { make_mode_status, make_mode_counter: 0 });
            // Also mark subsequent rows as incomplete
            const rowIndex = rows.findIndex(r => r.id === id);
            if (rowIndex !== -1) {
              for (let i = rowIndex + 1; i < rows.length; i++) {
                if (rows[i].type === 'row' || rows[i].type === 'note') {
                  await operations.handleUpdateRow(rows[i].id, { 
                    make_mode_status: 'not_started', 
                    make_mode_counter: 0 
                  });
                }
              }
            }
            await fetchRows();
          }
        });
        return;
      }
    }
    
    await operations.handleUpdateRow(id, { make_mode_status });
  };

  const toggleLock = async (id: string, is_locked: boolean) => {
    await operations.handleUpdateRow(id, { is_locked });
  };

  const duplicateRow = async (rowToDuplicate: PatternRow) => {
    try {
      const { data, error } = await supabase
        .from('pattern_rows')
        .insert({
          pattern_id: patternId,
          type: rowToDuplicate.type,
          instructions: rowToDuplicate.instructions,
          label: rowToDuplicate.label,
          counter: rowToDuplicate.type === 'row' ? rows.filter(r => r.type === 'row').length + 1 : rowToDuplicate.counter,
          position: (rowToDuplicate.position || 0) + 0.1,
          total_stitches: rowToDuplicate.total_stitches,
          is_locked: false,
        })
        .select()
        .single();

      if (error) throw error;

      await operations.reorderPositions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRow = async (id: string) => {
    operations.handleDeleteRow(id);
  };

  const reorderRows = async (sourceIndex: number, destinationIndex: number) => {
    const newRows = Array.from(rows);
    const [reorderedItem] = newRows.splice(sourceIndex, 1);
    newRows.splice(destinationIndex, 0, reorderedItem);

    // Update positions in database
    for (let i = 0; i < newRows.length; i++) {
      await supabase
        .from('pattern_rows')
        .update({ position: i + 1 })
        .eq('id', newRows[i].id);
    }

    setRows(newRows);
  };

  const updateRowImage = async (id: string, imageUrl: string | null) => {
    await operations.handleUpdateRow(id, { image_url: imageUrl });
  };

  return {
    rows: filteredRows,
    allRows,
    loading,
    confirmDialog,
    setConfirmDialog,
    hideCompleted,
    setHideCompleted,
    hiddenCount,
    hasCompletedRows,
    inProgressIndex,
    addRow,
    addNote,
    addDivider,
    updateCounter,
    updateInstructions,
    updateLabel,
    updateTotalStitches,
    updateMakeModeCounter,
    updateMakeModeStatus,
    toggleLock,
    duplicateRow,
    deleteRow,
    reorderRows,
    updateRowImage,
  };
};
