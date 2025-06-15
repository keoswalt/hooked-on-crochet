
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PatternHeader } from './PatternHeader';
import { PatternInfo } from './PatternInfo';
import { ModeHeader } from '../projects/ModeHeader';
import { RowsList } from '@/components/rows/RowsList';
import { usePatternRows } from '@/hooks/usePatternRows';
import { CustomConfirmationDialog } from '@/components/ui/custom-confirmation-dialog';
import type { Database } from '@/integrations/supabase/types';

type Pattern = Database['public']['Tables']['patterns']['Row'];

interface PatternDetailProps {
  pattern: Pattern;
  onBack: () => void;
  onPatternDelete: () => void;
  onPatternExport: () => void;
  onPatternExportPDF: () => void;
  onEditPattern: (pattern: Pattern) => void;
  onPatternUpdate: (pattern: Pattern) => void;
  onDuplicate: () => void;
  userId: string;
}

export const PatternDetail = ({
  pattern,
  onBack,
  onPatternDelete,
  onPatternExport,
  onPatternExportPDF,
  onEditPattern,
  onPatternUpdate,
  onDuplicate,
  userId,
}: PatternDetailProps) => {
  const [mode, setMode] = useState<'edit' | 'make'>(
    (pattern.last_mode as 'edit' | 'make') || 'edit'
  );

  const {
    displayedRows,
    editModeRows,
    makeModeRows,
    loading,
    hideCompleted,
    setHideCompleted,
    confirmDialog,
    setConfirmDialog,
    handleAddRow,
    handleAddNote,
    handleAddDivider,
    handleUpdateRow,
    handleDeleteRow,
    handleMoveRow,
    handleResetProgress,
    handleCompleteRow,
    handleUncompleteRow,
    handleMarkInProgress,
  } = usePatternRows(pattern.id, mode);

  const handleModeChange = async (newMode: 'edit' | 'make') => {
    setMode(newMode);
    // Update pattern's last_mode in database would go here
  };

  // Calculate helper values for RowsList
  const hiddenCount = editModeRows.length - makeModeRows.length;
  const hasCompletedRows = editModeRows.some(row => row.make_mode_status === 'completed');
  const inProgressIndex = displayedRows.findIndex(row => row.make_mode_status === 'in_progress');

  const handleDuplicateRow = async (row: Database['public']['Tables']['pattern_rows']['Row']) => {
    await handleAddRow(row.position);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Patterns
      </Button>

      {/* Pattern Header */}
      <PatternHeader
        pattern={pattern}
        onEdit={() => onEditPattern(pattern)}
        onDelete={onPatternDelete}
        onExport={onPatternExport}
        onExportPDF={onPatternExportPDF}
        onDuplicate={onDuplicate}
      />

      {/* Pattern Info */}
      <PatternInfo pattern={pattern} userId={userId} />

      {/* Mode Header */}
      <ModeHeader
        mode={mode}
        onModeChange={handleModeChange}
        onAddRow={handleAddRow}
        onAddNote={handleAddNote}
        onAddDivider={handleAddDivider}
      />

      {/* Rows List */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p>Loading pattern...</p>
            </div>
          ) : (
            <RowsList
              rows={displayedRows}
              allRows={editModeRows}
              mode={mode}
              userId={userId}
              hideCompleted={hideCompleted}
              hiddenCount={hiddenCount}
              hasCompletedRows={hasCompletedRows}
              inProgressIndex={inProgressIndex}
              onToggleHideCompleted={() => setHideCompleted(!hideCompleted)}
              onDragEnd={() => {}}
              onUpdateCounter={(id, counter) => handleUpdateRow(id, { counter })}
              onUpdateInstructions={(id, instructions) => handleUpdateRow(id, { instructions })}
              onUpdateLabel={(id, label) => handleUpdateRow(id, { label })}
              onUpdateTotalStitches={(id, total_stitches) => handleUpdateRow(id, { total_stitches })}
              onUpdateMakeModeCounter={(id, make_mode_counter) => handleUpdateRow(id, { make_mode_counter })}
              onUpdateMakeModeStatus={(id, make_mode_status) => handleUpdateRow(id, { make_mode_status })}
              onToggleLock={(id, is_locked) => handleUpdateRow(id, { is_locked })}
              onDuplicate={handleDuplicateRow}
              onDelete={handleDeleteRow}
              onUpdateRowImage={(id, image_url) => handleUpdateRow(id, { image_url })}
              onAddRow={handleAddRow}
              onAddNote={handleAddNote}
              onAddDivider={handleAddDivider}
            />
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <CustomConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />
    </div>
  );
};
