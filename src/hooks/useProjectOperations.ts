
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

export const useProjectOperations = (user: any, fetchProjects: () => Promise<void>) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>, editingProject?: Project | null) => {
    try {
      setLoading(true);
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast({
          title: "Project updated",
          description: "Your project has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({
            ...projectData,
            user_id: user!.id,
          });

        if (error) throw error;
        toast({
          title: "Project created",
          description: "Your new project has been created successfully.",
        });
      }

      await fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });
      await fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    try {
      setLoading(true);
      // Create new project with same basic info but reset progress
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: `${project.name} (Copy)`,
          hook_size: project.hook_size,
          yarn_weight: project.yarn_weight,
          details: project.details,
          user_id: user!.id,
          is_favorite: false,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Get original project rows (only edit mode data)
      const { data: originalRows, error: rowsError } = await supabase
        .from('project_rows')
        .select('type, position, instructions, counter')
        .eq('project_id', project.id)
        .order('position');

      if (rowsError) throw rowsError;

      // Insert rows with only edit mode data, reset make mode data
      if (originalRows && originalRows.length > 0) {
        const rowsToInsert = originalRows.map(row => ({
          project_id: newProject.id,
          type: row.type,
          position: row.position,
          instructions: row.instructions,
          counter: row.counter,
          make_mode_counter: 0,
          make_mode_status: 'not_started',
          is_locked: false,
        }));

        const { error: insertError } = await supabase
          .from('project_rows')
          .insert(rowsToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Project duplicated",
        description: "Your project has been duplicated successfully.",
      });
      await fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_favorite: isFavorite })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: isFavorite ? "Added to favorites" : "Removed from favorites",
        description: `Project has been ${isFavorite ? 'added to' : 'removed from'} your favorites.`,
      });
      
      await fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    loading,
    handleSaveProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleToggleFavorite,
  };
};
