
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];
type ProjectTag = Database['public']['Tables']['project_tags']['Row'];

export const useTagOperations = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTags = async (): Promise<Tag[]> => {
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
          tags (
            id,
            name,
            user_id,
            created_at
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      return data?.map(pt => pt.tags).filter(Boolean) as Tag[] || [];
    } catch (error: any) {
      console.error('Error fetching project tags:', error);
      return [];
    }
  };

  const createTag = async (name: string): Promise<Tag | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tags')
        .insert({ name, user_id: userId })
        .select()
        .single();

      if (error) throw error;
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

  const addTagToProject = async (projectId: string, tagId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_tags')
        .insert({ project_id: projectId, tag_id: tagId });

      if (error) throw error;
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

  const removeTagFromProject = async (projectId: string, tagId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_tags')
        .delete()
        .eq('project_id', projectId)
        .eq('tag_id', tagId);

      if (error) throw error;
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

  const deleteTag = async (tagId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
      
      toast({
        title: "Tag deleted",
        description: "The tag has been removed from all projects.",
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
    fetchTags,
    fetchProjectTags,
    createTag,
    addTagToProject,
    removeTagFromProject,
    deleteTag,
  };
};
