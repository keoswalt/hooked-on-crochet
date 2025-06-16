import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";

export type Plan = Database['public']['Tables']['plans']['Row'] & {
  featured_image_url?: string | null;
};

const PLANS_PER_PAGE = 9;

interface PlansResult {
  plans: Plan[];
  totalPlans: number;
}

const fetchPlans = async (userId: string, query: string, page: number): Promise<PlansResult> => {
  const offset = (page - 1) * PLANS_PER_PAGE;

  let baseQuery = supabase.from('plans');

  // Count query
  let countQuery = baseQuery
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Data query with join to images
  let dataQuery = baseQuery
    .select('*, plan_images!left(is_featured, image_url)')
    .eq('user_id', userId);

  if (query.trim()) {
    const filter = `name.ilike.%${query}%,description.ilike.%${query}%`;
    countQuery = countQuery.or(filter);
    dataQuery = dataQuery.or(filter);
  }

  // total count
  const { count, error: countError } = await countQuery;
  if (countError) throw countError;

  // paginated data
  const { data: planData, error: dataErr } = await dataQuery
    .order('updated_at', { ascending: false })
    .range(offset, offset + PLANS_PER_PAGE - 1);
  if (dataErr) throw dataErr;

  const plansWithImage: Plan[] = (planData || []).map((plan: any) => ({
    ...plan,
    featured_image_url: Array.isArray(plan.plan_images)
      ? plan.plan_images.find((img: any) => img.is_featured === true)?.image_url
      : null,
  }));

  return { plans: plansWithImage, totalPlans: count || 0 };
};

export const usePlansList = (user: User, search: string, page: number) => {
  return useQuery({
    queryKey: ['plans', user.id, search, page],
    queryFn: () => fetchPlans(user.id, search, page),
    staleTime: 1000 * 60 * 5,
  });
}; 