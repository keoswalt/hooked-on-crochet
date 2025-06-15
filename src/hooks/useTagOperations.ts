
import { useTagCRUD } from './useTagCRUD';
import { useTagQueries } from './useTagQueries';
import { usePatternTagOperations } from './usePatternTagOperations';

export const useTagOperations = (userId: string) => {
  const tagCRUD = useTagCRUD(userId);
  const tagQueries = useTagQueries(userId);
  const patternTagOps = usePatternTagOperations();

  return {
    loading: tagCRUD.loading,
    ...tagQueries,
    ...tagCRUD,
    ...patternTagOps,
  };
};
