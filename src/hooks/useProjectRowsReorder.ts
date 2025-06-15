
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

export const useProjectRowsReorder = (
  projectId: string,
  rows: ProjectRow[],
  setRows: (rows: ProjectRow[]) => void,
  fetchRows: () => Promise<void>
) => {
  const { toast } = useToast();

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

  return { reorderRows };
};
