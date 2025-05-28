
import { DropResult } from 'react-beautiful-dnd';
import { RowsList } from '../rows/RowsList';

interface ProjectRow {
  id: string;
  position: number;
  instructions: string;
  counter: number;
  type: string;
  make_mode_counter: number;
  make_mode_status: string;
  is_locked: boolean;
}

interface ProjectDetailContentProps {
  rows: ProjectRow[];
  mode: 'edit' | 'make';
  onDragEnd: (result: DropResult) => void;
  onUpdateCounter: (id: string, counter: number) => void;
  onUpdateInstructions: (id: string, instructions: string) => void;
  onUpdateMakeModeCounter: (id: string, counter: number) => void;
  onUpdateMakeModeStatus: (id: string, status: string) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
  onDuplicate: (row: ProjectRow) => void;
  onDelete: (id: string) => void;
}

export const ProjectDetailContent = ({
  rows,
  mode,
  onDragEnd,
  onUpdateCounter,
  onUpdateInstructions,
  onUpdateMakeModeCounter,
  onUpdateMakeModeStatus,
  onToggleLock,
  onDuplicate,
  onDelete
}: ProjectDetailContentProps) => {
  return (
    <RowsList
      rows={rows}
      mode={mode}
      onDragEnd={onDragEnd}
      onUpdateCounter={onUpdateCounter}
      onUpdateInstructions={onUpdateInstructions}
      onUpdateMakeModeCounter={onUpdateMakeModeCounter}
      onUpdateMakeModeStatus={onUpdateMakeModeStatus}
      onToggleLock={onToggleLock}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
    />
  );
};
