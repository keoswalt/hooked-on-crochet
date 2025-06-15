
import { useState, useEffect } from 'react';
import { usePatternTagOperations } from '@/hooks/usePatternTagOperations';
import { useTagQueries } from '@/hooks/useTagQueries';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

export const useProjectTags = (patternId: string, userId: string) => {
  const [projectTags, setProjectTags] = useState<Tag[]>([]);
  const { addTagToPattern, removeTagFromPattern } = usePatternTagOperations();
  const { fetchPatternTags } = useTagQueries(userId);

  const fetchProjectTags = async () => {
    if (!patternId) return;
    const tags = await fetchPatternTags(patternId);
    setProjectTags(tags);
  };

  const handleRemoveTag = async (tagId: string) => {
    const success = await removeTagFromPattern(patternId, tagId);
    if (success) {
      await fetchProjectTags();
    }
    return success;
  };

  const addTagToProject = async (tagId: string) => {
    const success = await addTagToPattern(patternId, tagId);
    if (success) {
      await fetchProjectTags();
    }
    return success;
  };

  const refreshTags = async () => {
    await fetchProjectTags();
  };

  useEffect(() => {
    fetchProjectTags();
  }, [patternId, userId]);

  return {
    projectTags,
    handleRemoveTag,
    refreshTags,
    addTagToProject,
    removeTagFromProject: handleRemoveTag,
    fetchProjectTags,
  };
};
