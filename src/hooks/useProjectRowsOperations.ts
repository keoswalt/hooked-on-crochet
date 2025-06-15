
import { useRowOperations } from './useRowOperations';
import { useProjectRowsDelete } from './useProjectRowsDelete';
import { useProjectRowsReorder } from './useProjectRowsReorder';
import { useProjectRowsMakeMode } from './useProjectRowsMakeMode';
import { useProjectRowsFields } from './useProjectRowsFields';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

export const useProjectRowsOperations = (
  projectId: string,
  rows: ProjectRow[],
  setRows: (rows: ProjectRow[]) => void,
  setConfirmDialog: (dialog: { open: boolean; onConfirm: () => void }) => void,
  fetchRows: () => Promise<void>
) => {
  const { addRow: addRowOperation, addNote: addNoteOperation, addDivider: addDividerOperation, duplicateRow: duplicateRowOperation, updateRowImage: updateRowImageOperation } = useRowOperations();
  const { deleteRow } = useProjectRowsDelete(rows, setRows);
  const { reorderRows } = useProjectRowsReorder(projectId, rows, setRows, fetchRows);
  const { updateMakeModeCounter, updateMakeModeStatus } = useProjectRowsMakeMode(rows, setRows, setConfirmDialog, fetchRows);
  const { updateCounter, updateInstructions, updateLabel, updateTotalStitches, toggleLock } = useProjectRowsFields(rows, setRows);

  const addRow = async (insertAfterPosition?: number) => {
    try {
      const data = await addRowOperation(projectId, rows.length, insertAfterPosition);
      
      if (insertAfterPosition !== undefined) {
        // Refresh the entire list to get updated positions
        await fetchRows();
      } else {
        setRows([...rows, data]);
      }
    } catch (error) {
      // Error already handled in useRowOperations
    }
  };

  const addNote = async (insertAfterPosition?: number) => {
    try {
      const data = await addNoteOperation(projectId, rows.length, insertAfterPosition);
      
      if (insertAfterPosition !== undefined) {
        // Refresh the entire list to get updated positions
        await fetchRows();
      } else {
        setRows([...rows, data]);
      }
    } catch (error) {
      // Error already handled in useRowOperations
    }
  };

  const addDivider = async (insertAfterPosition?: number) => {
    try {
      const data = await addDividerOperation(projectId, rows.length, insertAfterPosition);
      
      if (insertAfterPosition !== undefined) {
        // Refresh the entire list to get updated positions
        await fetchRows();
      } else {
        setRows([...rows, data]);
      }
    } catch (error) {
      // Error already handled in useRowOperations
    }
  };

  const duplicateRow = async (rowToDuplicate: ProjectRow) => {
    try {
      const data = await duplicateRowOperation(rowToDuplicate, rows.length);
      setRows([...rows, data]);
    } catch (error) {
      // Error already handled in useRowOperations
    }
  };

  const updateRowImage = async (id: string, imageUrl: string | null) => {
    try {
      await updateRowImageOperation(id, imageUrl);
      setRows(rows.map(row => row.id === id ? { ...row, image_url: imageUrl } : row));
    } catch (error) {
      // Error already handled in useRowOperations
    }
  };

  return {
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
    updateRowImage,
  };
};
