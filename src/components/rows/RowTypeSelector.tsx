
import { Button } from '@/components/ui/button';
import { Plus, FileText, Minus } from 'lucide-react';

interface RowTypeSelectorProps {
  onAddRow: () => void;
  onAddNote: () => void;
  onAddDivider: () => void;
}

export const RowTypeSelector = ({ onAddRow, onAddNote, onAddDivider }: RowTypeSelectorProps) => {
  return (
    <div className="flex gap-2">
      <Button onClick={onAddRow}>
        <Plus className="h-4 w-4 mr-2" />
        Add Row
      </Button>
      <Button variant="outline" onClick={onAddNote}>
        <FileText className="h-4 w-4 mr-2" />
        Add Note
      </Button>
      <Button variant="outline" onClick={onAddDivider}>
        <Minus className="h-4 w-4 mr-2" />
        Add Divider
      </Button>
    </div>
  );
};
