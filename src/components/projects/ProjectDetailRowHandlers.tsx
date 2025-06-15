
import { usePatternRows } from '@/hooks/usePatternRows';
import type { Database } from '@/integrations/supabase/types';

export const useProjectDetailRowHandlers = (projectId: string, mode: 'edit' | 'make') => {
  const { 
    displayedRows,
    editModeRows,
    makeModeRows, 
    loading, 
    confirmDialog,
    setConfirmDialog,
    hideCompleted,
    setHideCompleted,
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
    reorderPositions,
  } = usePatternRows(projectId, mode);

  const handleDuplicateRow = async (rowToDuplicate: Database['public']['Tables']['pattern_rows']['Row']) => {
    try {
      await handleAddRow(rowToDuplicate.position);
    } catch (error) {
      console.error("Failed to duplicate row:", error);
    }
  };

  const handleUpdateCounter = async (id: string, newCounter: number) => {
    await handleUpdateRow(id, { counter: newCounter });
  };

  const handleUpdateInstructions = async (id: string, instructions: string) => {
    await handleUpdateRow(id, { instructions });
  };

  const handleUpdateLabel = async (id: string, label: string) => {
    await handleUpdateRow(id, { label });
  };

  const handleUpdateTotalStitches = async (id: string, total_stitches: string) => {
    await handleUpdateRow(id, { total_stitches });
  };

  const handleUpdateMakeModeCounter = async (id: string, make_mode_counter: number) => {
    await handleUpdateRow(id, { make_mode_counter });
  };

  const handleUpdateMakeModeStatus = async (id: string, make_mode_status: string) => {
    await handleUpdateRow(id, { make_mode_status });
  };

  const handleToggleLock = async (id: string, is_locked: boolean) => {
    await handleUpdateRow(id, { is_locked });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    // Implement drag reordering logic here if needed
    reorderPositions();
  };

  const handleUpdateRowImage = async (id: string, imageUrl: string | null) => {
    await handleUpdateRow(id, { image_url: imageUrl });
  };

  const handleToggleHideCompleted = () => {
    setHideCompleted(!hideCompleted);
  };

  // Calculate additional properties for the rows list
  const hiddenCount = editModeRows.length - makeModeRows.length;
  const hasCompletedRows = editModeRows.some(row => row.make_mode_status === 'completed');
  const inProgressIndex = displayedRows.findIndex(row => row.make_mode_status === 'in_progress');

  return {
    rows: displayedRows,
    allRows: editModeRows,
    loading,
    confirmDialog,
    setConfirmDialog,
    hideCompleted,
    hiddenCount,
    hasCompletedRows,
    inProgressIndex,
    handleToggleHideCompleted,
    handleAddRow,
    handleAddNote,
    handleAddDivider,
    handleDuplicateRow,
    handleDeleteRow,
    handleUpdateCounter,
    handleUpdateInstructions,
    handleUpdateLabel,
    handleUpdateTotalStitches,
    handleUpdateMakeModeCounter,
    handleUpdateMakeModeStatus,
    handleToggleLock,
    handleDragEnd,
    handleUpdateRowImage,
  };
};
