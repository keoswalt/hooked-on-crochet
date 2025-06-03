
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

export const useRowOperations = () => {
  const { toast } = useToast();

  const addRow = async (projectId: string, rowsLength: number, insertAfterPosition?: number) => {
    try {
      let newPosition: number;
      
      if (insertAfterPosition !== undefined) {
        // Insert after the specified position
        newPosition = insertAfterPosition + 1;
        
        // First, increment positions of all rows that come after the insert position
        await supabase
          .from('project_rows')
          .update({ position: supabase.sql`position + 1` })
          .eq('project_id', projectId)
          .gt('position', insertAfterPosition);
      } else {
        // Add at the end
        newPosition = rowsLength + 1;
      }

      const { data, error } = await supabase
        .from('project_rows')
        .insert({
          project_id: projectId,
          position: newPosition,
          instructions: '',
          counter: 1,
          type: 'row',
          total_stitches: '',
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "New row added successfully.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const addNote = async (projectId: string, rowsLength: number, insertAfterPosition?: number) => {
    try {
      let newPosition: number;
      
      if (insertAfterPosition !== undefined) {
        // Insert after the specified position
        newPosition = insertAfterPosition + 1;
        
        // First, increment positions of all rows that come after the insert position
        await supabase
          .from('project_rows')
          .update({ position: supabase.sql`position + 1` })
          .eq('project_id', projectId)
          .gt('position', insertAfterPosition);
      } else {
        // Add at the end
        newPosition = rowsLength + 1;
      }

      const { data, error } = await supabase
        .from('project_rows')
        .insert({
          project_id: projectId,
          position: newPosition,
          instructions: '',
          counter: 1,
          type: 'note',
          total_stitches: '',
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "New note added successfully.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const addDivider = async (projectId: string, rowsLength: number, insertAfterPosition?: number) => {
    try {
      let newPosition: number;
      
      if (insertAfterPosition !== undefined) {
        // Insert after the specified position
        newPosition = insertAfterPosition + 1;
        
        // First, increment positions of all rows that come after the insert position
        await supabase
          .from('project_rows')
          .update({ position: supabase.sql`position + 1` })
          .eq('project_id', projectId)
          .gt('position', insertAfterPosition);
      } else {
        // Add at the end
        newPosition = rowsLength + 1;
      }

      const { data, error } = await supabase
        .from('project_rows')
        .insert({
          project_id: projectId,
          position: newPosition,
          instructions: '',
          counter: 1,
          type: 'divider',
          total_stitches: '',
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "New divider added successfully.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const duplicateRow = async (rowToDuplicate: ProjectRow, rowsLength: number) => {
    try {
      const newPosition = rowsLength + 1;
      const { data, error } = await supabase
        .from('project_rows')
        .insert({
          project_id: rowToDuplicate.project_id,
          position: newPosition,
          instructions: rowToDuplicate.instructions,
          counter: rowToDuplicate.type === 'divider' ? 1 : rowToDuplicate.counter,
          type: rowToDuplicate.type,
          total_stitches: rowToDuplicate.total_stitches,
          image_url: rowToDuplicate.image_url, // Include image when duplicating
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateRowImage = async (rowId: string, imageUrl: string | null) => {
    try {
      const { error } = await supabase
        .from('project_rows')
        .update({ image_url: imageUrl })
        .eq('id', rowId);

      if (error) throw error;

      toast({
        title: "Success",
        description: imageUrl ? "Image added successfully." : "Image removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    addRow,
    addNote,
    addDivider,
    duplicateRow,
    updateRowImage,
  };
};
