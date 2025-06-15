import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ImageUploaderRef } from '@/components/images/ImageUploader';
import { useImageOperations } from '@/hooks/useImageOperations';
import { useToast } from '@/hooks/use-toast';
import { DividerCard } from './DividerCard';
import { RowCardHeader } from './RowCardHeader';
import { RowCardContent } from './RowCardContent';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

interface RowCardProps {
  row: ProjectRow;
  mode: 'edit' | 'make';
  rowNumber?: number;
  userId: string;
  onUpdateCounter: (id: string, newCounter: number) => void;
  onUpdateInstructions: (id: string, instructions: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdateTotalStitches: (id: string, totalStitches: string) => void;
  onUpdateMakeModeCounter: (id: string, newCounter: number) => void;
  onUpdateMakeModeStatus: (id: string, status: string) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
  onDuplicate: (row: ProjectRow) => void;
  onDelete: (id: string) => void;
  onUpdateRowImage: (id: string, imageUrl: string | null) => void;
}

// Debounce function
const useDebounce = (callback: Function, delay: number) => {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: any[]) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    const timer = setTimeout(() => callback(...args), delay);
    setDebounceTimer(timer);
  }, [callback, delay, debounceTimer]);

  return debouncedCallback;
};

export const RowCard = ({ 
  row, 
  mode,
  rowNumber,
  userId,
  onUpdateCounter, 
  onUpdateInstructions,
  onUpdateLabel,
  onUpdateTotalStitches,
  onUpdateMakeModeCounter,
  onUpdateMakeModeStatus,
  onToggleLock,
  onDuplicate, 
  onDelete,
  onUpdateRowImage
}: RowCardProps) => {
  const [localInstructions, setLocalInstructions] = useState(row.instructions);
  const [localTotalStitches, setLocalTotalStitches] = useState(row.total_stitches || '');
  const [localLabel, setLocalLabel] = useState(row.label || '');
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const { deleteImage } = useImageOperations();
  const { toast } = useToast();
  const imageUploaderRef = useRef<ImageUploaderRef>(null);

  // Update local state when row prop changes, but only if user is not actively editing that field
  useEffect(() => {
    if (focusedField !== 'instructions' && localInstructions !== row.instructions) {
      setLocalInstructions(row.instructions);
    }
    if (focusedField !== 'totalStitches' && localTotalStitches !== (row.total_stitches || '')) {
      setLocalTotalStitches(row.total_stitches || '');
    }
    if (focusedField !== 'label' && localLabel !== (row.label || '')) {
      setLocalLabel(row.label || '');
    }
  }, [row.instructions, row.total_stitches, row.label, focusedField]);

  // Debounced function to update instructions in database
  const debouncedUpdateInstructions = useDebounce((id: string, instructions: string) => {
    onUpdateInstructions(id, instructions);
  }, 500);

  // Debounced function to update label in database
  const debouncedUpdateLabel = useDebounce((id: string, label: string) => {
    onUpdateLabel(id, label);
  }, 500);

  // Debounced function to update total stitches in database
  const debouncedUpdateTotalStitches = useDebounce((id: string, totalStitches: string) => {
    onUpdateTotalStitches(id, totalStitches);
  }, 500);

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalInstructions(newValue);
    debouncedUpdateInstructions(row.id, newValue);
  };

  const handleInstructionsFocus = () => {
    setFocusedField('instructions');
  };

  const handleInstructionsBlur = () => {
    setFocusedField(null);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalLabel(newValue);
    debouncedUpdateLabel(row.id, newValue);
  };

  const handleLabelFocus = () => {
    setFocusedField('label');
  };

  const handleLabelBlur = () => {
    setFocusedField(null);
  };

  const handleTotalStitchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalTotalStitches(value);
    debouncedUpdateTotalStitches(row.id, value);
  };

  const handleTotalStitchesFocus = () => {
    setFocusedField('totalStitches');
  };

  const handleTotalStitchesBlur = () => {
    setFocusedField(null);
  };

  const handleMakeModeCheck = () => {
    if (row.make_mode_status === 'complete') {
      onUpdateMakeModeStatus(row.id, 'in_progress');
    } else {
      onUpdateMakeModeStatus(row.id, 'complete');
    }
  };

  const handleMakeModeCounterChange = (newCounter: number) => {
    onUpdateMakeModeCounter(row.id, newCounter);
    if (newCounter >= row.counter && row.make_mode_status !== 'complete') {
      onUpdateMakeModeStatus(row.id, 'complete');
    }
  };

  // Determine card styling based on make mode status
  const getCardStyling = () => {
    // Add darker background for dividers in edit mode
    if (row.type === 'divider' && mode === 'edit') {
      return 'bg-gray-800 border-gray-600';
    }
    
    if (mode !== 'make') return '';
    
    switch (row.make_mode_status) {
      case 'complete':
        return 'bg-muted border-muted-foreground/30';
      case 'in_progress':
        return 'bg-white border-blue-300 shadow-lg ring-2 ring-blue-200 dark:bg-card dark:border-blue-400 dark:ring-blue-300';
      case 'not_started':
        return 'bg-gray-50 border-gray-200 opacity-60 dark:bg-muted/50 dark:border-muted-foreground/20';
      default:
        return '';
    }
  };

  const handleImageButtonClick = () => {
    if (row.image_url) {
      setShowReplaceConfirm(true);
    } else {
      imageUploaderRef.current?.triggerUpload();
    }
  };

  const handleReplaceConfirm = () => {
    setShowReplaceConfirm(false);
    // Immediately trigger file upload without deleting existing image
    imageUploaderRef.current?.triggerUpload();
  };

  const handleImageUploaded = async (imageUrl: string) => {
    // If there's an existing image, delete it first
    if (row.image_url) {
      await deleteImage(row.image_url);
    }
    // Update with the new image
    onUpdateRowImage(row.id, imageUrl);
  };

  const handleImageDelete = async () => {
    if (row.image_url) {
      const success = await deleteImage(row.image_url);
      if (success) {
        onUpdateRowImage(row.id, null);
        // Reset the input after deletion
        imageUploaderRef.current?.resetInput();
      }
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(row.id);
    setShowDeleteConfirm(false);
  };

  // Render divider
  if (row.type === 'divider') {
    return (
      <DividerCard
        row={row}
        mode={mode}
        localLabel={localLabel}
        onLabelChange={handleLabelChange}
        onLabelFocus={handleLabelFocus}
        onLabelBlur={handleLabelBlur}
        onDuplicate={onDuplicate}
        onDeleteClick={handleDeleteClick}
        cardStyling={getCardStyling()}
      />
    );
  }

  const isCompleted = mode === 'make' && row.make_mode_status === 'complete';
  const isCheckboxDisabled = mode === 'make' && row.make_mode_status === 'not_started';

  return (
    <Card className={`mb-3 ${getCardStyling()}`}>
      <CardHeader className="pb-3">
        <RowCardHeader
          row={row}
          mode={mode}
          rowNumber={rowNumber}
          isCheckboxDisabled={isCheckboxDisabled}
          onMakeModeCheck={handleMakeModeCheck}
          onImageButtonClick={handleImageButtonClick}
          onDuplicate={onDuplicate}
          onDeleteClick={handleDeleteClick}
        />
      </CardHeader>
      <CardContent className="pt-0">
        <RowCardContent
          row={row}
          mode={mode}
          rowNumber={rowNumber}
          userId={userId}
          localInstructions={localInstructions}
          localTotalStitches={localTotalStitches}
          isCompleted={isCompleted}
          imageUploaderRef={imageUploaderRef}
          onInstructionsChange={handleInstructionsChange}
          onInstructionsFocus={handleInstructionsFocus}
          onInstructionsBlur={handleInstructionsBlur}
          onTotalStitchesChange={handleTotalStitchesChange}
          onTotalStitchesFocus={handleTotalStitchesFocus}
          onTotalStitchesBlur={handleTotalStitchesBlur}
          onUpdateCounter={onUpdateCounter}
          onToggleLock={onToggleLock}
          onMakeModeCounterChange={handleMakeModeCounterChange}
          onImageUploaded={handleImageUploaded}
          onImageDelete={handleImageDelete}
        />
      </CardContent>

      <ConfirmationDialog
        open={showReplaceConfirm}
        onOpenChange={setShowReplaceConfirm}
        title="Replace existing image?"
        description="Select a new image to replace the current one. The existing image will be deleted once you select a new one."
        onConfirm={handleReplaceConfirm}
        confirmText="Choose New Image"
        cancelText="Cancel"
      />

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete row?"
        description="This will permanently delete this row and all its content. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Card>
  );
};
