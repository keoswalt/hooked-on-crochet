
import { useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { ProjectHeader } from './ProjectHeader';
import { StickyHeader } from './StickyHeader';
import { ProjectDetailContent } from './ProjectDetailContent';
import { ProjectConfirmationDialogs } from './ProjectConfirmationDialogs';
import { ProjectForm } from './ProjectForm';
import { useStickyHeader } from './useStickyHeader';
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
  const [mode, setMode] = useState<'edit' | 'make'>('edit');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { isSticky, sentinelRef } = useStickyHeader();

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
    updateMakeModeCounter,
    updateMakeModeStatus,
    toggleLock,
    duplicateRow,
    deleteRow,
    reorderRows,
  } = useProjectRows(project.id);

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

  console.log('Rendering ProjectDetail with isSticky:', isSticky);

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
        <div ref={sentinelRef} className="h-0" style={{ backgroundColor: 'red', height: '1px' }} />

        <StickyHeader
          mode={mode}
          isSticky={isSticky}
          onModeChange={setMode}
          onAddRow={addRow}
          onAddNote={addNote}
          onAddDivider={addDivider}
        />

        <ProjectDetailContent
          rows={rows}
          mode={mode}
          onDragEnd={onDragEnd}
          onUpdateCounter={updateCounter}
          onUpdateInstructions={updateInstructions}
          onUpdateMakeModeCounter={updateMakeModeCounter}
          onUpdateMakeModeStatus={updateMakeModeStatus}
          onToggleLock={toggleLock}
          onDuplicate={duplicateRow}
          onDelete={deleteRow}
        />

        <ProjectConfirmationDialogs
          confirmDialog={confirmDialog}
          showDeleteDialog={showDeleteDialog}
          onConfirmDialogChange={setConfirmDialog}
          onDeleteDialogChange={setShowDeleteDialog}
          onConfirmDelete={handleConfirmDelete}
        />
      </div>
    </>
  );
};
