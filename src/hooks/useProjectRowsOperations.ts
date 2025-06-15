import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRowOperations } from './useRowOperations';
import { useImageOperations } from './useImageOperations';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

export const useProjectRowsOperations = (
  projectId: string,
  rows: ProjectRow[],
  setRows: (rows: ProjectRow[]) => void,
  setConfirmDialog: (dialog: { open: boolean; onConfirm: () => void }) => void,
  fetchRows: () => Promise<void>
) => {
  const { toast } = useToast();
  const { addRow: addRowOperation, addNote: addNoteOperation, addDivider: addDividerOperation, duplicateRow: duplicateRowOperation, updateRowImage: updateRowImageOperation } = useRowOperations();
  const { deleteImage } = useImageOperations();

  const addRow = async (insertAfterPosition?: number) => {
    try {
      const data = await addRowOperation(projectId, rows.length, insertAfterPosition);
      
      if (insertAfterPosition !== undefined) {
        // Refresh the entire list to get updated positions
        await fetchRows();
      } else {
        setRows([...rows, data]);
      }
    } catch (error) {
      // Error already handled in useRowOperations
    }
  };

  const addNote = async (insertAfterPosition?: number) => {
    try {
      const data = await addNoteOperation(projectId, rows.length, insertAfterPosition);
      
      if (insertAfterPosition !== undefined) {
        // Refresh the entire list to get updated positions
        await fetchRows();
      } else {
        setRows([...rows, data]);
      }
    } catch (error) {
      // Error already handled in useRowOperations
    }
  };

  const addDivider = async (insertAfterPosition?: number) => {
    try {
      const data = await addDividerOperation(projectId, rows.length, insertAfterPosition);
      
      if (insertAfterPosition !== undefined) {
        // Refresh the entire list to get updated positions
        await fetchRows();
      } else {
        setRows([...rows, data]);
      }
    } catch (error) {
      // Error already handled in useRowOperations
    }
  };

  const duplicateRow = async (rowToDuplicate: ProjectRow) => {
    try {
      const data = await duplicateRowOperation(rowToDuplicate, rows.length);
      setRows([...rows, data]);
    } catch (error) {
      // Error already handled in useRowOperations
    }
  };

  const updateCounter = async (id: string, newCounter: number) => {
    try {
      const { error } = await supabase
        .from('project_rows')
        .update({ counter: newCounter })
        .eq('id', id);

      if (error) throw error;
      setRows(rows.map(row => row.id === id ? { ...row, counter: newCounter } : row));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateInstructions = async (id: string, instructions: string) => {
    try {
      const { error } = await supabase
        .from('project_rows')
        .update({ instructions })
        .eq('id', id);

      if (error) throw error;
      setRows(rows.map(row => row.id === id ? { ...row, instructions } : row));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateLabel = async (id: string, label: string) => {
    try {
      const { error } = await supabase
        .from('project_rows')
        .update({ label })
        .eq('id', id);

      if (error) throw error;
      setRows(rows.map(row => row.id === id ? { ...row, label } : row));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateTotalStitches = async (id: string, totalStitches: string) => {
    try {
      const { error } = await supabase
        .from('project_rows')
        .update({ total_stitches: totalStitches })
        .eq('id', id);

      if (error) throw error;
      setRows(rows.map(row => row.id === id ? { ...row, total_stitches: totalStitches } : row));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateMakeModeCounter = async (id: string, newCounter: number) => {
    try {
      const { error } = await supabase
        .from('project_rows')
        .update({ make_mode_counter: newCounter })
        .eq('id', id);

      if (error) throw error;
      setRows(rows.map(row => row.id === id ? { ...row, make_mode_counter: newCounter } : row));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateMakeModeStatus = async (id: string, status: string) => {
    try {
      const currentRow = rows.find(row => row.id === id);
      if (!currentRow) return;

      if (status === 'complete') {
        // Mark current row as complete
        await supabase
          .from('project_rows')
          .update({ make_mode_status: status })
          .eq('id', id);

        // Find next row or note (skip dividers) and mark as in_progress
        const currentIndex = rows.findIndex(row => row.id === id);
        const nextRowOrNote = rows.slice(currentIndex + 1).find(row => row.type === 'row' || row.type === 'note');
        
        if (nextRowOrNote) {
          await supabase
            .from('project_rows')
            .update({ make_mode_status: 'in_progress' })
            .eq('id', nextRowOrNote.id);
        }
      } else if (currentRow.make_mode_status === 'complete' && status === 'in_progress') {
        // Show confirmation dialog for unchecking completed row
        setConfirmDialog({
          open: true,
          onConfirm: async () => {
            const currentIndex = rows.findIndex(row => row.id === id);
            const subsequentRows = rows.slice(currentIndex + 1);
            
            // Update current row - reset counter when unchecking
            await supabase
              .from('project_rows')
              .update({ 
                make_mode_status: status,
                make_mode_counter: 0  // Reset counter when marking as incomplete
              })
              .eq('id', id);

            // Update subsequent rows (only rows and notes, not dividers)
            for (const row of subsequentRows) {
              if (row.type === 'row' || row.type === 'note') {
                await supabase
                  .from('project_rows')
                  .update({ 
                    make_mode_status: 'not_started',
                    make_mode_counter: 0 
                  })
                  .eq('id', row.id);
              }
            }
            
            fetchRows(); // Refresh to get updated state
          }
        });
        return; // Don't proceed until user confirms
      } else {
        await supabase
          .from('project_rows')
          .update({ make_mode_status: status })
          .eq('id', id);
      }

      fetchRows(); // Refresh to get updated state
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleLock = async (id: string, isLocked: boolean) => {
    try {
      const { error } = await supabase
        .from('project_rows')
        .update({ is_locked: isLocked })
        .eq('id', id);

      if (error) throw error;
      setRows(rows.map(row => row.id === id ? { ...row, is_locked: isLocked } : row));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRow = async (id: string) => {
    try {
      // Get the row to check for image
      const rowToDelete = rows.find(row => row.id === id);
      
      // Start image deletion in background (don't await)
      if (rowToDelete?.image_url) {
        deleteImage(rowToDelete.image_url).catch(error => {
          console.error('Background image deletion failed:', error);
        });
      }

      // Delete the row first
      const { error } = await supabase
        .from('project_rows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Get updated rows and calculate new positions
      const updatedRows = rows.filter(row => row.id !== id);
      const reorderedRows = updatedRows.map((row, index) => ({
        ...row,
        position: index + 1
      }));
      
      // Batch update all positions using Promise.all for parallel execution
      if (reorderedRows.length > 0) {
        const updatePromises = reorderedRows.map(row => 
          supabase
            .from('project_rows')
            .update({ position: row.position })
            .eq('id', row.id)
        );
        
        const results = await Promise.all(updatePromises);
        const updateError = results.find(result => result.error);
        if (updateError?.error) throw updateError.error;
      }
      
      // Update local state immediately
      setRows(reorderedRows);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const reorderRows = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;

    const reorderedRows = [...rows];
    const [removed] = reorderedRows.splice(sourceIndex, 1);
    reorderedRows.splice(destinationIndex, 0, removed);

    const updatedRows = reorderedRows.map((row, index) => ({
      ...row,
      position: index + 1
    }));

    setRows(updatedRows);

    try {
      // Update positions in database
      for (const row of updatedRows) {
        await supabase
          .from('project_rows')
          .update({ position: row.position })
          .eq('id', row.id);
      }
      
      // Reset make mode progress when rows are reordered
      // First, reset all rows to not_started and counter to 0
      await supabase
        .from('project_rows')
        .update({ 
          make_mode_status: 'not_started',
          make_mode_counter: 0 
        })
        .eq('project_id', projectId);

      // Then set the first row/note (by position) to in_progress
      const firstRowOrNote = updatedRows.find(row => row.type === 'row' || row.type === 'note');
      if (firstRowOrNote) {
        await supabase
          .from('project_rows')
          .update({ make_mode_status: 'in_progress' })
          .eq('id', firstRowOrNote.id);
      }
      
      toast({
        title: "Success",
        description: "Row order updated successfully. Make mode progress has been reset.",
      });
      
      // Refresh data to get updated make mode status
      fetchRows();
    } catch (error: any) {
      fetchRows();
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateRowImage = async (id: string, imageUrl: string | null) => {
    try {
      await updateRowImageOperation(id, imageUrl);
      setRows(rows.map(row => row.id === id ? { ...row, image_url: imageUrl } : row));
    } catch (error) {
      // Error already handled in useRowOperations
    }
  };

  return {
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
