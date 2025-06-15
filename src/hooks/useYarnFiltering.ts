
import { useState, useEffect } from 'react';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];

export const useYarnFiltering = (yarns: YarnStash[]) => {
  const [filteredYarns, setFilteredYarns] = useState<YarnStash[]>([]);

  useEffect(() => {
    setFilteredYarns(yarns);
  }, [yarns]);

  return {
    filteredYarns,
    setFilteredYarns,
  };
};
