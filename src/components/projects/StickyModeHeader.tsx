
import { Card, CardContent } from '@/components/ui/card';
import { ModeToggle } from './ModeToggle';
import { RowTypeSelector } from '../rows/RowTypeSelector';

interface StickyModeHeaderProps {
  mode: 'edit' | 'make';
  isSticky: boolean;
  onModeChange: (mode: 'edit' | 'make') => void;
  onAddRow: () => void;
  onAddNote: () => void;
  onAddDivider: () => void;
}

export const StickyModeHeader = ({
  mode,
  isSticky,
  onModeChange,
  onAddRow,
  onAddNote,
  onAddDivider,
}: StickyModeHeaderProps) => {
  const headerContent = (
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
  );

  return (
    <>
      {!isSticky && (
        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardContent className="py-4">
            {headerContent}
          </CardContent>
        </Card>
      )}

      {isSticky && (
        <div className="fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-200 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            {headerContent}
          </div>
        </div>
      )}
    </>
  );
};
