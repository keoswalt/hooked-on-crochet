
import { DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectHeader } from './ProjectHeader';
import { RowsList } from '../rows/RowsList';
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
}

export const ProjectDetail = ({ project, onBack }: ProjectDetailProps) => {
  const {
    rows,
    loading,
    addRow,
    updateCounter,
    updateInstructions,
    duplicateRow,
    deleteRow,
    reorderRows,
  } = useProjectRows(project.id);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderRows(result.source.index, result.destination.index);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} onBack={onBack} />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rows</h2>
        <Button onClick={addRow}>
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
      </div>

      <RowsList
        rows={rows}
        onDragEnd={onDragEnd}
        onUpdateCounter={updateCounter}
        onUpdateInstructions={updateInstructions}
        onDuplicate={duplicateRow}
        onDelete={deleteRow}
      />
    </div>
  );
};
