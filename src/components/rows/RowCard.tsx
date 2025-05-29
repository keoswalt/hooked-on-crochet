
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Copy, Trash, Image, Lock, Unlock, Plus, Minus } from 'lucide-react';
import { ImageUploader } from '@/components/images/ImageUploader';
import { ImageViewer } from '@/components/images/ImageViewer';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
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
  onUpdateTotalStitches: (id: string, totalStitches: number) => void;
  onUpdateMakeModeCounter: (id: string, newCounter: number) => void;
  onUpdateMakeModeStatus: (id: string, status: string) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
  onDuplicate: (row: ProjectRow) => void;
  onDelete: (id: string) => void;
  onUpdateRowImage: (id: string, imageUrl: string | null) => void;
}

export const RowCard: React.FC<RowCardProps> = ({
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
}) => {
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempInstructions, setTempInstructions] = useState(row.instructions);
  const [tempLabel, setTempLabel] = useState(row.label || '');
  const [tempTotalStitches, setTempTotalStitches] = useState(row.total_stitches);
  const imageUploaderRef = useRef<any>(null);
  const { toast } = useToast();

  const handleEditClick = () => {
    if (mode === 'edit') {
      setIsEditing(!isEditing);
      if (isEditing) {
        // Save changes
        onUpdateInstructions(row.id, tempInstructions);
        onUpdateLabel(row.id, tempLabel);
        onUpdateTotalStitches(row.id, tempTotalStitches);
      } else {
        // Reset temp values when starting edit
        setTempInstructions(row.instructions);
        setTempLabel(row.label || '');
        setTempTotalStitches(row.total_stitches);
      }
    }
  };

  const handleDeleteClick = () => {
    onDelete(row.id);
  };

  const handleDuplicateClick = () => {
    onDuplicate(row);
  };

  const handleCounterChange = (increment: boolean) => {
    const newCounter = increment ? row.counter + 1 : Math.max(1, row.counter - 1);
    onUpdateCounter(row.id, newCounter);
  };

  const handleMakeModeCounterChange = (increment: boolean) => {
    const newCounter = increment ? row.make_mode_counter + 1 : Math.max(0, row.make_mode_counter - 1);
    onUpdateMakeModeCounter(row.id, newCounter);
  };

  const handleStatusChange = (checked: boolean) => {
    const newStatus = checked ? 'complete' : 'in_progress';
    onUpdateMakeModeStatus(row.id, newStatus);
  };

  const handleLockToggle = () => {
    onToggleLock(row.id, !row.is_locked);
  };

  const handleImageClick = () => {
    if (row.image_url) {
      setShowReplaceDialog(true);
    } else {
      imageUploaderRef.current?.triggerUpload();
    }
  };

  const handleReplaceConfirm = () => {
    imageUploaderRef.current?.triggerUpload();
    setShowReplaceDialog(false);
  };

  const handleImageUpload = (imageUrl: string) => {
    onUpdateRowImage(row.id, imageUrl);
    toast({
      title: "Image uploaded",
      description: "The image has been uploaded successfully.",
    });
  };

  const handleImageDelete = async () => {
    await onUpdateRowImage(row.id, null);
    toast({
      title: "Image deleted",
      description: "The image has been deleted successfully.",
    });
  };

  const getCardBorderClass = () => {
    if (mode === 'make') {
      if (row.make_mode_status === 'complete') return 'border-green-500';
      if (row.make_mode_status === 'in_progress') return 'border-blue-500';
    }
    return 'border-gray-200';
  };

  const getCardBackgroundClass = () => {
    if (mode === 'make') {
      if (row.make_mode_status === 'complete') return 'bg-green-50';
      if (row.make_mode_status === 'in_progress') return 'bg-blue-50';
    }
    return 'bg-white';
  };

  return (
    <Card className={`w-full shadow-sm border-2 ${getCardBorderClass()} ${getCardBackgroundClass()}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Row header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {row.type === 'row' && rowNumber && (
                  <span className="font-semibold text-gray-900">Row {rowNumber}</span>
                )}
                {row.type === 'note' && (
                  <span className="font-semibold text-blue-600">Note</span>
                )}
                {row.type === 'divider' && (
                  <span className="font-semibold text-gray-500">Divider</span>
                )}
                
                {mode === 'edit' && row.type === 'row' && (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCounterChange(false)}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {row.counter}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCounterChange(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {mode === 'make' && (row.type === 'row' || row.type === 'note') && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={row.make_mode_status === 'complete'}
                      onCheckedChange={handleStatusChange}
                      disabled={row.make_mode_status === 'not_started'}
                    />
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMakeModeCounterChange(false)}
                        className="h-6 w-6 p-0"
                        disabled={row.make_mode_status !== 'in_progress'}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {row.make_mode_counter}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMakeModeCounterChange(true)}
                        className="h-6 w-6 p-0"
                        disabled={row.make_mode_status !== 'in_progress'}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {row.is_locked && (
                  <Lock className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>

            {/* Content */}
            {row.type === 'divider' ? (
              <div className="border-t-2 border-gray-300 my-4" />
            ) : (
              <div className="space-y-2">
                {mode === 'edit' && isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={tempInstructions}
                      onChange={(e) => setTempInstructions(e.target.value)}
                      placeholder="Enter instructions..."
                      className="min-h-[80px]"
                    />
                    <Input
                      value={tempLabel}
                      onChange={(e) => setTempLabel(e.target.value)}
                      placeholder="Label (optional)"
                    />
                    {row.type === 'row' && (
                      <Input
                        type="number"
                        value={tempTotalStitches}
                        onChange={(e) => setTempTotalStitches(parseInt(e.target.value) || 0)}
                        placeholder="Total stitches"
                        min="0"
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                      {row.instructions || 'No instructions'}
                    </div>
                    {row.label && (
                      <div className="text-xs text-gray-500 mt-1">
                        Label: {row.label}
                      </div>
                    )}
                    {row.type === 'row' && row.total_stitches > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Total stitches: {row.total_stitches}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Image display */}
            {row.image_url && (
              <div className="mt-3">
                <ImageViewer
                  imageUrl={row.image_url}
                  alt={`Row ${rowNumber || row.counter} image`}
                  className="w-full max-w-xs h-32 rounded-lg"
                  onDelete={handleImageDelete}
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          {mode === 'edit' && (
            <div className="flex flex-col space-y-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="p-2"
                title={isEditing ? "Save changes" : "Edit row"}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDuplicateClick}
                className="p-2"
                title="Duplicate row"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="p-2"
                title="Delete row"
              >
                <Trash className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageClick}
                className="p-2"
                title={row.image_url ? "Replace image" : "Add image"}
              >
                <Image className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLockToggle}
                className="p-2"
                title={row.is_locked ? "Unlock row" : "Lock row"}
              >
                {row.is_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Image uploader (hidden) */}
      <ImageUploader
        ref={imageUploaderRef}
        onImageUploaded={handleImageUpload}
        userId={userId}
        folder="rows"
        className="hidden"
        showUploadButton={false}
      />

      {/* Replace image confirmation dialog */}
      <ConfirmationDialog
        open={showReplaceDialog}
        onOpenChange={setShowReplaceDialog}
        title="Replace Image"
        description="This will delete the current image and replace it with a new one. This action cannot be undone."
        onConfirm={handleReplaceConfirm}
        confirmText="Replace"
        cancelText="Cancel"
      />
    </Card>
  );
};
