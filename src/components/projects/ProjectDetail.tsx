
import { useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectHeader } from './ProjectHeader';
import { ModeToggle } from './ModeToggle';
import { RowTypeSelector } from '../rows/RowTypeSelector';
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
  const [mode, setMode] = useState<'edit' | 'make'>('edit');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  return (
    <div className="space-y-6">
      <ProjectHeader 
        project={project} 
        onBack={onBack} 
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
      />

      <div className="sticky top-0 z-10">
        <Card className="border border-gray-200 rounded-lg shadow-sm data-[stuck=true]:border-l-0 data-[stuck=true]:border-r-0 data-[stuck=true]:rounded-none data-[stuck=true]:w-screen data-[stuck=true]:relative data-[stuck=true]:left-1/2 data-[stuck=true]:right-1/2 data-[stuck=true]:-ml-[50vw] data-[stuck=true]:-mr-[50vw] data-[stuck=true]:bg-white">
          <CardContent className="py-4">
            <div className="flex justify-between items-center max-w-full mx-auto px-4">
              <h2 className="text-xl font-semibold">
                {mode === 'edit' ? 'Edit Mode' : 'Make Mode'}
              </h2>
              <div className="flex items-center gap-4">
                <ModeToggle mode={mode} onModeChange={setMode} />
                {mode === 'edit' && (
                  <RowTypeSelector
                    onAddRow={addRow}
                    onAddNote={addNote}
                    onAddDivider={addDivider}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RowsList
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
  );
};
