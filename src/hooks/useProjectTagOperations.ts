
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProjectTagOperations = () => {
  const [loading, setLoading] = useState(false);

  const addTagToProject = async (projectId: string, tagId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('project_tags')
        .insert({ project_id: projectId, tag_id: tagId });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error adding tag to project:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeTagFromProject = async (projectId: string, tagId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('project_tags')
        .delete()
        .eq('project_id', projectId)
        .eq('tag_id', tagId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error removing tag from project:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addTagToProject,
    removeTagFromProject,
  };
};
