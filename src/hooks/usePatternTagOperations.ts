
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePatternTagOperations = () => {
  const { toast } = useToast();

  const addTagToPattern = async (patternId: string, tagId: string): Promise<boolean> => {
    try {
      // Check if the tag is already associated with the pattern
      const { data: existing, error: checkError } = await supabase
        .from('pattern_tags')
        .select('id')
        .eq('pattern_id', patternId)
        .eq('tag_id', tagId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        toast({
          title: "Tag already added",
          description: "This tag is already associated with the pattern.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('pattern_tags')
        .insert({ pattern_id: patternId, tag_id: tagId });

      if (error) throw error;

      toast({
        title: "Tag added",
        description: "Tag has been added to the pattern successfully.",
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

  const removeTagFromPattern = async (patternId: string, tagId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pattern_tags')
        .delete()
        .eq('pattern_id', patternId)
        .eq('tag_id', tagId);

      if (error) throw error;

      toast({
        title: "Tag removed",
        description: "Tag has been removed from the pattern successfully.",
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
    addTagToPattern,
    removeTagFromPattern,
  };
};
