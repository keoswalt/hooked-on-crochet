
import { useState, useRef, useEffect } from 'react';
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
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

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
          {!isSticky ? (
            // Regular card header
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="py-4">
                <div className="flex flex-col space-y-4 sm:space-y-0">
                  <div className="w-full">
                    <h2 className="text-xl font-semibold">
                      {mode === 'edit' ? 'Edit Mode' : 'Make Mode'}
                    </h2>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="sm:flex-1">
                      <ModeToggle mode={mode} onModeChange={setMode} />
                    </div>
                    {mode === 'edit' && (
                      <div className="flex justify-end">
                        <RowTypeSelector
                          onAddRow={addRow}
                          onAddNote={addNote}
                          onAddDivider={addDivider}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
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

      {/* Full-width sticky header that breaks out of container */}
      {isSticky && (
        <div className="fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-200 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4 sm:space-y-0">
              <div className="w-full">
                <h2 className="text-xl font-semibold">
                  {mode === 'edit' ? 'Edit Mode' : 'Make Mode'}
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="sm:flex-1">
                  <ModeToggle mode={mode} onModeChange={setMode} />
                </div>
                {mode === 'edit' && (
                  <div className="flex justify-end">
                    <RowTypeSelector
                      onAddRow={addRow}
                      onAddNote={addNote}
                      onAddDivider={addDivider}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
