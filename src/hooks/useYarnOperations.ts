
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];

export const useYarnOperations = (userId: string) => {
  const [yarns, setYarns] = useState<YarnStash[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchYarns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('yarn_stash')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setYarns(data || []);
    } catch (error: any) {
      console.error('Error fetching yarns:', error);
      toast({
        title: "Error",
        description: "Failed to load yarn stash",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYarn = async (yarnId: string) => {
    try {
      const { error } = await supabase
        .from('yarn_stash')
        .delete()
        .eq('id', yarnId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Yarn deleted successfully",
      });

      fetchYarns();
    } catch (error: any) {
      console.error('Error deleting yarn:', error);
      toast({
        title: "Error",
        description: "Failed to delete yarn",
        variant: "destructive",
      });
    }
  };

  return {
    yarns,
    loading,
    fetchYarns,
    handleDeleteYarn,
  };
};
