
import { useTagCRUD } from './useTagCRUD';
import { useTagQueries } from './useTagQueries';
import { useProjectTagOperations } from './useProjectTagOperations';

export const useTagOperations = (userId: string) => {
  const tagCRUD = useTagCRUD(userId);
  const tagQueries = useTagQueries(userId);
  const projectTagOps = useProjectTagOperations();

  return {
    loading: tagCRUD.loading || projectTagOps.loading,
    ...tagQueries,
    ...tagCRUD,
    ...projectTagOps,
  };
};
