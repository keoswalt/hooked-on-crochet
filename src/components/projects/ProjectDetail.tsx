
import { useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { ProjectHeader } from './ProjectHeader';
import { ModeToggle } from './ModeToggle';
import { RowTypeSelector } from '../rows/RowTypeSelector';
import { RowsList } from '../rows/RowsList';
import { ProjectForm } from './ProjectForm';
import { useProjectRows } from '@/hooks/useProjectRows';

interface Project {
  id: string;
  name: string;
  hook_size: string;
  yarn_weight: string;
  details?: string;
}

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export const ProjectDetail = ({ project, onBack, onProjectUpdate }: ProjectDetailProps) => {
  const [mode, setMode] = useState<'edit' | 'make'>('edit');
  const [showEditForm, setShowEditForm] = useState(false);

  const {
    rows,
    loading,
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
      <ProjectHeader project={project} onBack={onBack} onEdit={handleEditProject} />

      <div className="flex justify-between items-center">
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
    </div>
  );
};
