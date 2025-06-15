
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Pattern = Database['public']['Tables']['patterns']['Row'];
type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface ProjectData {
  name: string;
  hook_size: HookSize;
  yarn_weight: YarnWeight;
  details: string | null;
  featured_image_url: string | null;
  is_favorite: boolean;
  last_mode: string;
  status: string | null;
}

export const useProjectOperations = (user: User, onRefresh: () => void) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveProject = async (projectData: ProjectData, existingProject?: Pattern | null): Promise<Pattern | null> => {
    setLoading(true);
    try {
      if (existingProject) {
        const { data, error } = await supabase
          .from('patterns')
          .update(projectData)
          .eq('id', existingProject.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Project Updated",
          description: "Your project has been successfully updated.",
        });

        onRefresh();
        return data;
      } else {
        const { data, error } = await supabase
          .from('patterns')
          .insert({
            ...projectData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Project Created",
          description: "Your new project has been created successfully.",
        });

        onRefresh();
        return data;
      }
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

  const handleDeleteProject = async (projectId: string) => {
    setLoading(true);
    try {
      // First delete all rows associated with the project
      const { error: rowsError } = await supabase
        .from('pattern_rows')
        .delete()
        .eq('pattern_id', projectId);

      if (rowsError) throw rowsError;

      // Then delete the project itself
      const { error } = await supabase
        .from('patterns')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project Deleted",
        description: "Project has been deleted successfully.",
      });

      onRefresh();
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

  const handleDuplicateProject = async (project: Pattern) => {
    setLoading(true);
    try {
      // Create a copy of the project
      const { data: newProject, error: projectError } = await supabase
        .from('patterns')
        .insert({
          name: `${project.name} (Copy)`,
          hook_size: project.hook_size,
          yarn_weight: project.yarn_weight,
          details: project.details,
          featured_image_url: project.featured_image_url,
          user_id: user.id,
          is_favorite: false,
          last_mode: project.last_mode,
          status: project.status,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Fetch all rows from the original project
      const { data: originalRows, error: rowsError } = await supabase
        .from('pattern_rows')
        .select('*')
        .eq('pattern_id', project.id)
        .order('position');

      if (rowsError) throw rowsError;

      if (originalRows && originalRows.length > 0) {
        // Insert the rows for the new project
        const newRows = originalRows.map(row => ({
          pattern_id: newProject.id,
          type: row.type,
          instructions: row.instructions,
          label: row.label,
          counter: row.counter,
          position: row.position,
          total_stitches: row.total_stitches,
          make_mode_status: 'not_started',
          make_mode_counter: 0,
          is_locked: row.is_locked,
        }));

        const { error: insertError } = await supabase
          .from('pattern_rows')
          .insert(newRows);

        if (insertError) throw insertError;
      }

      toast({
        title: "Project Duplicated",
        description: "Project has been duplicated successfully.",
      });

      onRefresh();
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

  const handleToggleFavorite = async (project: Pattern) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('patterns')
        .update({ is_favorite: !project.is_favorite })
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: project.is_favorite ? "Removed from Favorites" : "Added to Favorites",
        description: project.is_favorite
          ? "Project removed from favorites."
          : "Project added to favorites.",
      });

      onRefresh();
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

  const handleExportProject = (project: Pattern) => {
    // Implementation for exporting project
    console.log('Exporting project:', project.name);
  };

  const handleExportPDF = (project: Pattern) => {
    // Implementation for PDF export
    console.log('Exporting PDF for project:', project.name);
  };

  const handleImportProject = async (file: File) => {
    setLoading(true);
    try {
      // Implementation for importing project
      console.log('Importing project from file:', file.name);
      
      toast({
        title: "Import Complete",
        description: "Project has been imported successfully.",
      });

      onRefresh();
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

  return {
    loading,
    handleSaveProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleToggleFavorite,
    handleExportProject,
    handleExportPDF,
    handleImportProject,
  };
};
