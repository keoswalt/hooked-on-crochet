
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectDetailStateProps {
  initialProject: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export const useProjectDetailState = ({ initialProject, onProjectUpdate }: ProjectDetailStateProps) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [mode, setMode] = useState<'edit' | 'make'>('edit');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update project state when initialProject changes
  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  // Load saved mode from project preferences
  useEffect(() => {
    const loadProjectMode = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('last_mode')
          .eq('id', project.id)
          .single();

        if (error) throw error;
        if (data?.last_mode) {
          setMode(data.last_mode as 'edit' | 'make');
        }
      } catch (error) {
        console.error('Error loading project mode:', error);
      }
    };

    loadProjectMode();
  }, [project.id]);

  // Save mode when it changes
  const handleModeChange = async (newMode: 'edit' | 'make') => {
    setMode(newMode);
    
    try {
      await supabase
        .from('projects')
        .update({ last_mode: newMode })
        .eq('id', project.id);
    } catch (error) {
      console.error('Error saving project mode:', error);
    }
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    console.log('Project updated in detail view:', updatedProject);
    setProject(updatedProject);
    
    // Also notify parent component
    if (onProjectUpdate) {
      onProjectUpdate(updatedProject);
    }
  };

  return {
    project,
    mode,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleModeChange,
    handleProjectUpdate,
  };
};
