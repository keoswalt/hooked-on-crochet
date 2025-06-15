
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProjectTagOperations = () => {
  const { toast } = useToast();

  const addTagToProject = async (patternId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('pattern_tags')
        .insert({ 
          pattern_id: patternId, 
          tag_id: tagId 
        });

      if (error) throw error;
      
      toast({
        title: "Tag added",
        description: "Tag has been added to the project.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const removeTagFromProject = async (patternId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('pattern_tags')
        .delete()
        .eq('pattern_id', patternId)
        .eq('tag_id', tagId);

      if (error) throw error;
      
      toast({
        title: "Tag removed",
        description: "Tag has been removed from the project.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    addTagToProject,
    removeTagFromProject,
  };
};
