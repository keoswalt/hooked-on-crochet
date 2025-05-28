
import { Card, CardContent } from '@/components/ui/card';
import { ModeToggle } from './ModeToggle';
import { RowTypeSelector } from '../rows/RowTypeSelector';

interface StickyHeaderProps {
  mode: 'edit' | 'make';
  isSticky: boolean;
  onModeChange: (mode: 'edit' | 'make') => void;
  onAddRow: () => void;
  onAddNote: () => void;
  onAddDivider: () => void;
}

export const StickyHeader = ({ 
  mode, 
  isSticky, 
  onModeChange, 
  onAddRow, 
  onAddNote, 
  onAddDivider 
}: StickyHeaderProps) => {
  const headerContent = (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
      <h2 className="text-xl font-semibold">
        {mode === 'edit' ? 'Edit Mode' : 'Make Mode'}
      </h2>
      <div className="flex justify-between sm:justify-start sm:gap-4 lg:gap-4">
        <div className="flex-shrink-0">
          <ModeToggle mode={mode} onModeChange={onModeChange} />
        </div>
        {mode === 'edit' && (
          <div className="flex-shrink-0">
            <RowTypeSelector
              onAddRow={onAddRow}
              onAddNote={onAddNote}
              onAddDivider={onAddDivider}
            />
          </div>
        )}
      </div>
    </div>
  );

  console.log('StickyHeader rendering with isSticky:', isSticky);

  return (
    <>
      {/* Non-sticky header - shows in card format */}
      {!isSticky && (
        <div className="sticky top-0 z-10">
          <Card className="border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="py-4">
              {headerContent}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sticky header - full width when header goes out of view */}
      {isSticky && (
        <div className="fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-200 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            {headerContent}
          </div>
        </div>
      )}
    </>
  );
};
