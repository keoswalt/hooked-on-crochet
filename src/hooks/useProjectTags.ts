import { usePatternTagOperations } from '@/hooks/usePatternTagOperations';

export const useProjectTags = (patternId: string) => {
  const { addTagToPattern, removeTagFromPattern } = usePatternTagOperations();

  const fetchProjectTags = async () => {
    // Implementation for fetching project tags
  };

  const removeTagFromProject = async (tagId: string) => {
    return await removeTagFromPattern(patternId, tagId);
  };

  return {
    fetchProjectTags,
    removeTagFromProject,
    addTagToProject: (tagId: string) => addTagToPattern(patternId, tagId),
  };
};
