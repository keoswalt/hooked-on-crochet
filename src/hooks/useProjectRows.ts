
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectRow {
  id: string;
  position: number;
  instructions: string;
  counter: number;
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

  const duplicateRow = async (rowToDuplicate: ProjectRow) => {
    try {
      const newPosition = rows.length + 1;
      const { data, error } = await supabase
        .from('project_rows')
        .insert({
          project_id: projectId,
          position: newPosition,
          instructions: rowToDuplicate.instructions,
          counter: 1,
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
    updateCounter,
    updateInstructions,
    duplicateRow,
    deleteRow,
    reorderRows,
  };
};
