
import { useState, useEffect } from 'react';
import { useTagOperations } from './useTagOperations';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

export const useProjectTags = (projectId: string, userId: string) => {
  const [projectTags, setProjectTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { fetchProjectTags, removeTagFromProject } = useTagOperations(userId);

  const loadProjectTags = async () => {
    // Don't make API calls with invalid UUIDs
    if (!projectId || projectId === '') {
      setProjectTags([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const tags = await fetchProjectTags(projectId);
      setProjectTags(tags);
    } catch (error) {
      console.error('Error loading project tags:', error);
      setProjectTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectTags();
  }, [projectId, userId]);

  const handleRemoveTag = async (tagId: string) => {
    if (!projectId || projectId === '') return;
    
    const success = await removeTagFromProject(projectId, tagId);
    if (success) {
      setProjectTags(prev => prev.filter(tag => tag.id !== tagId));
    }
  };

  const refreshTags = () => {
    loadProjectTags();
  };

  return {
    projectTags,
    loading,
    handleRemoveTag,
    refreshTags,
  };
};
