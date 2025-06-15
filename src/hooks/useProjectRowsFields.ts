
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

export const useProjectRowsFields = (
  rows: ProjectRow[],
  setRows: (rows: ProjectRow[]) => void
) => {
  const { toast } = useToast();

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

  return {
    updateCounter,
    updateInstructions,
    updateLabel,
    updateTotalStitches,
    toggleLock,
  };
};
