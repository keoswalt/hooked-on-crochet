import { ProjectHeader } from './ProjectHeader';
import { RowsList } from '@/components/rows/RowsList';
import { ModeHeader } from './ModeHeader';
import { CustomConfirmationDialog } from '@/components/ui/custom-confirmation-dialog';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { useProjectDetailState } from './ProjectDetailState';
import { useProjectDetailRowHandlers } from './ProjectDetailRowHandlers';
import { useProjectDetailActions } from './ProjectDetailActions';
import type { Database } from '@/integrations/supabase/types';
import { ProjectPlansSection } from "@/components/projects/ProjectPlansSection";
import type { User } from "@supabase/supabase-js";

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
  userId,
}: ProjectDetailProps) => {
  // Load context
  // eslint-disable-next-line
  const user = { id: userId } as User;
  // Try to get current page info for breadcrumbs
  const currentPage = {
    label: initialProject.name,
    path: `/projects/${initialProject.id}`,
  };

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
    allRows,
    loading,
    confirmDialog,
    setConfirmDialog,
    hideCompleted,
    hiddenCount,
    hasCompletedRows,
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
  } = useProjectDetailRowHandlers(project.id, mode);

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

      {/* Plans attached to this project, if any */}
      <ProjectPlansSection project={project} user={user} currentPage={currentPage} />

      <ModeHeader
        mode={mode}
        onModeChange={handleModeChange}
        onAddRow={handleAddRow}
        onAddNote={handleAddNote}
        onAddDivider={handleAddDivider}
      />

      <RowsList
        rows={rows}
        allRows={allRows}
        mode={mode}
        userId={userId}
        hideCompleted={hideCompleted}
        hiddenCount={hiddenCount}
        hasCompletedRows={hasCompletedRows}
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
