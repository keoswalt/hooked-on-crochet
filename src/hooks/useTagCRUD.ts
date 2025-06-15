
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];

export const useTagCRUD = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createTag = async (name: string): Promise<Tag | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tags')
        .insert({ name: name.trim(), user_id: userId })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Tag created",
        description: `"${name}" has been created successfully.`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTag = async (tagId: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('tags')
        .update({ name: name.trim() })
        .eq('id', tagId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Tag updated",
        description: "Tag name has been updated successfully.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (tagId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // First delete all pattern_tags associations
      await supabase
        .from('pattern_tags')
        .delete()
        .eq('tag_id', tagId);

      // Then delete the tag itself
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Tag deleted",
        description: "Tag has been deleted successfully.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createTag,
    updateTag,
    deleteTag,
  };
};
