
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Tag = Database['public']['Tables']['tags']['Row'];
type ProjectTag = Database['public']['Tables']['project_tags']['Row'];

export const useTagOperations = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserTags = async (): Promise<Tag[]> => {
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
          tags (*)
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
      
      // First delete all project_tags associations
      await supabase
        .from('project_tags')
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

  const getTagUsageCount = async (tagId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('project_tags')
        .select('*', { count: 'exact' })
        .eq('tag_id', tagId);

      if (error) throw error;
      return count || 0;
    } catch (error: any) {
      console.error('Error getting tag usage count:', error);
      return 0;
    }
  };

  return {
    loading,
    fetchUserTags,
    fetchProjectTags,
    createTag,
    updateTag,
    deleteTag,
    addTagToProject,
    removeTagFromProject,
    getTagUsageCount,
  };
};
