
import { Card, CardContent } from '@/components/ui/card';
import { ModeToggle } from './ModeToggle';
import { RowTypeSelector } from '../rows/RowTypeSelector';

interface ModeHeaderProps {
  mode: 'edit' | 'make';
  onModeChange: (mode: 'edit' | 'make') => void;
  onAddRow: () => void;
  onAddNote: () => void;
  onAddDivider: () => void;
}

export const ModeHeader = ({
  mode,
  onModeChange,
  onAddRow,
  onAddNote,
  onAddDivider,
}: ModeHeaderProps) => {
  return (
    <div className="sticky top-0 z-50 bg-gray-50">
      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {mode === 'edit' ? 'Edit Mode' : 'Make Mode'}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex justify-between items-center sm:justify-start sm:gap-4">
                <ModeToggle mode={mode} onModeChange={onModeChange} />
                {mode === 'edit' && (
                  <RowTypeSelector
                    onAddRow={onAddRow}
                    onAddNote={onAddNote}
                    onAddDivider={onAddDivider}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
