
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageOperations } from './useImageOperations';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

export const useProjectRowsDelete = (
  rows: ProjectRow[],
  setRows: (rows: ProjectRow[]) => void
) => {
  const { toast } = useToast();
  const { deleteImage } = useImageOperations();

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

  return { deleteRow };
};
