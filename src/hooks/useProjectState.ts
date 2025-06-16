import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';
import { useQuery } from "@tanstack/react-query";

type Project = Database['public']['Tables']['projects']['Row'];

export const useProjectState = (user: User) => {
  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const {
    data: projects = [],
    isLoading: loading,
    refetch: fetchProjectsQuery,
  } = useQuery({
    queryKey: ['projects', user.id],
    queryFn: fetchProjects,
    staleTime: 1000 * 60 * 10,
  });

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjectsWrapper = () => fetchProjectsQuery();

  return {
    projects,
    selectedProject,
    setSelectedProject,
    loading,
    fetchProjects: fetchProjectsWrapper,
  };
};
