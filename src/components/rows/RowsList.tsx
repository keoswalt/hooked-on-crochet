
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { RowCard } from './RowCard';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

interface RowsListProps {
  rows: ProjectRow[];
  mode: 'edit' | 'make';
  userId: string;
  onDragEnd: (result: DropResult) => void;
  onUpdateCounter: (id: string, newCounter: number) => void;
  onUpdateInstructions: (id: string, instructions: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdateTotalStitches: (id: string, totalStitches: string) => void;
  onUpdateMakeModeCounter: (id: string, newCounter: number) => void;
  onUpdateMakeModeStatus: (id: string, status: string) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
  onDuplicate: (row: ProjectRow) => void;
  onDelete: (id: string) => void;
  onUpdateRowImage: (id: string, imageUrl: string | null) => void;
}

export const RowsList = ({
  rows,
  mode,
  userId,
  onDragEnd,
  onUpdateCounter,
  onUpdateInstructions,
  onUpdateLabel,
  onUpdateTotalStitches,
  onUpdateMakeModeCounter,
  onUpdateMakeModeStatus,
  onToggleLock,
  onDuplicate,
  onDelete,
  onUpdateRowImage
}: RowsListProps) => {
  // Calculate row numbers for actual rows (excluding notes and dividers)
  const getRowNumber = (currentIndex: number): number | undefined => {
    const currentRow = rows[currentIndex];
    if (currentRow.type !== 'row') return undefined;
    
    let rowCount = 0;
    for (let i = 0; i <= currentIndex; i++) {
      if (rows[i].type === 'row') {
        rowCount++;
      }
    }
    return rowCount;
  };

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
                      rowNumber={getRowNumber(index)}
                      userId={userId}
                      onUpdateCounter={onUpdateCounter}
                      onUpdateInstructions={onUpdateInstructions}
                      onUpdateLabel={onUpdateLabel}
                      onUpdateTotalStitches={onUpdateTotalStitches}
                      onUpdateMakeModeCounter={onUpdateMakeModeCounter}
                      onUpdateMakeModeStatus={onUpdateMakeModeStatus}
                      onToggleLock={onToggleLock}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                      onUpdateRowImage={onUpdateRowImage}
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
