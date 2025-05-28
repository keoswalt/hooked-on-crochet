import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectRow {
  id: string;
  position: number;
  instructions: string;
  counter: number;
  type: string;
  make_mode_counter: number;
  make_mode_status: string;
  is_locked: boolean;
}

export const useProjectRows = (projectId: string) => {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRows = async () => {
    try {
      const { data, error } = await supabase
        .from('project_rows')
        .select('*')
        .eq('project_id', projectId)
        .order('position');

      if (error) throw error;
      
      // Initialize make mode for new projects
      if (data && data.length > 0) {
        const needsInitialization = data.every(row => row.make_mode_status === 'not_started');
        if (needsInitialization) {
          await initializeMakeMode(data);
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

  const initializeMakeMode = async (rowsData: any[]) => {
    if (rowsData.length === 0) return;
    
    const firstRow = rowsData.find(row => row.type === 'row');
    if (firstRow) {
      await supabase
        .from('project_rows')
        .update({ make_mode_status: 'in_progress' })
        .eq('id', firstRow.id);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [projectId]);

  const addRow = async () => {
    try {
      const newPosition = rows.length + 1;
      const { data, error } = await supabase
        .from('project_rows')
        .insert({
          project_id: projectId,
          position: newPosition,
          instructions: '',
          counter: 1,
          type: 'row',
        })
        .select()
        .single();

      if (error) throw error;
      setRows([...rows, data]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addNote = async () => {
    try {
      const newPosition = rows.length + 1;
      const { data, error } = await supabase
        .from('project_rows')
        .insert({
          project_id: projectId,
          position: newPosition,
          instructions: '',
          counter: 1,
          type: 'note',
        })
        .select()
        .single();

      if (error) throw error;
      setRows([...rows, data]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addDivider = async () => {
    try {
      const newPosition = rows.length + 1;
      const { data, error } = await supabase
        .from('project_rows')
        .insert({
          project_id: projectId,
          position: newPosition,
          instructions: '',
          counter: 1,
          type: 'divider',
        })
        .select()
        .single();

      if (error) throw error;
      setRows([...rows, data]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

        // Find next row and mark as in_progress
        const currentIndex = rows.findIndex(row => row.id === id);
        const nextRow = rows.slice(currentIndex + 1).find(row => row.type === 'row');
        
        if (nextRow) {
          await supabase
            .from('project_rows')
            .update({ make_mode_status: 'in_progress' })
            .eq('id', nextRow.id);
        }
      } else if (currentRow.make_mode_status === 'complete' && status === 'in_progress') {
        // Unchecking a completed row - mark subsequent rows as not_started
        const currentIndex = rows.findIndex(row => row.id === id);
        const subsequentRows = rows.slice(currentIndex + 1);
        
        // Confirm with user
        const confirmUncheck = window.confirm(
          'Marking this row as incomplete will also mark all subsequent rows as incomplete. Are you sure?'
        );
        
        if (!confirmUncheck) return;

        // Update current row
        await supabase
          .from('project_rows')
          .update({ make_mode_status: status })
          .eq('id', id);

        // Update subsequent rows
        for (const row of subsequentRows) {
          if (row.type === 'row') {
            await supabase
              .from('project_rows')
              .update({ 
                make_mode_status: 'not_started',
                make_mode_counter: 0 
              })
              .eq('id', row.id);
          }
        }
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

  const duplicateRow = async (rowToDuplicate: ProjectRow) => {
    try {
      const newPosition = rows.length + 1;
      const { data, error } = await supabase
        .from('project_rows')
        .insert({
          project_id: projectId,
          position: newPosition,
          instructions: rowToDuplicate.instructions,
          counter: rowToDuplicate.type === 'divider' ? 1 : rowToDuplicate.counter,
          type: rowToDuplicate.type,
        })
        .select()
        .single();

      if (error) throw error;
      setRows([...rows, data]);
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
      const { error } = await supabase
        .from('project_rows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      const updatedRows = rows.filter(row => row.id !== id);
      const reorderedRows = updatedRows.map((row, index) => ({
        ...row,
        position: index + 1
      }));
      
      for (const row of reorderedRows) {
        await supabase
          .from('project_rows')
          .update({ position: row.position })
          .eq('id', row.id);
      }
      
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
      for (const row of updatedRows) {
        await supabase
          .from('project_rows')
          .update({ position: row.position })
          .eq('id', row.id);
      }
      
      toast({
        title: "Success",
        description: "Row order updated successfully.",
      });
    } catch (error: any) {
      fetchRows();
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    rows,
    loading,
    addRow,
    addNote,
    addDivider,
    updateCounter,
    updateInstructions,
    updateMakeModeCounter,
    updateMakeModeStatus,
    toggleLock,
    duplicateRow,
    deleteRow,
    reorderRows,
  };
};
