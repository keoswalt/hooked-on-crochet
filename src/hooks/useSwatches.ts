import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";

export type Swatch = Database['public']['Tables']['swatches']['Row'];

const fetchSwatches = async (userId: string): Promise<Swatch[]> => {
  const { data, error } = await supabase
    .from('swatches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const useSwatches = (user: User) => {
  return useQuery({
    queryKey: ['swatches', user.id],
    queryFn: () => fetchSwatches(user.id),
    staleTime: 1000 * 60 * 10,
  });
}; 