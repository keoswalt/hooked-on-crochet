import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectHeader } from './ProjectHeader';
import { RowsList } from '@/components/rows/RowsList';
import { RowTypeSelector } from '@/components/rows/RowTypeSelector';
import { ModeToggle } from './ModeToggle';
import { ModeHeader } from './ModeHeader';
import { CustomConfirmationDialog } from '@/components/ui/custom-confirmation-dialog';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { useProjectRows } from '@/hooks/useProjectRows';
import { useRowOperations } from '@/hooks/useRowOperations';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onProjectDelete: () => void;
  onProjectExport: () => void;
  onProjectExportPDF: () => void;
  onEditProject: (project: Project) => void;
  onProjectUpdate?: (updatedProject: Project) => void;
  userId: string;
}

export const ProjectDetail = ({ 
  project: initialProject, 
  onBack, 
  onProjectDelete, 
  onProjectExport,
  onProjectExportPDF,
  onEditProject,
  onProjectUpdate,
  userId
}: ProjectDetailProps) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [mode, setMode] = useState<'edit' | 'make'>('edit');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { 
    rows, 
    loading, 
    confirmDialog,
    setConfirmDialog,
    addRow, 
    addNote, 
    addDivider, 
    updateCounter, 
    updateInstructions, 
    updateLabel, 
    updateTotalStitches, 
    updateMakeModeCounter, 
    updateMakeModeStatus, 
    toggleLock, 
    duplicateRow, 
    deleteRow, 
    reorderRows,
    updateRowImage
  } = useProjectRows(project.id);

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

  const handleAddRow = async () => {
    try {
      await addRow();
    } catch (error) {
      console.error("Failed to add row:", error);
    }
  };

  const handleAddNote = async () => {
    try {
      await addNote();
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleAddDivider = async () => {
    try {
      await addDivider();
    } catch (error) {
      console.error("Failed to add divider:", error);
    }
  };

  const handleDuplicateRow = async (rowToDuplicate: Database['public']['Tables']['project_rows']['Row']) => {
    try {
      await duplicateRow(rowToDuplicate);
    } catch (error) {
      console.error("Failed to duplicate row:", error);
    }
  };

  const handleDeleteRow = async (id: string) => {
    try {
      await deleteRow(id);
    } catch (error: any) {
      console.error("Failed to delete row:", error);
    }
  };

  const handleUpdateCounter = async (id: string, newCounter: number) => {
    await updateCounter(id, newCounter);
  };

  const handleUpdateInstructions = async (id: string, instructions: string) => {
    await updateInstructions(id, instructions);
  };

  const handleUpdateLabel = async (id: string, label: string) => {
    await updateLabel(id, label);
  };

  const handleUpdateTotalStitches = async (id: string, total_stitches: number) => {
    await updateTotalStitches(id, total_stitches);
  };

  const handleUpdateMakeModeCounter = async (id: string, make_mode_counter: number) => {
    await updateMakeModeCounter(id, make_mode_counter);
  };

  const handleUpdateMakeModeStatus = async (id: string, make_mode_status: string) => {
    await updateMakeModeStatus(id, make_mode_status);
  };

  const handleToggleLock = async (id: string, is_locked: boolean) => {
    await toggleLock(id, is_locked);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    reorderRows(result.source.index, result.destination.index);
  };

  const handleDeleteProject = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProject = () => {
    onProjectDelete();
    setShowDeleteConfirm(false);
  };

  const handleEditProject = () => {
    onEditProject(project);
  };

  const handleUpdateRowImage = async (id: string, imageUrl: string | null) => {
    await updateRowImage(id, imageUrl);
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ProjectHeader 
        project={project} 
        onBack={onBack}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        onExport={onProjectExport}
        onExportPDF={onProjectExportPDF}
        onProjectUpdate={handleProjectUpdate}
        userId={userId}
      />

      <ModeHeader
        mode={mode}
        onModeChange={handleModeChange}
        onAddRow={handleAddRow}
        onAddNote={handleAddNote}
        onAddDivider={handleAddDivider}
      />

      <RowsList
        rows={rows}
        mode={mode}
        userId={userId}
        onDragEnd={handleDragEnd}
        onUpdateCounter={handleUpdateCounter}
        onUpdateInstructions={handleUpdateInstructions}
        onUpdateLabel={handleUpdateLabel}
        onUpdateTotalStitches={handleUpdateTotalStitches}
        onUpdateMakeModeCounter={handleUpdateMakeModeCounter}
        onUpdateMakeModeStatus={handleUpdateMakeModeStatus}
        onToggleLock={handleToggleLock}
        onDuplicate={handleDuplicateRow}
        onDelete={handleDeleteRow}
        onUpdateRowImage={handleUpdateRowImage}
      />

      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDeleteProject}
      />

      <CustomConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
};
