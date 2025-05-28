
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { RowCard } from './RowCard';

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

interface RowsListProps {
  rows: ProjectRow[];
  mode: 'edit' | 'make';
  onDragEnd: (result: DropResult) => void;
  onUpdateCounter: (id: string, newCounter: number) => void;
  onUpdateInstructions: (id: string, instructions: string) => void;
  onUpdateMakeModeCounter: (id: string, newCounter: number) => void;
  onUpdateMakeModeStatus: (id: string, status: string) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
  onDuplicate: (row: ProjectRow) => void;
  onDelete: (id: string) => void;
}

export const RowsList = ({
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
}: RowsListProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="rows" isDropDisabled={mode === 'make'}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {rows.map((row, index) => (
              <Draggable key={row.id} draggableId={row.id} index={index} isDragDisabled={mode === 'make'}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${snapshot.isDragging ? 'opacity-75' : ''}`}
                  >
                    <RowCard
                      row={row}
                      mode={mode}
                      onUpdateCounter={onUpdateCounter}
                      onUpdateInstructions={onUpdateInstructions}
                      onUpdateMakeModeCounter={onUpdateMakeModeCounter}
                      onUpdateMakeModeStatus={onUpdateMakeModeStatus}
                      onToggleLock={onToggleLock}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {rows.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">
                    {mode === 'edit' 
                      ? "No rows yet. Add your first row to get started!" 
                      : "This project doesn't have any rows yet. Switch to Edit mode to add some."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
