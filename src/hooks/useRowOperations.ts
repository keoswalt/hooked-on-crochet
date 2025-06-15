
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
        // Insert after the specified position - ensure insertAfterPosition is a number
        newPosition = Number(insertAfterPosition) + 1;
        
        // First, get all rows that need to be shifted
        const { data: rowsToUpdate, error: fetchError } = await supabase
          .from('project_rows')
          .select('id, position')
          .eq('project_id', projectId)
          .gte('position', newPosition)
          .order('position', { ascending: true });

        if (fetchError) throw fetchError;

        // Update each row's position
        if (rowsToUpdate && rowsToUpdate.length > 0) {
          const updates = rowsToUpdate.map(row => 
            supabase
              .from('project_rows')
              .update({ position: row.position + 1 })
              .eq('id', row.id)
          );

          const results = await Promise.all(updates);
          const updateError = results.find(result => result.error);
          if (updateError?.error) throw updateError.error;
        }
      } else {
        // Add at the end - ensure rowsLength is a number
        newPosition = Number(rowsLength) + 1;
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
        // Insert after the specified position - ensure insertAfterPosition is a number
        newPosition = Number(insertAfterPosition) + 1;
        
        // First, get all rows that need to be shifted
        const { data: rowsToUpdate, error: fetchError } = await supabase
          .from('project_rows')
          .select('id, position')
          .eq('project_id', projectId)
          .gte('position', newPosition)
          .order('position', { ascending: true });

        if (fetchError) throw fetchError;

        // Update each row's position
        if (rowsToUpdate && rowsToUpdate.length > 0) {
          const updates = rowsToUpdate.map(row => 
            supabase
              .from('project_rows')
              .update({ position: row.position + 1 })
              .eq('id', row.id)
          );

          const results = await Promise.all(updates);
          const updateError = results.find(result => result.error);
          if (updateError?.error) throw updateError.error;
        }
      } else {
        // Add at the end - ensure rowsLength is a number
        newPosition = Number(rowsLength) + 1;
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
        // Insert after the specified position - ensure insertAfterPosition is a number
        newPosition = Number(insertAfterPosition) + 1;
        
        // First, get all rows that need to be shifted
        const { data: rowsToUpdate, error: fetchError } = await supabase
          .from('project_rows')
          .select('id, position')
          .eq('project_id', projectId)
          .gte('position', newPosition)
          .order('position', { ascending: true });

        if (fetchError) throw fetchError;

        // Update each row's position
        if (rowsToUpdate && rowsToUpdate.length > 0) {
          const updates = rowsToUpdate.map(row => 
            supabase
              .from('project_rows')
              .update({ position: row.position + 1 })
              .eq('id', row.id)
          );

          const results = await Promise.all(updates);
          const updateError = results.find(result => result.error);
          if (updateError?.error) throw updateError.error;
        }
      } else {
        // Add at the end - ensure rowsLength is a number
        newPosition = Number(rowsLength) + 1;
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
      // Ensure rowsLength is a number
      const newPosition = Number(rowsLength) + 1;
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
