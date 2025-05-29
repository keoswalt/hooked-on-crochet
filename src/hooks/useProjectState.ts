
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Project = Database['public']['Tables']['projects']['Row'];

export const useProjectState = (user: User) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user.id]);

  const updateProject = (updatedProject: Project) => {
    console.log('Updating project in state:', updatedProject);
    
    // Update the projects array and maintain proper sorting (favorites first)
    setProjects(prev => {
      const updated = prev.map(p => p.id === updatedProject.id ? updatedProject : p);
      return updated.sort((a, b) => {
        // Sort by favorite status first (favorites first)
        if (a.is_favorite !== b.is_favorite) {
          return b.is_favorite ? 1 : -1;
        }
        // Then by updated_at (most recent first)
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
    });
    
    // Update the selected project if it's the same one
    if (selectedProject && selectedProject.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
  };

  return {
    projects,
    selectedProject,
    setSelectedProject,
    loading,
    fetchProjects,
    updateProject,
  };
};
