
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

export const sortProjects = (projects: Project[]): Project[] => {
  return projects.sort((a, b) => {
    // Sort by favorite status first, then by updated_at
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
};
