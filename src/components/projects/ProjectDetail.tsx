import { useState, useEffect } from 'react';
import { ProjectHeader } from './ProjectHeader';
import { RowsList } from '@/components/rows/RowsList';
import { RowTypeSelector } from '@/components/rows/RowTypeSelector';
import { ModeToggle } from './ModeToggle';
import { StickyModeHeader } from './StickyModeHeader';
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
}

export const ProjectDetail = ({ 
  project, 
  onBack, 
  onProjectDelete, 
  onProjectExport,
  onProjectExportPDF 
}: ProjectDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<'edit' | 'make'>('edit');
  const { rows, isLoading, error, fetchRows, handleDragEnd, updateRow } = useProjectRows(project.id, mode);
  const { addRow, addNote, addDivider, duplicateRow } = useRowOperations();

  useEffect(() => {
    fetchRows();
  }, [project.id, mode]);

  const handleAddRow = async () => {
    try {
      await addRow(project.id, rows.length);
      fetchRows();
    } catch (error) {
      console.error("Failed to add row:", error);
    }
  };

  const handleAddNote = async () => {
    try {
      await addNote(project.id, rows.length);
      fetchRows();
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleAddDivider = async () => {
    try {
      await addDivider(project.id, rows.length);
      fetchRows();
    } catch (error) {
      console.error("Failed to add divider:", error);
    }
  };

  const handleDuplicateRow = async (rowToDuplicate: Database['public']['Tables']['project_rows']['Row']) => {
    try {
      await duplicateRow(rowToDuplicate, rows.length);
      fetchRows();
    } catch (error) {
      console.error("Failed to duplicate row:", error);
    }
  };

  const handleDeleteRow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_rows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchRows();
    } catch (error: any) {
      console.error("Failed to delete row:", error);
    }
  };

  const handleUpdateCounter = async (id: string, newCounter: number) => {
    await updateRow(id, { counter: newCounter });
  };

  const handleUpdateInstructions = async (id: string, instructions: string) => {
    await updateRow(id, { instructions });
  };

  const handleUpdateLabel = async (id: string, label: string) => {
    await updateRow(id, { label });
  };

  const handleUpdateTotalStitches = async (id: string, total_stitches: number) => {
    await updateRow(id, { total_stitches });
  };

   const handleUpdateMakeModeCounter = async (id: string, make_mode_counter: number) => {
    await updateRow(id, { make_mode_counter });
  };

  const handleUpdateMakeModeStatus = async (id: string, make_mode_status: string) => {
    await updateRow(id, { make_mode_status });
  };

  const handleToggleLock = async (id: string, is_locked: boolean) => {
    await updateRow(id, { is_locked });
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <ProjectHeader 
        project={project} 
        onBack={onBack}
        onEdit={() => setIsEditing(true)}
        onDelete={onProjectDelete}
        onExport={onProjectExport}
        onExportPDF={onProjectExportPDF}
      />

      <StickyModeHeader>
        <ModeToggle mode={mode} setMode={setMode} />
        {mode === 'edit' && (
          <RowTypeSelector 
            onAddRow={handleAddRow}
            onAddNote={handleAddNote}
            onAddDivider={handleAddDivider}
          />
        )}
      </StickyModeHeader>

      <RowsList
        rows={rows}
        mode={mode}
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
      />
    </div>
  );
};
