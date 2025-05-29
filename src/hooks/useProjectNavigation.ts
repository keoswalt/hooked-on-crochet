
import { useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

export const useProjectNavigation = () => {
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'form'>('list');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [returnToDetail, setReturnToDetail] = useState(false);

  const navigateToList = () => {
    setCurrentView('list');
    setEditingProject(null);
    setReturnToDetail(false);
  };

  const navigateToDetail = (project: Project) => {
    setCurrentView('detail');
  };

  const navigateToForm = (project?: Project) => {
    setEditingProject(project || null);
    setReturnToDetail(currentView === 'detail');
    setCurrentView('form');
  };

  const handleFormCancel = (selectedProject: Project | null) => {
    if (returnToDetail && selectedProject) {
      setCurrentView('detail');
    } else {
      setCurrentView('list');
    }
    setEditingProject(null);
    setReturnToDetail(false);
  };

  const handleFormSave = (selectedProject: Project | null, savedProject?: Project) => {
    if (returnToDetail && savedProject) {
      setCurrentView('detail');
    } else {
      setCurrentView('list');
    }
    setEditingProject(null);
    setReturnToDetail(false);
    return savedProject;
  };

  return {
    currentView,
    editingProject,
    returnToDetail,
    navigateToList,
    navigateToDetail,
    navigateToForm,
    handleFormCancel,
    handleFormSave,
  };
};
