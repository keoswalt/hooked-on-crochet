
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PatternRow = Database['public']['Tables']['pattern_rows']['Row'];

export const useRowOperations = () => {
  const { toast } = useToast();

  const updateRow = async (rowId: string, updates: Partial<PatternRow>) => {
    try {
      const { error } = await supabase
        .from('pattern_rows')
        .update(updates)
        .eq('id', rowId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteRow = async (rowId: string) => {
    try {
      const { error } = await supabase
        .from('pattern_rows')
        .delete()
        .eq('id', rowId);

      if (error) throw error;
      
      toast({
        title: "Row deleted",
        description: "Row has been deleted successfully.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    updateRow,
    deleteRow,
  };
};
