
import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ImageUploader, ImageUploaderRef } from '@/components/images/ImageUploader';
import { ImageViewer } from '@/components/images/ImageViewer';
import { LinkifiedText } from '@/components/ui/linkified-text';
import { CounterSection } from './CounterSection';
import type { Database } from '@/integrations/supabase/types';

type PatternRow = Database['public']['Tables']['pattern_rows']['Row'];

interface RowCardContentProps {
  row: PatternRow;
  mode: 'edit' | 'make';
  rowNumber?: number;
  userId: string;
  localInstructions: string;
  localTotalStitches: string;
  isCompleted: boolean;
  imageUploaderRef: React.RefObject<ImageUploaderRef>;
  onInstructionsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onInstructionsFocus: () => void;
  onInstructionsBlur: () => void;
  onTotalStitchesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTotalStitchesFocus: () => void;
  onTotalStitchesBlur: () => void;
  onUpdateCounter: (id: string, newCounter: number) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
  onMakeModeCounterChange: (newCounter: number) => void;
  onImageUploaded: (imageUrl: string) => void;
  onImageDelete: () => void;
}

export const RowCardContent = ({
  row,
  mode,
  rowNumber,
  userId,
  localInstructions,
  localTotalStitches,
  isCompleted,
  imageUploaderRef,
  onInstructionsChange,
  onInstructionsFocus,
  onInstructionsBlur,
  onTotalStitchesChange,
  onTotalStitchesFocus,
  onTotalStitchesBlur,
  onUpdateCounter,
  onToggleLock,
  onMakeModeCounterChange,
  onImageUploaded,
  onImageDelete
}: RowCardContentProps) => {
  const handleMakeModeCounterChange = (newCounter: number) => {
    onMakeModeCounterChange(newCounter);
  };

  return (
    <div className="space-y-3">
      <ImageUploader
        ref={imageUploaderRef}
        onImageUploaded={onImageUploaded}
        userId={userId}
        folder="rows"
        className="hidden"
        showButton={false}
        uniqueId={row.id}
      />

      {row.image_url && (
        <div className="w-full">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <ImageViewer
              imageUrl={row.image_url}
              alt={`Image for ${row.type === 'note' ? 'note' : `row ${rowNumber || row.position}`}`}
              className="w-full h-full"
              onDelete={mode === 'edit' ? onImageDelete : undefined}
            />
          </AspectRatio>
        </div>
      )}

      {mode === 'edit' ? (
        <textarea
          value={localInstructions}
          onChange={onInstructionsChange}
          onFocus={onInstructionsFocus}
          onBlur={onInstructionsBlur}
          className="w-full p-2 border rounded-md min-h-[160px] resize-none"
          placeholder={`Enter ${row.type} instructions...`}
        />
      ) : (
        <LinkifiedText 
          text={localInstructions}
          className="w-full p-2 border rounded-md min-h-[80px] bg-gray-50"
        />
      )}
      
      {row.type === 'row' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 min-w-[100px]">Total Stitches:</label>
            <Input
              type="text"
              value={localTotalStitches}
              onChange={onTotalStitchesChange}
              onFocus={onTotalStitchesFocus}
              onBlur={onTotalStitchesBlur}
              className="flex-1"
              placeholder="Enter total stitches"
              disabled={mode === 'make'}
            />
          </div>
          
          <CounterSection
            row={row}
            mode={mode}
            isCompleted={isCompleted}
            onUpdateCounter={onUpdateCounter}
            onToggleLock={onToggleLock}
            onMakeModeCounterChange={handleMakeModeCounterChange}
          />
        </div>
      )}
    </div>
  );
};
