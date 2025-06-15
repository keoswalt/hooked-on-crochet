
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

export const useProjectRowsMakeMode = (
  rows: ProjectRow[],
  setRows: (rows: ProjectRow[]) => void,
  setConfirmDialog: (dialog: { open: boolean; onConfirm: () => void }) => void,
  fetchRows: () => Promise<void>
) => {
  const { toast } = useToast();

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

  return {
    updateMakeModeCounter,
    updateMakeModeStatus,
  };
};
