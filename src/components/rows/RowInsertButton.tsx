
import { RowTypeSelector } from './RowTypeSelector';

interface RowInsertButtonProps {
  insertAfterPosition: number;
  onAddRow: (insertAfterPosition?: number) => void;
  onAddNote: (insertAfterPosition?: number) => void;
  onAddDivider: (insertAfterPosition?: number) => void;
}

export const RowInsertButton = ({ 
  insertAfterPosition, 
  onAddRow, 
  onAddNote, 
  onAddDivider 
}: RowInsertButtonProps) => {
  const handleAddRow = () => onAddRow(insertAfterPosition);
  const handleAddNote = () => onAddNote(insertAfterPosition);
  const handleAddDivider = () => onAddDivider(insertAfterPosition);

  return (
    <div className="flex justify-center my-2">
      <RowTypeSelector
        onAddRow={handleAddRow}
        onAddNote={handleAddNote}
        onAddDivider={handleAddDivider}
      />
    </div>
  );
};
