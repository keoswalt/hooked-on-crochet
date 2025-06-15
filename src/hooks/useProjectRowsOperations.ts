
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PatternRow = Database['public']['Tables']['pattern_rows']['Row'];

interface ConfirmDialog {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}

export const useProjectRowsOperations = (
  projectId: string,
  rows: PatternRow[],
  setRows: (rows: PatternRow[]) => void,
  setConfirmDialog: (dialog: ConfirmDialog) => void,
  fetchRows: () => Promise<void>
) => {
  const { toast } = useToast();

  const handleAddRow = useCallback(async (insertAfterPosition?: number) => {
    try {
      let position: number;
      let counter: number;

      if (insertAfterPosition !== undefined) {
        // Insert after specific position
        position = insertAfterPosition + 0.5;
        // Calculate counter based on position in the list
        const rowsAtOrBeforePosition = rows.filter(r => 
          r.type === 'row' && (r.position || 0) <= insertAfterPosition
        ).length;
        counter = rowsAtOrBeforePosition + 1;
      } else {
        // Add at the end
        const maxPosition = Math.max(...rows.map(r => r.position || 0), -1);
        position = maxPosition + 1;
        counter = rows.filter(r => r.type === 'row').length + 1;
      }

      const { data, error } = await supabase
        .from('pattern_rows')
        .insert({
          pattern_id: projectId,
          type: 'row',
          instructions: '',
          label: '',
          counter: counter,
          position: position,
        })
        .select()
        .single();

      if (error) throw error;

      // If we inserted in the middle, reorder positions
      if (insertAfterPosition !== undefined) {
        await reorderPositions();
      } else {
        setRows([...rows, data]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [projectId, rows, setRows, toast]);

  const handleAddNote = useCallback(async (insertAfterPosition?: number) => {
    try {
      let position: number;

      if (insertAfterPosition !== undefined) {
        position = insertAfterPosition + 0.5;
      } else {
        const maxPosition = Math.max(...rows.map(r => r.position || 0), -1);
        position = maxPosition + 1;
      }

      const { data, error } = await supabase
        .from('pattern_rows')
        .insert({
          pattern_id: projectId,
          type: 'note',
          instructions: '',
          position: position,
        })
        .select()
        .single();

      if (error) throw error;

      // If we inserted in the middle, reorder positions
      if (insertAfterPosition !== undefined) {
        await reorderPositions();
      } else {
        setRows([...rows, data]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [projectId, rows, setRows, toast]);

  const handleAddDivider = useCallback(async (insertAfterPosition?: number) => {
    try {
      let position: number;

      if (insertAfterPosition !== undefined) {
        position = insertAfterPosition + 0.5;
      } else {
        const maxPosition = Math.max(...rows.map(r => r.position || 0), -1);
        position = maxPosition + 1;
      }

      const { data, error } = await supabase
        .from('pattern_rows')
        .insert({
          pattern_id: projectId,
          type: 'divider',
          instructions: '--- Divider ---',
          position: position,
        })
        .select()
        .single();

      if (error) throw error;

      // If we inserted in the middle, reorder positions
      if (insertAfterPosition !== undefined) {
        await reorderPositions();
      } else {
        setRows([...rows, data]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [projectId, rows, setRows, toast]);

  const reorderPositions = useCallback(async () => {
    try {
      const sortedRows = [...rows].sort((a, b) => (a.position || 0) - (b.position || 0));
      const updates = sortedRows.map((row, index) => ({
        id: row.id,
        position: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('pattern_rows')
          .update({ position: update.position })
          .eq('id', update.id);
      }

      await fetchRows();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [rows, fetchRows, toast]);

  const handleUpdateRow = useCallback(async (rowId: string, updates: Partial<PatternRow>) => {
    try {
      const { error } = await supabase
        .from('pattern_rows')
        .update(updates)
        .eq('id', rowId);

      if (error) throw error;

      setRows(rows.map(row => 
        row.id === rowId ? { ...row, ...updates } : row
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [rows, setRows, toast]);

  const handleDeleteRow = useCallback((rowId: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    setConfirmDialog({
      open: true,
      title: `Delete ${row.type}`,
      description: `Are you sure you want to delete this ${row.type}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('pattern_rows')
            .delete()
            .eq('id', rowId);

          if (error) throw error;

          setRows(rows.filter(r => r.id !== rowId));
          
          toast({
            title: "Deleted",
            description: `${row.type} has been deleted.`,
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    });
  }, [rows, setRows, setConfirmDialog, toast]);

  const handleMoveRow = useCallback(async (rowId: string, direction: 'up' | 'down') => {
    const sortedRows = [...rows].sort((a, b) => (a.position || 0) - (b.position || 0));
    const currentIndex = sortedRows.findIndex(r => r.id === rowId);
    
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sortedRows.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentRow = sortedRows[currentIndex];
    const targetRow = sortedRows[newIndex];

    try {
      const { error } = await supabase
        .from('pattern_rows')
        .update({ position: targetRow.position })
        .eq('id', currentRow.id);

      if (error) throw error;

      const { error: error2 } = await supabase
        .from('pattern_rows')
        .update({ position: currentRow.position })
        .eq('id', targetRow.id);

      if (error2) throw error2;

      await fetchRows();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [rows, fetchRows, toast]);

  const handleResetProgress = useCallback(() => {
    setConfirmDialog({
      open: true,
      title: "Reset Progress",
      description: "Are you sure you want to reset all progress? This will mark all rows as not started.",
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('pattern_rows')
            .update({ 
              make_mode_status: 'not_started',
              make_mode_counter: 0 
            })
            .eq('pattern_id', projectId);

          if (error) throw error;

          await fetchRows();
          
          toast({
            title: "Progress Reset",
            description: "All progress has been reset.",
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    });
  }, [projectId, fetchRows, setConfirmDialog, toast]);

  const handleCompleteRow = useCallback(async (rowId: string) => {
    await handleUpdateRow(rowId, { make_mode_status: 'completed' });
  }, [handleUpdateRow]);

  const handleUncompleteRow = useCallback(async (rowId: string) => {
    await handleUpdateRow(rowId, { make_mode_status: 'not_started' });
  }, [handleUpdateRow]);

  const handleMarkInProgress = useCallback(async (rowId: string) => {
    await handleUpdateRow(rowId, { make_mode_status: 'in_progress' });
  }, [handleUpdateRow]);

  return {
    handleAddRow,
    handleAddNote,
    handleAddDivider,
    handleUpdateRow,
    handleDeleteRow,
    handleMoveRow,
    handleResetProgress,
    handleCompleteRow,
    handleUncompleteRow,
    handleMarkInProgress,
    reorderPositions,
  };
};
