
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

export const useTagQueries = (userId: string) => {
  const fetchUserTags = async (): Promise<Tag[]> => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      return [];
    }
  };

  const fetchProjectTags = async (projectId: string): Promise<Tag[]> => {
    try {
      const { data, error } = await supabase
        .from('project_tags')
        .select(`
          tag_id,
          tags (*)
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      return data?.map(pt => pt.tags).filter(Boolean) as Tag[] || [];
    } catch (error: any) {
      console.error('Error fetching project tags:', error);
      return [];
    }
  };

  const getTagUsageCount = async (tagId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('project_tags')
        .select('*', { count: 'exact' })
        .eq('tag_id', tagId);

      if (error) throw error;
      return count || 0;
    } catch (error: any) {
      console.error('Error getting tag usage count:', error);
      return 0;
    }
  };

  return {
    fetchUserTags,
    fetchProjectTags,
    getTagUsageCount,
  };
};
