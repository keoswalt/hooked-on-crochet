
import { Button } from '@/components/ui/button';
import { GripVertical, Copy, Trash2, Check, Image, Replace } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type PatternRow = Database['public']['Tables']['pattern_rows']['Row'];

interface RowCardHeaderProps {
  row: PatternRow;
  mode: 'edit' | 'make';
  rowNumber?: number;
  isCheckboxDisabled: boolean;
  onMakeModeCheck: () => void;
  onImageButtonClick: () => void;
  onDuplicate: (row: PatternRow) => void;
  onDeleteClick: () => void;
}

export const RowCardHeader = ({
  row,
  mode,
  rowNumber,
  isCheckboxDisabled,
  onMakeModeCheck,
  onImageButtonClick,
  onDuplicate,
  onDeleteClick
}: RowCardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {mode === 'edit' && <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />}
        {mode === 'make' && row.type !== 'divider' && (
          <button 
            onClick={onMakeModeCheck}
            disabled={isCheckboxDisabled}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              row.make_mode_status === 'complete' 
                ? 'bg-foreground border-foreground text-background' 
                : isCheckboxDisabled
                ? 'border-gray-200 bg-gray-100 cursor-not-allowed dark:border-muted-foreground/30 dark:bg-muted/50'
                : 'border-gray-300 hover:border-gray-400 dark:border-muted-foreground dark:hover:border-muted-foreground/80'
            }`}
          >
            {row.make_mode_status === 'complete' && <Check className="h-4 w-4" />}
          </button>
        )}
        <h3 className="font-semibold">
          {row.type === 'note' ? 'Note' : `Row ${rowNumber || row.position}`}
        </h3>
      </div>
      {mode === 'edit' && (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onImageButtonClick}
            className={row.image_url ? 'bg-blue-50 border-blue-200' : ''}
          >
            {row.image_url ? <Replace className="h-4 w-4" /> : <Image className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDuplicate(row)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onDeleteClick}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
