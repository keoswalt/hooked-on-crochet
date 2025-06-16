import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";

export type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];

const fetchYarns = async (userId: string): Promise<YarnStash[]> => {
  const { data, error } = await supabase
    .from('yarn_stash')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const useYarnStash = (user: User) => {
  return useQuery({
    queryKey: ['yarn_stash', user.id],
    queryFn: () => fetchYarns(user.id),
    staleTime: 1000 * 60 * 10,
  });
}; 