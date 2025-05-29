
import { useState, useRef, useEffect } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { ProjectHeader } from './ProjectHeader';
import { StickyModeHeader } from './StickyModeHeader';
import { RowsList } from '../rows/RowsList';
import { ProjectForm } from './ProjectForm';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { CustomConfirmationDialog } from '@/components/ui/custom-confirmation-dialog';
import { useProjectRows } from '@/hooks/useProjectRows';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onProjectUpdate?: (updatedProject: Project) => void;
  onProjectDelete?: () => void;
}

export const ProjectDetail = ({ project, onBack, onProjectUpdate, onProjectDelete }: ProjectDetailProps) => {
  // Get the last saved mode for this project, defaulting to 'edit'
  const getInitialMode = (): 'edit' | 'make' => {
    const savedMode = localStorage.getItem(`project-mode-${project.id}`);
    return (savedMode === 'make' || savedMode === 'edit') ? savedMode : 'edit';
  };

  const [mode, setMode] = useState<'edit' | 'make'>(getInitialMode);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Save mode to localStorage whenever it changes
  const handleModeChange = (newMode: 'edit' | 'make') => {
    setMode(newMode);
    localStorage.setItem(`project-mode-${project.id}`, newMode);
  };

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
  } = useProjectRows(project.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { 
        threshold: 0,
        rootMargin: '0px'
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || mode === 'make') return;
    reorderRows(result.source.index, result.destination.index);
  };

  const handleEditProject = () => {
    setShowEditForm(true);
  };

  const handleDeleteProject = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (onProjectDelete) {
      onProjectDelete();
    }
    setShowDeleteDialog(false);
  };

  const handleProjectSave = (updatedData: any) => {
    setShowEditForm(false);
    if (onProjectUpdate) {
      onProjectUpdate({ ...project, ...updatedData });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (showEditForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setShowEditForm(false)}>
            ← Back to Project
          </Button>
        </div>
        <ProjectForm
          project={project}
          onSave={handleProjectSave}
          onCancel={() => setShowEditForm(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <ProjectHeader 
          project={project} 
          onBack={onBack} 
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
        />

        {/* Sentinel element to detect when header should become sticky */}
        <div ref={sentinelRef} className="h-0" />

        <div className="sticky top-0 z-10">
          <StickyModeHeader
            mode={mode}
            isSticky={isSticky}
            onModeChange={handleModeChange}
            onAddRow={addRow}
            onAddNote={addNote}
            onAddDivider={addDivider}
          />
        </div>

        <RowsList
          rows={rows}
          mode={mode}
          onDragEnd={onDragEnd}
          onUpdateCounter={updateCounter}
          onUpdateInstructions={updateInstructions}
          onUpdateLabel={updateLabel}
          onUpdateTotalStitches={updateTotalStitches}
          onUpdateMakeModeCounter={updateMakeModeCounter}
          onUpdateMakeModeStatus={updateMakeModeStatus}
          onToggleLock={toggleLock}
          onDuplicate={duplicateRow}
          onDelete={deleteRow}
        />

        <CustomConfirmationDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          onConfirm={confirmDialog.onConfirm}
        />

        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Project"
          description="Are you sure you want to delete this project? This action cannot be undone and will remove all rows and progress data."
          onConfirm={handleConfirmDelete}
          confirmText="Delete Project"
          cancelText="Cancel"
        />
      </div>
    </>
  );
};
