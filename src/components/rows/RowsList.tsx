
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { RowCard } from './RowCard';

interface ProjectRow {
  id: string;
  position: number;
  instructions: string;
  counter: number;
}

interface RowsListProps {
  rows: ProjectRow[];
  onDragEnd: (result: DropResult) => void;
  onUpdateCounter: (id: string, newCounter: number) => void;
  onUpdateInstructions: (id: string, instructions: string) => void;
  onDuplicate: (row: ProjectRow) => void;
  onDelete: (id: string) => void;
}

export const RowsList = ({
  rows,
  onDragEnd,
  onUpdateCounter,
  onUpdateInstructions,
  onDuplicate,
  onDelete
}: RowsListProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="rows">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {rows.map((row, index) => (
              <Draggable key={row.id} draggableId={row.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${snapshot.isDragging ? 'opacity-75' : ''}`}
                  >
                    <RowCard
                      row={row}
                      onUpdateCounter={onUpdateCounter}
                      onUpdateInstructions={onUpdateInstructions}
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
                  <p className="text-gray-500">No rows yet. Add your first row to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
