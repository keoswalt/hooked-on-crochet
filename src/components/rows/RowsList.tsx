
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { RowCard } from './RowCard';
import { RowInsertButton } from './RowInsertButton';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

interface RowsListProps {
  rows: ProjectRow[];
  allRows: ProjectRow[]; // All rows for consistent numbering
  mode: 'edit' | 'make';
  userId: string;
  hideCompleted: boolean;
  hiddenCount: number;
  hasCompletedRows: boolean;
  inProgressIndex: number;
  onToggleHideCompleted: () => void;
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
  onAddRow: (insertAfterPosition?: number) => void;
  onAddNote: (insertAfterPosition?: number) => void;
  onAddDivider: (insertAfterPosition?: number) => void;
}

export const RowsList = ({
  rows,
  allRows,
  mode,
  userId,
  hideCompleted,
  hiddenCount,
  hasCompletedRows,
  inProgressIndex,
  onToggleHideCompleted,
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
  onUpdateRowImage,
  onAddRow,
  onAddNote,
  onAddDivider
}: RowsListProps) => {
  // Calculate row numbers based on all rows (not filtered) for consistent numbering
  const getRowNumber = (currentRow: ProjectRow): number | undefined => {
    if (currentRow.type !== 'row') return undefined;
    
    const currentIndex = allRows.findIndex(row => row.id === currentRow.id);
    if (currentIndex === -1) return undefined;
    
    let rowCount = 0;
    for (let i = 0; i <= currentIndex; i++) {
      if (allRows[i].type === 'row') {
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
              <div key={row.id}>
                {mode === 'make' && index === inProgressIndex && hasCompletedRows && (
                  <div className="mb-3">
                    <Button
                      variant="ghost"
                      onClick={onToggleHideCompleted}
                      className="w-full flex items-center justify-center gap-2 h-8 text-sm"
                    >
                      {hideCompleted ? (
                        <>
                          <EyeIcon className="h-4 w-4" />
                          Show {hiddenCount} completed {hiddenCount === 1 ? 'row' : 'rows'}
                        </>
                      ) : (
                        <>
                          <EyeOffIcon className="h-4 w-4" />
                          Hide completed rows
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <Draggable draggableId={row.id} index={index} isDragDisabled={mode === 'make'}>
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
                        rowNumber={getRowNumber(row)}
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
                {mode === 'edit' && (
                  <RowInsertButton
                    insertAfterPosition={row.position}
                    onAddRow={onAddRow}
                    onAddNote={onAddNote}
                    onAddDivider={onAddDivider}
                  />
                )}
              </div>
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
