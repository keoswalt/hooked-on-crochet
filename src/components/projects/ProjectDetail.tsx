import { ProjectHeader } from './ProjectHeader';
import { RowsList } from '@/components/rows/RowsList';
import { ModeHeader } from './ModeHeader';
import { CustomConfirmationDialog } from '@/components/ui/custom-confirmation-dialog';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { useProjectDetailState } from './ProjectDetailState';
import { useProjectDetailRowHandlers } from './ProjectDetailRowHandlers';
import { useProjectDetailActions } from './ProjectDetailActions';
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
  onDuplicate: () => void;
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
  onDuplicate,
  userId
}: ProjectDetailProps) => {
  const {
    project,
    mode,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleModeChange,
    handleProjectUpdate,
  } = useProjectDetailState({ initialProject, onProjectUpdate });

  const {
    rows,
    loading,
    confirmDialog,
    setConfirmDialog,
    hideCompleted,
    hiddenCount,
    inProgressIndex,
    handleToggleHideCompleted,
    handleAddRow,
    handleAddNote,
    handleAddDivider,
    handleDuplicateRow,
    handleDeleteRow,
    handleUpdateCounter,
    handleUpdateInstructions,
    handleUpdateLabel,
    handleUpdateTotalStitches,
    handleUpdateMakeModeCounter,
    handleUpdateMakeModeStatus,
    handleToggleLock,
    handleDragEnd,
    handleUpdateRowImage,
  } = useProjectDetailRowHandlers(project.id);

  const {
    handleDeleteProject,
    confirmDeleteProject,
    handleEditProject,
  } = useProjectDetailActions({
    project,
    onProjectDelete,
    onEditProject,
    setShowDeleteConfirm,
  });

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
        onDuplicate={onDuplicate}
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
        hideCompleted={hideCompleted}
        hiddenCount={hiddenCount}
        inProgressIndex={inProgressIndex}
        onToggleHideCompleted={handleToggleHideCompleted}
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
        onAddRow={handleAddRow}
        onAddNote={handleAddNote}
        onAddDivider={handleAddDivider}
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
