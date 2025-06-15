
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sortProjects } from '@/utils/projectSorting';
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
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Apply sorting using the shared utility
      const sortedProjects = sortProjects(data || []);
      setProjects(sortedProjects);
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
    
    // Update the projects array
    setProjects(prev => {
      const updated = prev.map(p => p.id === updatedProject.id ? updatedProject : p);
      // Re-sort after updating to ensure proper order
      return sortProjects(updated);
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
