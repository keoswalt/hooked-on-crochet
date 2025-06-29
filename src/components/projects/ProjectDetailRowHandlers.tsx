
import { useProjectRows } from '@/hooks/useProjectRows';
import type { Database } from '@/integrations/supabase/types';

export const useProjectDetailRowHandlers = (projectId: string, mode: 'edit' | 'make') => {
  const { 
    rows, 
    allRows,
    loading, 
    confirmDialog,
    setConfirmDialog,
    hideCompleted,
    setHideCompleted,
    hiddenCount,
    hasCompletedRows,
    inProgressIndex,
    addRow, 
    addNote, 
    addDivider, 
    updateCounter, 
    updateInstructions, 
    updateLabel, 
    updateTotalStitches, 
    updateMakeModeCounter, 
    updateMakeModeStatus, 
    toggleLock, 
    duplicateRow, 
    deleteRow, 
    reorderRows,
    updateRowImage
  } = useProjectRows(projectId, mode);

  const handleAddRow = async (insertAfterPosition?: number) => {
    try {
      await addRow(insertAfterPosition);
    } catch (error) {
      console.error("Failed to add row:", error);
    }
  };

  const handleAddNote = async (insertAfterPosition?: number) => {
    try {
      await addNote(insertAfterPosition);
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleAddDivider = async (insertAfterPosition?: number) => {
    try {
      await addDivider(insertAfterPosition);
    } catch (error) {
      console.error("Failed to add divider:", error);
    }
  };

  const handleDuplicateRow = async (rowToDuplicate: Database['public']['Tables']['project_rows']['Row']) => {
    try {
      await duplicateRow(rowToDuplicate);
    } catch (error) {
      console.error("Failed to duplicate row:", error);
    }
  };

  const handleDeleteRow = async (id: string) => {
    try {
      await deleteRow(id);
    } catch (error: any) {
      console.error("Failed to delete row:", error);
    }
  };

  const handleUpdateCounter = async (id: string, newCounter: number) => {
    await updateCounter(id, newCounter);
  };

  const handleUpdateInstructions = async (id: string, instructions: string) => {
    await updateInstructions(id, instructions);
  };

  const handleUpdateLabel = async (id: string, label: string) => {
    await updateLabel(id, label);
  };

  const handleUpdateTotalStitches = async (id: string, total_stitches: string) => {
    await updateTotalStitches(id, total_stitches);
  };

  const handleUpdateMakeModeCounter = async (id: string, make_mode_counter: number) => {
    await updateMakeModeCounter(id, make_mode_counter);
  };

  const handleUpdateMakeModeStatus = async (id: string, make_mode_status: string) => {
    await updateMakeModeStatus(id, make_mode_status);
  };

  const handleToggleLock = async (id: string, is_locked: boolean) => {
    await toggleLock(id, is_locked);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    reorderRows(result.source.index, result.destination.index);
  };

  const handleUpdateRowImage = async (id: string, imageUrl: string | null) => {
    await updateRowImage(id, imageUrl);
  };

  const handleToggleHideCompleted = () => {
    setHideCompleted(!hideCompleted);
  };

  return {
    rows,
    allRows,
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
